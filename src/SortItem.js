import React, { Component } from 'react'

/**
 * 当检测到鼠标按下并移动一段距离时，发送位置给父组件，将此组件位置从队列脱离，修改身后组件的坐标
 * 松开鼠标后，判断位置，修改坐标到合适位置，同时修改身后组件位置
 */
export default class SortItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...this.props.item
        }
        this._startMove = this._startMove.bind(this)
        this._move = this._move.bind(this)
        this._endMove = this._endMove.bind(this)
        this.addStateQueue = this.addStateQueue.bind(this)
        this.clearQueue = this.clearQueue.bind(this)
        this.start = false
        this.move = false
        this.stateQueue = []
    }
    componentWillReceiveProps() {
        //次数判断，如果当前组件没有移动，则重新渲染，否则不渲染

    }
    _startMove(e) {
        this.start = true
        this.move = false
        //初始化位置
        this.startX = e.clientX
        this.startY = e.clientY
        document.addEventListener('mouseup', this._endMove) //全局监听松开鼠标事件
    }
    _move(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.start) {
            //判断差值
            let dx = e.clientX - this.startX
            let dy = e.clientY - this.startY
            this.startX = e.clientX
            this.startY = e.clientY
            //判断是否产生移动
            if (!this.move && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) { //初次移动
                this.move = true
                let { index, top, left } = this.state
                //通知父元素重排
                this.props.change({
                    index,
                    top,
                    left
                }, true)
            } else {
                if (this.props.click) {
                    this.props.click()
                }
            }
            if (this.move) {
                this.addStateQueue({
                    top: this.state.top + dy,
                    left: this.state.left + dx,
                })
            }
        }
    }
    _endMove() {
        this.start = false
        this.move = false
        let { index, top, left } = this.state
        //通知父元素重排
        this.props.change({
            index,
            top,
            left
        })
    }
    addStateQueue(item) {
        this.stateQueue.push(item)
        this.clearQueue()
    }
    clearQueue() {
        if (this.clearing) return
        this.clearing = true
        let item = this.stateQueue.shift()
        this.setState(item, _ => {
            if (this.stateQueue.length) {
                this.clearQueue()
            } else {
                this.clearing = false
            }
        })
    }
    render() {
        let item = this.state
        return (
            <div className={"sort-item" + (this.move ? ' move-item' : '')}
                style={{
                    transform: `translate3d(${item.left}px, ${item.top}px, 0)`,
                }}
                onMouseDown={this._startMove}
                onMouseMove={this._move}
            >{item.el}</div>
        )
    }
}