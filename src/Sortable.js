import React, {
    Component
} from 'react'
import ReactDOM from 'react-dom'
import SortItem from './SortItem'

export default class Sortable extends Component {
    constructor(props) {
        super(props)
        this._init = this._init.bind(this)
        this._Calc = this._Calc.bind(this)
        this._itemChange = this._itemChange.bind(this)
        this._arrangeList = this._arrangeList.bind(this)
        this.state = {
            items: [],
            movingItem: null //用于生成额外对比元素(待定)
        }
        this.padding = this.props.pad || 0
        this.dom = React.createRef()
    }
    componentDidMount() {
        this._init()
    }
    _init() {
        this.cols = this.props.cols || 4
        //获取父元素宽度
        this.domRect = this.dom.current.getBoundingClientRect()
        this.colWidth = (this.domRect.width / this.cols)
        //获取子元素数量
        let children = this.props.children
        let len = children.length
        //计算行数
        this.rows = Math.ceil(len / this.cols);
        //设置dom高度
        this.dom.current.style.setProperty('height', `${this.rows * ((this.props.height || 40) + this.padding * 2)}px`)
        //计算每个元素的相应位置
        this._arrangeList(children)
    }
    _arrangeList(list) {
        let cols = this.cols
        let rows = this.rows
        //元素重排
        let posArr = []
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (list.length < (i * cols + j + 1)) {
                    break
                }
                posArr.push(Object.assign(this._Calc(i, j, list[i * cols + j]), {
                    index: i * cols + j
                }))
            }
        }
        this.setState({
            items: posArr
        })
    }
    _Calc(row, col, el) {
        let height = (this.props.height || 40) + this.padding * 2
        let width = this.colWidth
        // 返回一个 包含元素信息的对象
        return {
            top: row * height + this.padding,
            left: col * width + this.padding,
            el,
            id: Math.random().toString(32).substr(2)
        }
    }
    _itemChange({
        index,
        top,
        left,
        id
    }, isStart) {
        /**
         * 此处逻辑为: 1. 开始时通知，重排位置(排除当前元素) 2. 结束时判断放置位置，位置全部重排(包括移动元素)
         */
        if (isStart) {
            let items = this.state.items.slice()
            let {
                top,
                left
            } = items.find(i => i.index === index)
            let tempPos = {
                top,
                left
            }
            let sortItems = items.map(v => ({
                top: v.top,
                left: v.left,
                index: v.index
            }))
            sortItems.sort((x, y) => x.index - y.index)
            items.forEach(item => {
                if (item.index > index) {
                    item.top = sortItems[item.index - 1].top
                    item.left = sortItems[item.index - 1].left
                    item.index--
                }
            })
            this.setState({
                items
            })
        } else {
            let _items = this.state.items.map((v, index) => Object.assign(v, {
                dom: ReactDOM.findDOMNode(this['childRef' + index].current)
            }))
            //储存目标元素
            let target = this.state.items.find(i => i.index === index)
            let targetRect = target.dom.getBoundingClientRect()
            //获取剩下的数组
            let items_ = _items.filter(v => v.id !== id)
            //在其中找到放置坐标
            //判断规则，移动元素的四个角的方向最长值， 即 左上对数组中相应元素的右下， 左下对右上....
            //左上 右上 右下 左上
            let directions = [{
                x: left,
                y: top
            },
            {
                x: left + targetRect.width,
                y: top
            },
            {
                x: left + targetRect.width,
                y: top + targetRect.height
            },
            {
                x: left,
                y: top + targetRect.height
            }
            ]
            let colWidth = this.colWidth
            let rowHeight = (this.props.height || 40)
            items_.forEach((item, idx) => {
                directions.forEach(direct => {
                    if (direct.el) return
                    if (item.top < direct.y &&
                        item.left < direct.x &&
                        (item.left + colWidth) > direct.x &&
                        (item.top + rowHeight) > direct.y) {
                        direct.el = item
                        direct.index = idx
                    }
                })
            })
            //找到四个角后，判断最大值
            let toIndex = -1
            let validList = directions.filter(v => v.el)
            let checkNum = validList.length
            let getXY = (item, rect, type) => {
                switch (type) {
                    case 1:
                        return {
                            x: item.left,
                            y: item.top
                        }
                    case 2:
                        return {
                            x: item.left + rect.width,
                            y: item.top
                        }
                    case 3:
                        return {
                            x: item.left + rect.width,
                            y: item.top + rect.height
                        }
                    case 4:
                        return {
                            x: item.left,
                            y: item.top + rect.height
                        }
                    default:
                        break
                }
            }
            let getPostOrigin = el => (idx, type) => getXY(el(idx), el(idx).dom.getBoundingClientRect(), type)
            let getLenOrigin = validList => (pos, idx) => {
                let x = Math.abs(pos.x - validList[idx].x) ** 2
                let y = Math.abs(pos.y - validList[idx].y) ** 2
                return x + y
            }
            //判断边界
            if (checkNum === 0) {
                //没有接触元素，此时index等于队列末尾
                toIndex = items_.length
            } else if (checkNum === 1) {
                //一个元素，则此元素坐标即为
                toIndex = validList[0].el.index
            } else if (checkNum === 2) {
                //此时判断，如果是左边没有， 则判断上下边，然后取最大值的最左侧，其余同理
                const getPos = getPostOrigin(_ => directions[_].el)
                const getLen = getLenOrigin(directions)
                let pos1;
                let pos2;
                let px = 0
                let py = 0
                if (directions[0].el && directions[1].el) {
                    pos1 = getPos(0, 3)
                    pos2 = getPos(1, 4)
                    px = 0
                    py = 1
                } else if (directions[2].el && directions[3].el) {
                    pos1 = getPos(2, 1)
                    pos2 = getPos(3, 2)
                    px = 2
                    py = 3
                } else if (directions[1].el && directions[2].el) {
                    pos1 = getPos(1, 4)
                    pos2 = getPos(2, 1)
                    px = 1
                    py = 2
                } else {
                    pos1 = getPos(0, 3)
                    pos2 = getPos(3, 2)
                    px = 0
                    py = 3
                }
                let l1 = getLen(pos1, px)
                let l2 = getLen(pos2, py)
                toIndex = l1 > l2 ? directions[px].el.index : directions[py].el.index
            } else {
                //判断缺失位置
                let cornerInverse = [3, 4, 1, 2]
                const getPos = getPostOrigin(_ => directions[_].el)
                const getLen = getLenOrigin(directions)
                let maxInfo = null
                let halfLen = (this.colWidth / 2) ** 2 + ((this.props.height || 40) / 2) ** 2
                directions.forEach((d, i) => {
                    let len = 0
                    if (d.el) {
                        let pos = getPos(i, cornerInverse[i])
                        len = getLen(pos, i)
                    } else {
                        let reverseIdx = i => i % 2 ? i ^ 4 : i ^ 2
                        let ri = reverseIdx(i)
                        let pos_ = getPos(ri, ri + 1)
                        len = getLen(pos_, ri)
                    }
                    if (!maxInfo || (maxInfo.len < len)) {
                        maxInfo = {
                            len,
                            index: d.el ? d.el.index : items_.length
                        }
                    }
                })
                toIndex = maxInfo.index
            }
            //移动目标元素到新位置
            // items.splice(toIndex, 0, target)
            // this._arrangeList(items.map(v => v.el))
            let oldItems = this.state.items.slice();
            // let sortList = oldItems.map(v => ({
            //     top: v.top,
            //     left: v.left,
            //     index: v.index
            // })).filter(x => x.index !== index)
            // sortList.sort((a, b) => a.index - b.index)
            toIndex = Math.min(toIndex, oldItems.length - 1)
            let filterItems = oldItems.filter(x => x.id != id)
            filterItems.sort((x, y) => x.index - y.index)
            let tItem = oldItems.find(x => x.id === id)
            if (toIndex === oldItems.length - 1) {
                let tempItem = this._Calc(parseInt(toIndex / this.cols, 10), toIndex % this.cols, null)
                tItem.top = tempItem.top
                tItem.left = tempItem.left
            } else {
                tItem.top = filterItems[toIndex].top
                tItem.left = filterItems[toIndex].left
            }
            tItem.index = toIndex
            // 判断整个数组index
            // from > to ? [to,) +1 : [- to) -1 & (to, ) +1
            filterItems.forEach((item, i) => {
                let nextItem = null
                if(item.index >= toIndex){
                    nextItem = filterItems[item.index + 1]
                }else{
                    return 
                }
                if (!nextItem) {
                    nextItem = Object.assign(this._Calc(parseInt(filterItems.length / this.cols, 10), filterItems.length % this.cols, null), {
                        index: filterItems.length
                    })
                }
                item.top = nextItem.top
                item.left = nextItem.left
                item.index = nextItem.index

            })

            //---废弃
            //获取位置
            // let tidx = oldItems.findIndex(i => i.id === tId)
            // oldItems[index].top = items_[tidx].top
            // oldItems[index].left = items_[tidx].left
            // oldItems[index].index = tidx
            // for(var i = tidx, j = tidx;i < items_.length;i++, j++){
            //     if(j === index) j++;
            //     if(i + 1<items_.length){
            //         oldItems[j].top = items_[i + 1].top
            //         oldItems[j].left = items_[i + 1].left
            //         oldItems[j].index = (i + 1)
            //     }else{
            //         let obj = this._Calc(parseInt((j+1)/this.cols, 10), j%this.cols, null)
            //         oldItems[j].top = obj.top
            //         oldItems[j].left = obj.left
            //         oldItems[j].index = j
            //     }
            // }
            // if(index + 1 === oldItems.length){
            //     let temp = this._Calc(parseInt(index/ this.cols, 10), index%this.cols, null)
            //     oldItems[index - 1].top = temp.top                
            //     oldItems[index - 1].left = temp.left                
            //     oldItems[index - 1].index = index                
            // }
            this.setState({
                items: oldItems
            })
        }
    }
    render() {
        //根据items生成子组件
        let arr = this.state.items.filter(v => v.el).concat(this.state.movingItem || []).map((item, itemIdx) => {
            if (!this['childRef' + itemIdx]) this['childRef' + itemIdx] = React.createRef()
            let p = <SortItem {...item} change={this._itemChange} key={item.id} ref={this['childRef' + itemIdx]} />
            return p
        })
        return (
            <div className="sort-wrap" ref={this.dom}  >
                {
                    arr
                }
            </div>
        )
    }
}