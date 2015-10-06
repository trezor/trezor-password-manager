"use strict";

var React = require('react'),
    Router = require('react-router'),
    {Spring} = require("react-motion"),
    range = require("lodash.range"),
    DataService = require('../../components/data_service'),
    {Link} = Router,
    springConfig = [300, 41],
    itemsCount = 4,

    PasswordTable = React.createClass({

        getInitialState() {
            return {
                trezorCredentials: window.trezorResponse,
                delta: 0,
                mouse: 0,
                isPressed: false,
                lastPressed: 0,
                order: range(itemsCount),
                active: 0,
                tags: {}
            }
        },

        componentWillMount() {
            DataService.getUserTagsTest().then(response => {
                this.setState({
                    tags: response.tags,
                    active: Object.getOwnPropertyDescriptor(response.tags, this.state.active).value.name
                });
            });
            this.props.eventEmitter.on('changeTag', this.changeTag);
        },

        changeTag(e) {
            this.setState({
                active: Object.getOwnPropertyDescriptor(this.state.tags, e).value.name
            });
        },

        handleTouchStart(key, pressLocation, e) {
            this.handleMouseDown(key, pressLocation, e.touches[0]);
        },

        handleTouchMove(e) {
            e.preventDefault();
            this.handleMouseMove(e.touches[0]);
        },

        handleMouseDown(pos, pressY, {pageY}) {
            this.setState({
                delta: pageY - pressY,
                mouse: pressY,
                isPressed: true,
                lastPressed: pos
            });
        },

        handleMouseMove({pageY}) {
            const {isPressed, delta, order, lastPressed} = this.state;
            if (isPressed) {
                const mouse = pageY - delta;
                const row = this.clamp(Math.round(mouse / 41), 0, itemsCount - 1);
                const newOrder = this.reinsert(order, order.indexOf(lastPressed), row);
                this.setState({mouse: mouse, order: newOrder});
            }
        },

        handleMouseUp() {
            this.setState({isPressed: false, delta: 0});
        },

        reinsert(arr, from, to) {
            const _arr = arr.slice(0);
            const val = _arr[from];
            _arr.splice(from, 1);
            _arr.splice(to, 0, val);
            return _arr;
        },

        clamp(n, min, max) {
            return Math.max(Math.min(n, max), min);
        },

        addDragOrder() {
            window.addEventListener('touchmove', this.handleTouchMove);
            window.addEventListener('touchend', this.handleMouseUp);
            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        },

        removeDragOrder() {
            window.removeEventListener('touchmove', this.handleTouchMove);
            window.removeEventListener('touchend', this.handleMouseUp);
            window.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('mouseup', this.handleMouseUp);
        },


        render(){
            const {mouse, isPressed, lastPressed, order} = this.state;
            const endValue = range(itemsCount).map(i => {
                if (lastPressed === i && isPressed) {
                    return {
                        scale: {val: 1.04, config: springConfig},
                        shadow: {val: 12, config: springConfig},
                        y: {val: mouse, config: []},
                    };
                }
                return {
                    scale: {val: 1, config: springConfig},
                    shadow: {val: 0, config: springConfig},
                    y: {val: order.indexOf(i) * 41, config: springConfig}
                };
            });

            return (
                <div className="wraper container-fluid">
                    <div className="row">
                        <div className="col-sm-6">
                            <div className="page-title">
                                <h3 className="title">{this.state.active}</h3>
                            </div>
                        </div>
                        <div className="col-sm-6 text-right">
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className='dashboard'>
                                <Spring endValue={endValue}>
                                    {items =>
                                        <div className="order-list">
                                            {items.map(({scale, shadow, y}, n) =>
                                                    <div
                                                        key={n}
                                                        className="order-list-item"
                                                        onMouseDown={this.handleMouseDown.bind(null, n, y.val)}
                                                        onTouchStart={this.handleTouchStart.bind(null, n, y.val)}
                                                        style={{
                  boxShadow: `rgba(0, 0, 0, 0.1) 0px ${shadow.val}px ${2 * shadow.val}px 0px`,
                  transform: `translate3d(0, ${y.val}px, 0) scale(${scale.val})`,
                  WebkitTransform: `translate3d(0, ${y.val}px, 0) scale(${scale.val})`,
                  zIndex: n === lastPressed ? 99 : n,
                }}>
                                                        {order.indexOf(n) + 1}
                                                    </div>
                                            )}
                                        </div>
                                    }
                                </Spring>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    });

module.exports = PasswordTable;
