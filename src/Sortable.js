import React, { Component } from 'react'
import SortItem from './SortItem'

export default class Sortable extends Component {
    constructor(props) {
        super(props)
        this._init = this._init.bind(this)
        this._Calc = this._Calc.bind(this)
        this._itemChange = this._itemChange.bind(this)
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
        let cols = this.props.cols || 4
        //获取父元素宽度
        this.domRect = this.dom.current.getBoundingClientRect()
        this.colWidth = (this.domRect.width / cols)
        //获取子元素数量
        let children = this.props.children
        let len = children.length
        //计算行数
        let rows = Math.ceil(len / cols);
        //设置dom高度
        this.dom.current.style.setProperty('height', `${rows *  ((this.props.height || 40) + this.padding * 2)}px`)
        //计算每个元素的相应位置
        let posArr = []
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                posArr.push(Object.assign(this._Calc(i, j, children[i * cols + j]), { index: i * cols + j }))
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
        }
    }
    _itemChange({index, top, left}, isStart){
        /**
         * 此处逻辑为: 1. 开始时通知，重排位置(排除当前元素) 2. 结束时判断放置位置，位置全部重排(包括移动元素)
         */
        let items = this.state.items.slice()
        if(isStart){
             
        }else{

        }
    }
    render() {
        //根据items生成子组件
        let arr = this.state.items.filter(v => v.el).concat(this.state.movingItem || []).map(item => {
            let p = <SortItem item={item} change={this._itemChange} key={item.index}/>
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