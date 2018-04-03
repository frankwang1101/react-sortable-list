import React, { Component } from 'react'
import SortItem from './SortItem'

export default class Sortable extends Component {
    constructor(props) {
        super(props)
        this._init = this._init.bind(this)
        this._Calc = this._Calc.bind(this)
        this._itemChange = this._itemChange.bind(this)
        this._arrangeList = this._arrangeList.bind(this)
        this.dom = React.createRef()
        this.state = {
            items: [],
            movingItem: null //用于生成额外对比元素(待定)
        }
        this.padding = this.props.pad || 0
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
        this.dom.current.style.setProperty('height', `${this.rows *  ((this.props.height || 40) + this.padding * 2)}px`)
        //计算每个元素的相应位置
        this._arrangeList(children)
    }
    _arrangeList(list){
        let cols = this.cols
        let rows = this.rows
        //元素重排
        let posArr = []
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                posArr.push(Object.assign(this._Calc(i, j, list[i * cols + j]), { index: i * cols + j }))
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
    _itemChange({index, top, left}, isStart){
        /**
         * 此处逻辑为: 1. 开始时通知，重排位置(排除当前元素) 2. 结束时判断放置位置，位置全部重排(包括移动元素)
         */
        let items = this.state.items.slice()
        if(isStart){
            let { top, left } = items[index]
            let tempPos = {
                top,
                left
            }
            for(let i=index+1;i<items.length;i++){
                let tTop = items[i].top
                let tLeft = items[i].left
                items[i].top = tempPos.top
                items[i].left = tempPos.left
                tempPos = {
                    top: tTop,
                    left: tLeft
                }
            }
            this.setState({ items })
        }else{
            //储存目标元素
            let target = this.state.items[index]            
            //获取剩下的数组
            let items = this.state.items.filter((v, i) => v.index !== index) 
            //在其中找到放置坐标
            let currentIdx = items.findIndex(item => item.top < top && item.left < left && (item.left + this.colWidth) > left && (item.top + this.cols.height || 40) > top)
            //移动目标元素到新位置
            items.splice(currentIdx, 0, target)
            this._arrangeList(items.map(v => v.el))
        }
    }
    render() {
        //根据items生成子组件
        let arr = this.state.items.filter(v => v.el).concat(this.state.movingItem || []).map(item => {
            let p = <SortItem {...item} change={this._itemChange} key={item.index}/>
            return p
        })
        return (
            <div className="sort-wrap" ref={this.dom} >
                {
                    arr
                }
            </div>
        )
    }
}