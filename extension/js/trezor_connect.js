(function webpackUniversalModuleDefinition(root, factory) {
    if(typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if(typeof define === 'function' && define.amd)
        define("TrezorConnect", [], factory);
    else if(typeof exports === 'object')
        exports["TrezorConnect"] = factory();
    else
        root["TrezorConnect"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
    return /******/ (function(modules) { // webpackBootstrap
      /******/ 	// The module cache
      /******/ 	var installedModules = {};
      /******/
      /******/ 	// The require function
      /******/ 	function __webpack_require__(moduleId) {
        /******/
        /******/ 		// Check if module is in cache
        /******/ 		if(installedModules[moduleId]) {
          /******/ 			return installedModules[moduleId].exports;
          /******/ 		}
        /******/ 		// Create a new module (and put it into the cache)
        /******/ 		var module = installedModules[moduleId] = {
          /******/ 			i: moduleId,
          /******/ 			l: false,
          /******/ 			exports: {}
          /******/ 		};
        /******/
        /******/ 		// Execute the module function
        /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/
        /******/ 		// Flag the module as loaded
        /******/ 		module.l = true;
        /******/
        /******/ 		// Return the exports of the module
        /******/ 		return module.exports;
        /******/ 	}
      /******/
      /******/
      /******/ 	// expose the modules object (__webpack_modules__)
      /******/ 	__webpack_require__.m = modules;
      /******/
      /******/ 	// expose the module cache
      /******/ 	__webpack_require__.c = installedModules;
      /******/
      /******/ 	// define getter function for harmony exports
      /******/ 	__webpack_require__.d = function(exports, name, getter) {
        /******/ 		if(!__webpack_require__.o(exports, name)) {
          /******/ 			Object.defineProperty(exports, name, {
            /******/ 				configurable: false,
            /******/ 				enumerable: true,
            /******/ 				get: getter
            /******/ 			});
          /******/ 		}
        /******/ 	};
      /******/
      /******/ 	// getDefaultExport function for compatibility with non-harmony modules
      /******/ 	__webpack_require__.n = function(module) {
        /******/ 		var getter = module && module.__esModule ?
            /******/ 			function getDefault() { return module['default']; } :
            /******/ 			function getModuleExports() { return module; };
        /******/ 		__webpack_require__.d(getter, 'a', getter);
        /******/ 		return getter;
        /******/ 	};
      /******/
      /******/ 	// Object.prototype.hasOwnProperty.call
      /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
      /******/
      /******/ 	// __webpack_public_path__
      /******/ 	__webpack_require__.p = "./";
      /******/
      /******/ 	// Load entry module and return exports
      /******/ 	return __webpack_require__(__webpack_require__.s = 565);
      /******/ })
    /************************************************************************/
    /******/ ([
      /* 0 */,
      /* 1 */,
      /* 2 */,
      /* 3 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = __webpack_require__(147);


        /***/ }),
      /* 4 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;

            var _promise = __webpack_require__(32);

            var _promise2 = _interopRequireDefault(_promise);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            exports.default = function (fn) {
                return function () {
                    var gen = fn.apply(this, arguments);
                    return new _promise2.default(function (resolve, reject) {
                        function step(key, arg) {
                            try {
                                var info = gen[key](arg);
                                var value = info.value;
                            } catch (error) {
                                reject(error);
                                return;
                            }

                            if (info.done) {
                                resolve(value);
                            } else {
                                return _promise2.default.resolve(value).then(function (value) {
                                    step("next", value);
                                }, function (err) {
                                    step("throw", err);
                                });
                            }
                        }

                        return step("next");
                    });
                };
            };

        /***/ }),
      /* 5 */
      /***/ (function(module, exports) {

            var core = module.exports = { version: '2.5.3' };
            if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


        /***/ }),
      /* 6 */
      /***/ (function(module, exports) {

            var g;

// This works in non-strict mode
            g = (function() {
                return this;
            })();

            try {
                // This works if eval is allowed (see CSP)
                g = g || Function("return this")() || (1,eval)("this");
            } catch(e) {
                // This works if the window reference is available
                if(typeof window === "object")
                    g = window;
            }

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

            module.exports = g;


        /***/ }),
      /* 7 */
      /***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
            var global = module.exports = typeof window != 'undefined' && window.Math == Math
                ? window : typeof self != 'undefined' && self.Math == Math ? self
                    // eslint-disable-next-line no-new-func
                    : Function('return this')();
            if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


        /***/ }),
      /* 8 */
      /***/ (function(module, exports, __webpack_require__) {

            var store = __webpack_require__(72)('wks');
            var uid = __webpack_require__(46);
            var Symbol = __webpack_require__(7).Symbol;
            var USE_SYMBOL = typeof Symbol == 'function';

            var $exports = module.exports = function (name) {
                return store[name] || (store[name] =
                        USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
            };

            $exports.store = store;


        /***/ }),
      /* 9 */,
      /* 10 */
      /***/ (function(module, exports, __webpack_require__) {

            var global = __webpack_require__(7);
            var core = __webpack_require__(5);
            var ctx = __webpack_require__(25);
            var hide = __webpack_require__(20);
            var PROTOTYPE = 'prototype';

            var $export = function (type, name, source) {
                var IS_FORCED = type & $export.F;
                var IS_GLOBAL = type & $export.G;
                var IS_STATIC = type & $export.S;
                var IS_PROTO = type & $export.P;
                var IS_BIND = type & $export.B;
                var IS_WRAP = type & $export.W;
                var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
                var expProto = exports[PROTOTYPE];
                var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
                var key, own, out;
                if (IS_GLOBAL) source = name;
                for (key in source) {
                    // contains in native
                    own = !IS_FORCED && target && target[key] !== undefined;
                    if (own && key in exports) continue;
                    // export native or passed
                    out = own ? target[key] : source[key];
                    // prevent global pollution for namespaces
                    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
                        // bind timers to global for call from export context
                        : IS_BIND && own ? ctx(out, global)
                            // wrap global constructors for prevent change them in library
                            : IS_WRAP && target[key] == out ? (function (C) {
                                var F = function (a, b, c) {
                                    if (this instanceof C) {
                                        switch (arguments.length) {
                                            case 0: return new C();
                                            case 1: return new C(a);
                                            case 2: return new C(a, b);
                                        } return new C(a, b, c);
                                    } return C.apply(this, arguments);
                                };
                                F[PROTOTYPE] = C[PROTOTYPE];
                                return F;
                                // make static versions for prototype methods
                            })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
                    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
                    if (IS_PROTO) {
                        (exports.virtual || (exports.virtual = {}))[key] = out;
                        // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
                        if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
                    }
                }
            };
// type bitmap
            $export.F = 1;   // forced
            $export.G = 2;   // global
            $export.S = 4;   // static
            $export.P = 8;   // proto
            $export.B = 16;  // bind
            $export.W = 32;  // wrap
            $export.U = 64;  // safe
            $export.R = 128; // real proto method for `library`
            module.exports = $export;


        /***/ }),
      /* 11 */
      /***/ (function(module, exports, __webpack_require__) {

            var isObject = __webpack_require__(14);
            module.exports = function (it) {
                if (!isObject(it)) throw TypeError(it + ' is not an object!');
                return it;
            };


        /***/ }),
      /* 12 */,
      /* 13 */,
      /* 14 */
      /***/ (function(module, exports) {

            module.exports = function (it) {
                return typeof it === 'object' ? it !== null : typeof it === 'function';
            };


        /***/ }),
      /* 15 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;

            exports.default = function (instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            };

        /***/ }),
      /* 16 */,
      /* 17 */
      /***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
            module.exports = !__webpack_require__(27)(function () {
                return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
            });


        /***/ }),
      /* 18 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = { "default": __webpack_require__(160), __esModule: true };

        /***/ }),
      /* 19 */,
      /* 20 */
      /***/ (function(module, exports, __webpack_require__) {

            var dP = __webpack_require__(21);
            var createDesc = __webpack_require__(45);
            module.exports = __webpack_require__(17) ? function (object, key, value) {
                return dP.f(object, key, createDesc(1, value));
            } : function (object, key, value) {
                object[key] = value;
                return object;
            };


        /***/ }),
      /* 21 */
      /***/ (function(module, exports, __webpack_require__) {

            var anObject = __webpack_require__(11);
            var IE8_DOM_DEFINE = __webpack_require__(111);
            var toPrimitive = __webpack_require__(76);
            var dP = Object.defineProperty;

            exports.f = __webpack_require__(17) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
                anObject(O);
                P = toPrimitive(P, true);
                anObject(Attributes);
                if (IE8_DOM_DEFINE) try {
                    return dP(O, P, Attributes);
                } catch (e) { /* empty */ }
                if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
                if ('value' in Attributes) O[P] = Attributes.value;
                return O;
            };


        /***/ }),
      /* 22 */,
      /* 23 */,
      /* 24 */,
      /* 25 */
      /***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
            var aFunction = __webpack_require__(38);
            module.exports = function (fn, that, length) {
                aFunction(fn);
                if (that === undefined) return fn;
                switch (length) {
                    case 1: return function (a) {
                        return fn.call(that, a);
                    };
                    case 2: return function (a, b) {
                        return fn.call(that, a, b);
                    };
                    case 3: return function (a, b, c) {
                        return fn.call(that, a, b, c);
                    };
                }
                return function (/* ...args */) {
                    return fn.apply(that, arguments);
                };
            };


        /***/ }),
      /* 26 */
      /***/ (function(module, exports) {

            var hasOwnProperty = {}.hasOwnProperty;
            module.exports = function (it, key) {
                return hasOwnProperty.call(it, key);
            };


        /***/ }),
      /* 27 */
      /***/ (function(module, exports) {

            module.exports = function (exec) {
                try {
                    return !!exec();
                } catch (e) {
                    return true;
                }
            };


        /***/ }),
      /* 28 */
      /***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
            var IObject = __webpack_require__(85);
            var defined = __webpack_require__(60);
            module.exports = function (it) {
                return IObject(defined(it));
            };


        /***/ }),
      /* 29 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;

            var _assign = __webpack_require__(217);

            var _assign2 = _interopRequireDefault(_assign);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            exports.default = _assign2.default || function (target) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = arguments[i];

                        for (var key in source) {
                            if (Object.prototype.hasOwnProperty.call(source, key)) {
                                target[key] = source[key];
                            }
                        }
                    }

                    return target;
                };

        /***/ }),
      /* 30 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;
            exports.ErrorMessage = exports.ResponseMessage = exports.DeviceMessage = exports.UiMessage = exports.parseMessage = exports.ERROR_EVENT = exports.RESPONSE_EVENT = exports.DEVICE_EVENT = exports.UI_EVENT = undefined;

            var _classCallCheck2 = __webpack_require__(15);

            var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            var UI_EVENT = exports.UI_EVENT = 'UI_EVENT';
            var DEVICE_EVENT = exports.DEVICE_EVENT = 'DEVICE_EVENT';
            var RESPONSE_EVENT = exports.RESPONSE_EVENT = 'RESPONSE_EVENT';
            var ERROR_EVENT = exports.ERROR_EVENT = 'ERROR_EVENT';

// parse MessageEvent .data object into CoreMessage
            var parseMessage = exports.parseMessage = function parseMessage(data) {
                return {
                    event: data.event,
                    type: data.type,
                    id: data.id,
                    success: data.success,
                    data: data.data,
                    error: data.error,
                    args: data.args,
                    level: data.level
                };
            };

            var UiMessage = exports.UiMessage = function UiMessage(type) {
                var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
                (0, _classCallCheck3.default)(this, UiMessage);

                this.event = UI_EVENT;
                this.type = type;
                this.data = data;
            };

            var DeviceMessage = exports.DeviceMessage = function DeviceMessage(type) {
                var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
                (0, _classCallCheck3.default)(this, DeviceMessage);

                this.event = DEVICE_EVENT;
                this.type = type;
                this.data = data;
            };

            var ResponseMessage = exports.ResponseMessage = function ResponseMessage(id, success) {
                var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                (0, _classCallCheck3.default)(this, ResponseMessage);

                this.event = RESPONSE_EVENT;
                this.type = RESPONSE_EVENT;
                this.id = id;
                this.success = success;
                this.data = data;
            };

            var ErrorMessage = exports.ErrorMessage = function ErrorMessage() {
                var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
                (0, _classCallCheck3.default)(this, ErrorMessage);

                this.event = ERROR_EVENT;
                this.type = ERROR_EVENT;
                this.error = error;
            };

        /***/ }),
      /* 31 */,
      /* 32 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = { "default": __webpack_require__(149), __esModule: true };

        /***/ }),
      /* 33 */
      /***/ (function(module, exports) {

            module.exports = {};


        /***/ }),
      /* 34 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;
            var TRANSPORT = exports.TRANSPORT = 'ui-no_transport';
            var BOOTLOADER = exports.BOOTLOADER = 'ui-bootloader';
            var INITIALIZE = exports.INITIALIZE = 'ui-initialize';
            var FIRMWARE = exports.FIRMWARE = 'ui-firmware';

            var REQUEST_UI_WINDOW = exports.REQUEST_UI_WINDOW = 'ui-request_window';
            var CLOSE_UI_WINDOW = exports.CLOSE_UI_WINDOW = 'ui-close_window';

            var REQUEST_PERMISSION = exports.REQUEST_PERMISSION = 'ui-request_permission';
            var REQUEST_CONFIRMATION = exports.REQUEST_CONFIRMATION = 'ui-request_confirmation';
            var REQUEST_PIN = exports.REQUEST_PIN = 'ui-request_pin';
            var INVALID_PIN = exports.INVALID_PIN = 'ui-invalid_pin';
            var REQUEST_PASSPHRASE = exports.REQUEST_PASSPHRASE = 'ui-request_passphrase';
            var CONNECT = exports.CONNECT = 'ui-connect';
            var LOADING = exports.LOADING = 'ui-loading';
            var SET_OPERATION = exports.SET_OPERATION = 'ui-set_operation';
            var SELECT_DEVICE = exports.SELECT_DEVICE = 'ui-select_device';
            var SELECT_ACCOUNT = exports.SELECT_ACCOUNT = 'ui-select_account';
            var SELECT_FEE = exports.SELECT_FEE = 'ui-select_fee';
            var UPDATE_CUSTOM_FEE = exports.UPDATE_CUSTOM_FEE = 'ui-update_custom_fee';
            var INSUFFICIENT_FUNDS = exports.INSUFFICIENT_FUNDS = 'ui-insufficient_funds';
            var REQUEST_BUTTON = exports.REQUEST_BUTTON = 'ui-button';

            var RECEIVE_PERMISSION = exports.RECEIVE_PERMISSION = 'ui-receive_permission';
            var RECEIVE_CONFIRMATION = exports.RECEIVE_CONFIRMATION = 'ui-receive_confirmation';
            var RECEIVE_PIN = exports.RECEIVE_PIN = 'ui-receive_pin';
            var RECEIVE_PASSPHRASE = exports.RECEIVE_PASSPHRASE = 'ui-receive_passphrase';
            var RECEIVE_DEVICE = exports.RECEIVE_DEVICE = 'ui-receive_device';
            var CHANGE_ACCOUNT = exports.CHANGE_ACCOUNT = 'ui-change_account';
            var RECEIVE_ACCOUNT = exports.RECEIVE_ACCOUNT = 'ui-receive_account';
            var RECEIVE_FEE = exports.RECEIVE_FEE = 'ui-receive_fee';

            var CHANGE_SETTINGS = exports.CHANGE_SETTINGS = 'ui-change_settings';

        /***/ }),
      /* 35 */,
      /* 36 */
      /***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
            var $keys = __webpack_require__(113);
            var enumBugKeys = __webpack_require__(73);

            module.exports = Object.keys || function keys(O) {
                    return $keys(O, enumBugKeys);
                };


        /***/ }),
      /* 37 */
      /***/ (function(module, exports) {

            var toString = {}.toString;

            module.exports = function (it) {
                return toString.call(it).slice(8, -1);
            };


        /***/ }),
      /* 38 */
      /***/ (function(module, exports) {

            module.exports = function (it) {
                if (typeof it != 'function') throw TypeError(it + ' is not a function!');
                return it;
            };


        /***/ }),
      /* 39 */
      /***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

            function EventEmitter() {
                this._events = this._events || {};
                this._maxListeners = this._maxListeners || undefined;
            }
            module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
            EventEmitter.EventEmitter = EventEmitter;

            EventEmitter.prototype._events = undefined;
            EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
            EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
            EventEmitter.prototype.setMaxListeners = function(n) {
                if (!isNumber(n) || n < 0 || isNaN(n))
                    throw TypeError('n must be a positive number');
                this._maxListeners = n;
                return this;
            };

            EventEmitter.prototype.emit = function(type) {
                var er, handler, len, args, i, listeners;

                if (!this._events)
                    this._events = {};

                // If there is no 'error' event listener then throw.
                if (type === 'error') {
                    if (!this._events.error ||
                        (isObject(this._events.error) && !this._events.error.length)) {
                        er = arguments[1];
                        if (er instanceof Error) {
                            throw er; // Unhandled 'error' event
                        } else {
                            // At least give some kind of context to the user
                            var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
                            err.context = er;
                            throw err;
                        }
                    }
                }

                handler = this._events[type];

                if (isUndefined(handler))
                    return false;

                if (isFunction(handler)) {
                    switch (arguments.length) {
                        // fast cases
                        case 1:
                            handler.call(this);
                            break;
                        case 2:
                            handler.call(this, arguments[1]);
                            break;
                        case 3:
                            handler.call(this, arguments[1], arguments[2]);
                            break;
                        // slower
                        default:
                            args = Array.prototype.slice.call(arguments, 1);
                            handler.apply(this, args);
                    }
                } else if (isObject(handler)) {
                    args = Array.prototype.slice.call(arguments, 1);
                    listeners = handler.slice();
                    len = listeners.length;
                    for (i = 0; i < len; i++)
                        listeners[i].apply(this, args);
                }

                return true;
            };

            EventEmitter.prototype.addListener = function(type, listener) {
                var m;

                if (!isFunction(listener))
                    throw TypeError('listener must be a function');

                if (!this._events)
                    this._events = {};

                // To avoid recursion in the case that type === "newListener"! Before
                // adding it to the listeners, first emit "newListener".
                if (this._events.newListener)
                    this.emit('newListener', type,
                        isFunction(listener.listener) ?
                            listener.listener : listener);

                if (!this._events[type])
                // Optimize the case of one listener. Don't need the extra array object.
                    this._events[type] = listener;
                else if (isObject(this._events[type]))
                // If we've already got an array, just append.
                    this._events[type].push(listener);
                else
                // Adding the second element, need to change to array.
                    this._events[type] = [this._events[type], listener];

                // Check for listener leak
                if (isObject(this._events[type]) && !this._events[type].warned) {
                    if (!isUndefined(this._maxListeners)) {
                        m = this._maxListeners;
                    } else {
                        m = EventEmitter.defaultMaxListeners;
                    }

                    if (m && m > 0 && this._events[type].length > m) {
                        this._events[type].warned = true;
                        console.error('(node) warning: possible EventEmitter memory ' +
                            'leak detected. %d listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit.',
                            this._events[type].length);
                        if (typeof console.trace === 'function') {
                            // not supported in IE 10
                            console.trace();
                        }
                    }
                }

                return this;
            };

            EventEmitter.prototype.on = EventEmitter.prototype.addListener;

            EventEmitter.prototype.once = function(type, listener) {
                if (!isFunction(listener))
                    throw TypeError('listener must be a function');

                var fired = false;

                function g() {
                    this.removeListener(type, g);

                    if (!fired) {
                        fired = true;
                        listener.apply(this, arguments);
                    }
                }

                g.listener = listener;
                this.on(type, g);

                return this;
            };

// emits a 'removeListener' event iff the listener was removed
            EventEmitter.prototype.removeListener = function(type, listener) {
                var list, position, length, i;

                if (!isFunction(listener))
                    throw TypeError('listener must be a function');

                if (!this._events || !this._events[type])
                    return this;

                list = this._events[type];
                length = list.length;
                position = -1;

                if (list === listener ||
                    (isFunction(list.listener) && list.listener === listener)) {
                    delete this._events[type];
                    if (this._events.removeListener)
                        this.emit('removeListener', type, listener);

                } else if (isObject(list)) {
                    for (i = length; i-- > 0;) {
                        if (list[i] === listener ||
                            (list[i].listener && list[i].listener === listener)) {
                            position = i;
                            break;
                        }
                    }

                    if (position < 0)
                        return this;

                    if (list.length === 1) {
                        list.length = 0;
                        delete this._events[type];
                    } else {
                        list.splice(position, 1);
                    }

                    if (this._events.removeListener)
                        this.emit('removeListener', type, listener);
                }

                return this;
            };

            EventEmitter.prototype.removeAllListeners = function(type) {
                var key, listeners;

                if (!this._events)
                    return this;

                // not listening for removeListener, no need to emit
                if (!this._events.removeListener) {
                    if (arguments.length === 0)
                        this._events = {};
                    else if (this._events[type])
                        delete this._events[type];
                    return this;
                }

                // emit removeListener for all listeners on all events
                if (arguments.length === 0) {
                    for (key in this._events) {
                        if (key === 'removeListener') continue;
                        this.removeAllListeners(key);
                    }
                    this.removeAllListeners('removeListener');
                    this._events = {};
                    return this;
                }

                listeners = this._events[type];

                if (isFunction(listeners)) {
                    this.removeListener(type, listeners);
                } else if (listeners) {
                    // LIFO order
                    while (listeners.length)
                        this.removeListener(type, listeners[listeners.length - 1]);
                }
                delete this._events[type];

                return this;
            };

            EventEmitter.prototype.listeners = function(type) {
                var ret;
                if (!this._events || !this._events[type])
                    ret = [];
                else if (isFunction(this._events[type]))
                    ret = [this._events[type]];
                else
                    ret = this._events[type].slice();
                return ret;
            };

            EventEmitter.prototype.listenerCount = function(type) {
                if (this._events) {
                    var evlistener = this._events[type];

                    if (isFunction(evlistener))
                        return 1;
                    else if (evlistener)
                        return evlistener.length;
                }
                return 0;
            };

            EventEmitter.listenerCount = function(emitter, type) {
                return emitter.listenerCount(type);
            };

            function isFunction(arg) {
                return typeof arg === 'function';
            }

            function isNumber(arg) {
                return typeof arg === 'number';
            }

            function isObject(arg) {
                return typeof arg === 'object' && arg !== null;
            }

            function isUndefined(arg) {
                return arg === void 0;
            }


        /***/ }),
      /* 40 */,
      /* 41 */,
      /* 42 */
      /***/ (function(module, exports, __webpack_require__) {

            var def = __webpack_require__(21).f;
            var has = __webpack_require__(26);
            var TAG = __webpack_require__(8)('toStringTag');

            module.exports = function (it, tag, stat) {
                if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
            };


        /***/ }),
      /* 43 */,
      /* 44 */
      /***/ (function(module, exports) {

            module.exports = true;


        /***/ }),
      /* 45 */
      /***/ (function(module, exports) {

            module.exports = function (bitmap, value) {
                return {
                    enumerable: !(bitmap & 1),
                    configurable: !(bitmap & 2),
                    writable: !(bitmap & 4),
                    value: value
                };
            };


        /***/ }),
      /* 46 */
      /***/ (function(module, exports) {

            var id = 0;
            var px = Math.random();
            module.exports = function (key) {
                return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
            };


        /***/ }),
      /* 47 */,
      /* 48 */,
      /* 49 */,
      /* 50 */,
      /* 51 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;

            var _typeof2 = __webpack_require__(84);

            var _typeof3 = _interopRequireDefault(_typeof2);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            exports.default = function (self, call) {
                if (!self) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                }

                return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
            };

        /***/ }),
      /* 52 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";

            var $at = __webpack_require__(138)(true);

// 21.1.3.27 String.prototype[@@iterator]()
            __webpack_require__(75)(String, 'String', function (iterated) {
                this._t = String(iterated); // target
                this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
            }, function () {
                var O = this._t;
                var index = this._i;
                var point;
                if (index >= O.length) return { value: undefined, done: true };
                point = $at(O, index);
                this._i += point.length;
                return { value: point, done: false };
            });


        /***/ }),
      /* 53 */
      /***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
            var defined = __webpack_require__(60);
            module.exports = function (it) {
                return Object(defined(it));
            };


        /***/ }),
      /* 54 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(144);
            var global = __webpack_require__(7);
            var hide = __webpack_require__(20);
            var Iterators = __webpack_require__(33);
            var TO_STRING_TAG = __webpack_require__(8)('toStringTag');

            var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
            'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
            'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
            'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
            'TextTrackList,TouchList').split(',');

            for (var i = 0; i < DOMIterables.length; i++) {
                var NAME = DOMIterables[i];
                var Collection = global[NAME];
                var proto = Collection && Collection.prototype;
                if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
                Iterators[NAME] = Iterators.Array;
            }


        /***/ }),
      /* 55 */
      /***/ (function(module, exports) {

            exports.f = {}.propertyIsEnumerable;


        /***/ }),
      /* 56 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;

            var _setPrototypeOf = __webpack_require__(210);

            var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

            var _create = __webpack_require__(214);

            var _create2 = _interopRequireDefault(_create);

            var _typeof2 = __webpack_require__(84);

            var _typeof3 = _interopRequireDefault(_typeof2);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            exports.default = function (subClass, superClass) {
                if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
                }

                subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
                    constructor: {
                        value: subClass,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
                if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
            };

        /***/ }),
      /* 57 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


// device list events

            exports.__esModule = true;
            var CONNECT = exports.CONNECT = 'device__connect';
            var CONNECT_UNACQUIRED = exports.CONNECT_UNACQUIRED = 'device__connect_unacquired';
            var DISCONNECT = exports.DISCONNECT = 'device__disconnect';
            var DISCONNECT_UNACQUIRED = exports.DISCONNECT_UNACQUIRED = 'device__disconnect_unacquired';

            var ACQUIRE = exports.ACQUIRE = 'device__acquire';
            var RELEASE = exports.RELEASE = 'device__release';
            var ACQUIRED = exports.ACQUIRED = 'device__acquired';
            var RELEASED = exports.RELEASED = 'device__released';
            var USED_ELSEWHERE = exports.USED_ELSEWHERE = 'device__used_elsewhere';
            var CHANGED = exports.CHANGED = 'device__changed';

            var LOADING = exports.LOADING = 'device__loading';

// trezor-link events
            var BUTTON = exports.BUTTON = 'button';
            var PIN = exports.PIN = 'pin';
            var PASSPHRASE = exports.PASSPHRASE = 'passphrase';
            var WORD = exports.WORD = 'word';

// custom
            var AUTHENTICATED = exports.AUTHENTICATED = 'device__authenticated';

            var WAIT_FOR_SELECTION = exports.WAIT_FOR_SELECTION = 'device__wait_for_selection';

        /***/ }),
      /* 58 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = { "default": __webpack_require__(162), __esModule: true };

        /***/ }),
      /* 59 */
      /***/ (function(module, exports) {

// 7.1.4 ToInteger
            var ceil = Math.ceil;
            var floor = Math.floor;
            module.exports = function (it) {
                return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
            };


        /***/ }),
      /* 60 */
      /***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
            module.exports = function (it) {
                if (it == undefined) throw TypeError("Can't call method on  " + it);
                return it;
            };


        /***/ }),
      /* 61 */
      /***/ (function(module, exports, __webpack_require__) {

            var isObject = __webpack_require__(14);
            var document = __webpack_require__(7).document;
// typeof document.createElement is 'object' in old IE
            var is = isObject(document) && isObject(document.createElement);
            module.exports = function (it) {
                return is ? document.createElement(it) : {};
            };


        /***/ }),
      /* 62 */
      /***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
            var anObject = __webpack_require__(11);
            var dPs = __webpack_require__(140);
            var enumBugKeys = __webpack_require__(73);
            var IE_PROTO = __webpack_require__(63)('IE_PROTO');
            var Empty = function () { /* empty */ };
            var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
            var createDict = function () {
                // Thrash, waste and sodomy: IE GC bug
                var iframe = __webpack_require__(61)('iframe');
                var i = enumBugKeys.length;
                var lt = '<';
                var gt = '>';
                var iframeDocument;
                iframe.style.display = 'none';
                __webpack_require__(88).appendChild(iframe);
                iframe.src = 'javascript:'; // eslint-disable-line no-script-url
                // createDict = iframe.contentWindow.Object;
                // html.removeChild(iframe);
                iframeDocument = iframe.contentWindow.document;
                iframeDocument.open();
                iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
                iframeDocument.close();
                createDict = iframeDocument.F;
                while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
                return createDict();
            };

            module.exports = Object.create || function create(O, Properties) {
                    var result;
                    if (O !== null) {
                        Empty[PROTOTYPE] = anObject(O);
                        result = new Empty();
                        Empty[PROTOTYPE] = null;
                        // add "__proto__" for Object.getPrototypeOf polyfill
                        result[IE_PROTO] = O;
                    } else result = createDict();
                    return Properties === undefined ? result : dPs(result, Properties);
                };


        /***/ }),
      /* 63 */
      /***/ (function(module, exports, __webpack_require__) {

            var shared = __webpack_require__(72)('keys');
            var uid = __webpack_require__(46);
            module.exports = function (key) {
                return shared[key] || (shared[key] = uid(key));
            };


        /***/ }),
      /* 64 */
      /***/ (function(module, exports, __webpack_require__) {

            var ctx = __webpack_require__(25);
            var call = __webpack_require__(151);
            var isArrayIter = __webpack_require__(152);
            var anObject = __webpack_require__(11);
            var toLength = __webpack_require__(77);
            var getIterFn = __webpack_require__(93);
            var BREAK = {};
            var RETURN = {};
            var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
                var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
                var f = ctx(fn, that, entries ? 2 : 1);
                var index = 0;
                var length, step, iterator, result;
                if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
                // fast case for arrays with default iterator
                if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
                    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
                    if (result === BREAK || result === RETURN) return result;
                } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
                    result = call(iterator, f, step.value, entries);
                    if (result === BREAK || result === RETURN) return result;
                }
            };
            exports.BREAK = BREAK;
            exports.RETURN = RETURN;


        /***/ }),
      /* 65 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";

// 25.4.1.5 NewPromiseCapability(C)
            var aFunction = __webpack_require__(38);

            function PromiseCapability(C) {
                var resolve, reject;
                this.promise = new C(function ($$resolve, $$reject) {
                    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
                    resolve = $$resolve;
                    reject = $$reject;
                });
                this.resolve = aFunction(resolve);
                this.reject = aFunction(reject);
            }

            module.exports.f = function (C) {
                return new PromiseCapability(C);
            };


        /***/ }),
      /* 66 */,
      /* 67 */,
      /* 68 */,
      /* 69 */,
      /* 70 */,
      /* 71 */,
      /* 72 */
      /***/ (function(module, exports, __webpack_require__) {

            var global = __webpack_require__(7);
            var SHARED = '__core-js_shared__';
            var store = global[SHARED] || (global[SHARED] = {});
            module.exports = function (key) {
                return store[key] || (store[key] = {});
            };


        /***/ }),
      /* 73 */
      /***/ (function(module, exports) {

// IE 8- don't enum bug keys
            module.exports = (
                'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
            ).split(',');


        /***/ }),
      /* 74 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";
        /* WEBPACK VAR INJECTION */(function(global) {

// https://stackoverflow.com/questions/7505623/colors-in-javascript-console
// https://github.com/pimterry/loglevel/blob/master/lib/loglevel.js

// http://www.color-hex.com/color-palette/5016

                exports.__esModule = true;
                exports.popupConsole = exports.enableByPrefix = exports.enable = exports.init = undefined;

                var _stringify = __webpack_require__(99);

                var _stringify2 = _interopRequireDefault(_stringify);

                var _getIterator2 = __webpack_require__(18);

                var _getIterator3 = _interopRequireDefault(_getIterator2);

                var _keys = __webpack_require__(58);

                var _keys2 = _interopRequireDefault(_keys);

                var _classCallCheck2 = __webpack_require__(15);

                var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

                var colors = {
                    // green
                    'DescriptorStream': 'color: #77ab59',
                    'DeviceList': 'color: #36802d',
                    'Device': 'color: #bada55',
                    'Core': 'color: #c9df8a',
                    'IFrame': 'color: #f4a742',
                    'Popup': 'color: #f48a00'
                };

                var Log = function () {
                    function Log(prefix, enabled) {
                        (0, _classCallCheck3.default)(this, Log);

                        this.prefix = prefix;
                        this.enabled = enabled;
                        this.messages = [];
                        this.css = colors[prefix] || 'color: #000000';
                    }

                    Log.prototype.addMessage = function addMessage(level, prefix) {
                        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                            args[_key - 2] = arguments[_key];
                        }

                        this.messages.push({
                            level: level,
                            prefix: prefix,
                            // message: JSON.stringify(args),
                            message: args,
                            timestamp: new Date().getTime()
                        });
                    };

                    Log.prototype.log = function log() {
                        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                            args[_key2] = arguments[_key2];
                        }

                        this.addMessage.apply(this, ['log', this.prefix].concat(args));
                        if (this.enabled) {
                            var _console;

                            (_console = console).log.apply(_console, [this.prefix].concat(args));
                        }
                    };

                    Log.prototype.error = function error() {
                        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                            args[_key3] = arguments[_key3];
                        }

                        this.addMessage.apply(this, ['error', this.prefix].concat(args));
                        if (this.enabled) {
                            var _console2;

                            (_console2 = console).error.apply(_console2, [this.prefix].concat(args));
                        }
                    };

                    Log.prototype.warn = function warn() {
                        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                            args[_key4] = arguments[_key4];
                        }

                        this.addMessage.apply(this, ['warn', this.prefix].concat(args));
                        if (this.enabled) {
                            var _console3;

                            (_console3 = console).warn.apply(_console3, [this.prefix].concat(args));
                        }
                    };

                    Log.prototype.debug = function debug() {
                        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                            args[_key5] = arguments[_key5];
                        }

                        this.addMessage.apply(this, ['debug', this.prefix].concat(args));
                        if (this.enabled) {
                            var _console4;

                            (_console4 = console).log.apply(_console4, ['%c' + this.prefix, this.css].concat(args));
                        }
                    };

                    return Log;
                }();

                exports.default = Log;


                var _logs = {};

                var init = exports.init = function init(prefix, enabled) {
                    var enab = typeof enabled === 'boolean' ? enabled : false;
                    var instance = new Log(prefix, enab);
                    _logs[prefix] = instance;
                    return instance;
                };

                var enable = exports.enable = function enable(enabled) {
                    for (var _iterator = (0, _keys2.default)(_logs), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
                        var _ref;

                        if (_isArray) {
                            if (_i >= _iterator.length) break;
                            _ref = _iterator[_i++];
                        } else {
                            _i = _iterator.next();
                            if (_i.done) break;
                            _ref = _i.value;
                        }

                        var l = _ref;

                        _logs[l].enabled = enabled;
                    }
                };

                var enableByPrefix = exports.enableByPrefix = function enableByPrefix(prefix, enabled) {
                    if (_logs[prefix]) {
                        _logs[prefix].enabled = enabled;
                    }
                };

// TODO: enable/disable log at runtime
                var popupConsole = exports.popupConsole = function popupConsole(tag, postMessage) {
                    var c = global.console;
                    var orig = {
                        error: c.error,
                        // warn: c.warn,
                        info: c.info,
                        debug: c.debug,
                        log: c.log
                    };
                    var log = [];

                    var inject = function inject(method, level) {
                        return function () {
                            for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                                args[_key6] = arguments[_key6];
                            }

                            // args.unshift('[popup.js]');
                            var time = new Date().toUTCString();
                            log.push([level, time].concat(args));
                            postMessage.apply(undefined, [{ type: tag, level: level, time: time, args: (0, _stringify2.default)(args) }]
                                // { type: 'LOG', level: level, time: time, args: JSON.stringify(deepClone(args)) }
                            );
                            return method.apply(c, args);
                        };
                    };

                    for (var _level in orig) {
                        c[_level] = inject(orig[_level], _level);
                    }
                };
          /* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

        /***/ }),
      /* 75 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";

            var LIBRARY = __webpack_require__(44);
            var $export = __webpack_require__(10);
            var redefine = __webpack_require__(112);
            var hide = __webpack_require__(20);
            var has = __webpack_require__(26);
            var Iterators = __webpack_require__(33);
            var $iterCreate = __webpack_require__(139);
            var setToStringTag = __webpack_require__(42);
            var getPrototypeOf = __webpack_require__(143);
            var ITERATOR = __webpack_require__(8)('iterator');
            var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
            var FF_ITERATOR = '@@iterator';
            var KEYS = 'keys';
            var VALUES = 'values';

            var returnThis = function () { return this; };

            module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
                $iterCreate(Constructor, NAME, next);
                var getMethod = function (kind) {
                    if (!BUGGY && kind in proto) return proto[kind];
                    switch (kind) {
                        case KEYS: return function keys() { return new Constructor(this, kind); };
                        case VALUES: return function values() { return new Constructor(this, kind); };
                    } return function entries() { return new Constructor(this, kind); };
                };
                var TAG = NAME + ' Iterator';
                var DEF_VALUES = DEFAULT == VALUES;
                var VALUES_BUG = false;
                var proto = Base.prototype;
                var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
                var $default = (!BUGGY && $native) || getMethod(DEFAULT);
                var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
                var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
                var methods, key, IteratorPrototype;
                // Fix native
                if ($anyNative) {
                    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
                    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
                        // Set @@toStringTag to native iterators
                        setToStringTag(IteratorPrototype, TAG, true);
                        // fix for some old engines
                        if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
                    }
                }
                // fix Array#{values, @@iterator}.name in V8 / FF
                if (DEF_VALUES && $native && $native.name !== VALUES) {
                    VALUES_BUG = true;
                    $default = function values() { return $native.call(this); };
                }
                // Define iterator
                if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
                    hide(proto, ITERATOR, $default);
                }
                // Plug for library
                Iterators[NAME] = $default;
                Iterators[TAG] = returnThis;
                if (DEFAULT) {
                    methods = {
                        values: DEF_VALUES ? $default : getMethod(VALUES),
                        keys: IS_SET ? $default : getMethod(KEYS),
                        entries: $entries
                    };
                    if (FORCED) for (key in methods) {
                        if (!(key in proto)) redefine(proto, key, methods[key]);
                    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
                }
                return methods;
            };


        /***/ }),
      /* 76 */
      /***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
            var isObject = __webpack_require__(14);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
            module.exports = function (it, S) {
                if (!isObject(it)) return it;
                var fn, val;
                if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
                if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
                if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
                throw TypeError("Can't convert object to primitive value");
            };


        /***/ }),
      /* 77 */
      /***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
            var toInteger = __webpack_require__(59);
            var min = Math.min;
            module.exports = function (it) {
                return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
            };


        /***/ }),
      /* 78 */
      /***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
            var cof = __webpack_require__(37);
            var TAG = __webpack_require__(8)('toStringTag');
// ES3 wrong here
            var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
            var tryGet = function (it, key) {
                try {
                    return it[key];
                } catch (e) { /* empty */ }
            };

            module.exports = function (it) {
                var O, T, B;
                return it === undefined ? 'Undefined' : it === null ? 'Null'
                    // @@toStringTag case
                    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
                        // builtinTag case
                        : ARG ? cof(O)
                            // ES3 arguments fallback
                            : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
            };


        /***/ }),
      /* 79 */,
      /* 80 */,
      /* 81 */,
      /* 82 */,
      /* 83 */,
      /* 84 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;

            var _iterator = __webpack_require__(201);

            var _iterator2 = _interopRequireDefault(_iterator);

            var _symbol = __webpack_require__(203);

            var _symbol2 = _interopRequireDefault(_symbol);

            var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
                return typeof obj === "undefined" ? "undefined" : _typeof(obj);
            } : function (obj) {
                return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
            };

        /***/ }),
      /* 85 */
      /***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
            var cof = __webpack_require__(37);
// eslint-disable-next-line no-prototype-builtins
            module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
                return cof(it) == 'String' ? it.split('') : Object(it);
            };


        /***/ }),
      /* 86 */
      /***/ (function(module, exports) {



        /***/ }),
      /* 87 */,
      /* 88 */
      /***/ (function(module, exports, __webpack_require__) {

            var document = __webpack_require__(7).document;
            module.exports = document && document.documentElement;


        /***/ }),
      /* 89 */
      /***/ (function(module, exports, __webpack_require__) {

            exports.f = __webpack_require__(8);


        /***/ }),
      /* 90 */
      /***/ (function(module, exports, __webpack_require__) {

            var global = __webpack_require__(7);
            var core = __webpack_require__(5);
            var LIBRARY = __webpack_require__(44);
            var wksExt = __webpack_require__(89);
            var defineProperty = __webpack_require__(21).f;
            module.exports = function (name) {
                var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
                if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
            };


        /***/ }),
      /* 91 */
      /***/ (function(module, exports) {

            exports.f = Object.getOwnPropertySymbols;


        /***/ }),
      /* 92 */
      /***/ (function(module, exports) {

            module.exports = function (it, Constructor, name, forbiddenField) {
                if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
                    throw TypeError(name + ': incorrect invocation!');
                } return it;
            };


        /***/ }),
      /* 93 */
      /***/ (function(module, exports, __webpack_require__) {

            var classof = __webpack_require__(78);
            var ITERATOR = __webpack_require__(8)('iterator');
            var Iterators = __webpack_require__(33);
            module.exports = __webpack_require__(5).getIteratorMethod = function (it) {
                if (it != undefined) return it[ITERATOR]
                    || it['@@iterator']
                    || Iterators[classof(it)];
            };


        /***/ }),
      /* 94 */
      /***/ (function(module, exports, __webpack_require__) {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
            var anObject = __webpack_require__(11);
            var aFunction = __webpack_require__(38);
            var SPECIES = __webpack_require__(8)('species');
            module.exports = function (O, D) {
                var C = anObject(O).constructor;
                var S;
                return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
            };


        /***/ }),
      /* 95 */
      /***/ (function(module, exports, __webpack_require__) {

            var ctx = __webpack_require__(25);
            var invoke = __webpack_require__(153);
            var html = __webpack_require__(88);
            var cel = __webpack_require__(61);
            var global = __webpack_require__(7);
            var process = global.process;
            var setTask = global.setImmediate;
            var clearTask = global.clearImmediate;
            var MessageChannel = global.MessageChannel;
            var Dispatch = global.Dispatch;
            var counter = 0;
            var queue = {};
            var ONREADYSTATECHANGE = 'onreadystatechange';
            var defer, channel, port;
            var run = function () {
                var id = +this;
                // eslint-disable-next-line no-prototype-builtins
                if (queue.hasOwnProperty(id)) {
                    var fn = queue[id];
                    delete queue[id];
                    fn();
                }
            };
            var listener = function (event) {
                run.call(event.data);
            };
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
            if (!setTask || !clearTask) {
                setTask = function setImmediate(fn) {
                    var args = [];
                    var i = 1;
                    while (arguments.length > i) args.push(arguments[i++]);
                    queue[++counter] = function () {
                        // eslint-disable-next-line no-new-func
                        invoke(typeof fn == 'function' ? fn : Function(fn), args);
                    };
                    defer(counter);
                    return counter;
                };
                clearTask = function clearImmediate(id) {
                    delete queue[id];
                };
                // Node.js 0.8-
                if (__webpack_require__(37)(process) == 'process') {
                    defer = function (id) {
                        process.nextTick(ctx(run, id, 1));
                    };
                    // Sphere (JS game engine) Dispatch API
                } else if (Dispatch && Dispatch.now) {
                    defer = function (id) {
                        Dispatch.now(ctx(run, id, 1));
                    };
                    // Browsers with MessageChannel, includes WebWorkers
                } else if (MessageChannel) {
                    channel = new MessageChannel();
                    port = channel.port2;
                    channel.port1.onmessage = listener;
                    defer = ctx(port.postMessage, port, 1);
                    // Browsers with postMessage, skip WebWorkers
                    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
                } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
                    defer = function (id) {
                        global.postMessage(id + '', '*');
                    };
                    global.addEventListener('message', listener, false);
                    // IE8-
                } else if (ONREADYSTATECHANGE in cel('script')) {
                    defer = function (id) {
                        html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
                            html.removeChild(this);
                            run.call(id);
                        };
                    };
                    // Rest old browsers
                } else {
                    defer = function (id) {
                        setTimeout(ctx(run, id, 1), 0);
                    };
                }
            }
            module.exports = {
                set: setTask,
                clear: clearTask
            };


        /***/ }),
      /* 96 */
      /***/ (function(module, exports) {

            module.exports = function (exec) {
                try {
                    return { e: false, v: exec() };
                } catch (e) {
                    return { e: true, v: e };
                }
            };


        /***/ }),
      /* 97 */
      /***/ (function(module, exports, __webpack_require__) {

            var anObject = __webpack_require__(11);
            var isObject = __webpack_require__(14);
            var newPromiseCapability = __webpack_require__(65);

            module.exports = function (C, x) {
                anObject(C);
                if (isObject(x) && x.constructor === C) return x;
                var promiseCapability = newPromiseCapability.f(C);
                var resolve = promiseCapability.resolve;
                resolve(x);
                return promiseCapability.promise;
            };


        /***/ }),
      /* 98 */
      /***/ (function(module, exports, __webpack_require__) {

            var hide = __webpack_require__(20);
            module.exports = function (target, src, safe) {
                for (var key in src) {
                    if (safe && target[key]) target[key] = src[key];
                    else hide(target, key, src[key]);
                } return target;
            };


        /***/ }),
      /* 99 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = { "default": __webpack_require__(159), __esModule: true };

        /***/ }),
      /* 100 */,
      /* 101 */,
      /* 102 */,
      /* 103 */,
      /* 104 */,
      /* 105 */,
      /* 106 */,
      /* 107 */,
      /* 108 */,
      /* 109 */,
      /* 110 */,
      /* 111 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = !__webpack_require__(17) && !__webpack_require__(27)(function () {
                    return Object.defineProperty(__webpack_require__(61)('div'), 'a', { get: function () { return 7; } }).a != 7;
                });


        /***/ }),
      /* 112 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = __webpack_require__(20);


        /***/ }),
      /* 113 */
      /***/ (function(module, exports, __webpack_require__) {

            var has = __webpack_require__(26);
            var toIObject = __webpack_require__(28);
            var arrayIndexOf = __webpack_require__(141)(false);
            var IE_PROTO = __webpack_require__(63)('IE_PROTO');

            module.exports = function (object, names) {
                var O = toIObject(object);
                var i = 0;
                var result = [];
                var key;
                for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
                // Don't enum bug & hidden keys
                while (names.length > i) if (has(O, key = names[i++])) {
                    ~arrayIndexOf(result, key) || result.push(key);
                }
                return result;
            };


        /***/ }),
      /* 114 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;
            var ERROR = exports.ERROR = 'transport__error';
            var UPDATE = exports.UPDATE = 'transport__update';
            var STREAM = exports.STREAM = 'transport__stream';

        /***/ }),
      /* 115 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;
            var LOG = exports.LOG = 'popup_log';
            var OPENED = exports.OPENED = 'popup_opened';
            var OPEN_TIMEOUT = exports.OPEN_TIMEOUT = 'popup_open_timeout';
            var HANDSHAKE = exports.HANDSHAKE = 'popup_handshake';
            var CLOSE = exports.CLOSE = 'popup_close';
            var CLOSED = exports.CLOSED = 'popup_closed';
            var CANCEL_POPUP_REQUEST = exports.CANCEL_POPUP_REQUEST = 'ui_cancel-popup-request';

        /***/ }),
      /* 116 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;
            exports.INVALID_PIN_ERROR_MESSAGE = exports.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE = exports.INITIALIZATION_FAILED = exports.DEVICE_USED_ELSEWHERE = exports.PERMISSIONS_NOT_GRANTED = exports.POPUP_CLOSED = exports.INVALID_PARAMETERS = exports.DEVICE_CALL_IN_PROGRESS = exports.DEVICE_NOT_FOUND = exports.WRONG_TRANSPORT_CONFIG = exports.NO_TRANSPORT = exports.POPUP_TIMEOUT = exports.IFRAME_TIMEOUT = exports.IFRAME_INITIALIZED = exports.NO_IFRAME = exports.TrezorError = undefined;

            var _classCallCheck2 = __webpack_require__(15);

            var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

            var _possibleConstructorReturn2 = __webpack_require__(51);

            var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

            var _inherits2 = __webpack_require__(56);

            var _inherits3 = _interopRequireDefault(_inherits2);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            var TrezorError = exports.TrezorError = function (_Error) {
                (0, _inherits3.default)(TrezorError, _Error);

                function TrezorError(code, message) {
                    (0, _classCallCheck3.default)(this, TrezorError);

                    var _this = (0, _possibleConstructorReturn3.default)(this, _Error.call(this, message));

                    _this.code = code;
                    _this.message = message;
                    return _this;
                }

                return TrezorError;
            }(Error);

// level 100 error during initialization


            var NO_IFRAME = exports.NO_IFRAME = new TrezorError(100, 'Trezor.js not yet initialized');
            var IFRAME_INITIALIZED = exports.IFRAME_INITIALIZED = new TrezorError(101, 'Trezor.js has been already initialized');
            var IFRAME_TIMEOUT = exports.IFRAME_TIMEOUT = new TrezorError(102, 'Iframe timeout');
            var POPUP_TIMEOUT = exports.POPUP_TIMEOUT = new TrezorError(103, 'Popup timeout');

            var NO_TRANSPORT = exports.NO_TRANSPORT = new TrezorError(500, 'Transport is missing');
            var WRONG_TRANSPORT_CONFIG = exports.WRONG_TRANSPORT_CONFIG = new TrezorError(5002, 'Wrong config response'); // config_signed
            var DEVICE_NOT_FOUND = exports.DEVICE_NOT_FOUND = new TrezorError(501, 'Device not found');
// export const DEVICE_CALL_IN_PROGRESS: TrezorError = new TrezorError(502, "Device call in progress.");
            var DEVICE_CALL_IN_PROGRESS = exports.DEVICE_CALL_IN_PROGRESS = new TrezorError(503, 'Device call in progress');
            var INVALID_PARAMETERS = exports.INVALID_PARAMETERS = new TrezorError(504, 'Invalid parameters');
            var POPUP_CLOSED = exports.POPUP_CLOSED = new Error('Popup closed');

            var PERMISSIONS_NOT_GRANTED = exports.PERMISSIONS_NOT_GRANTED = new TrezorError(600, 'Permissions not granted');

            var DEVICE_USED_ELSEWHERE = exports.DEVICE_USED_ELSEWHERE = new TrezorError(700, 'Device is used in another window');
            var INITIALIZATION_FAILED = exports.INITIALIZATION_FAILED = new TrezorError(701, 'Initialization failed');

// a slight hack
// this error string is hard-coded
// in both bridge and extension
            var WRONG_PREVIOUS_SESSION_ERROR_MESSAGE = exports.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE = 'wrong previous session';
            var INVALID_PIN_ERROR_MESSAGE = exports.INVALID_PIN_ERROR_MESSAGE = 'PIN invalid';

        /***/ }),
      /* 117 */,
      /* 118 */
      /***/ (function(module, exports) {

            module.exports = function (done, value) {
                return { value: value, done: !!done };
            };


        /***/ }),
      /* 119 */
      /***/ (function(module, exports, __webpack_require__) {

            var META = __webpack_require__(46)('meta');
            var isObject = __webpack_require__(14);
            var has = __webpack_require__(26);
            var setDesc = __webpack_require__(21).f;
            var id = 0;
            var isExtensible = Object.isExtensible || function () {
                    return true;
                };
            var FREEZE = !__webpack_require__(27)(function () {
                return isExtensible(Object.preventExtensions({}));
            });
            var setMeta = function (it) {
                setDesc(it, META, { value: {
                    i: 'O' + ++id, // object ID
                    w: {}          // weak collections IDs
                } });
            };
            var fastKey = function (it, create) {
                // return primitive with prefix
                if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
                if (!has(it, META)) {
                    // can't set metadata to uncaught frozen object
                    if (!isExtensible(it)) return 'F';
                    // not necessary to add metadata
                    if (!create) return 'E';
                    // add missing metadata
                    setMeta(it);
                    // return object ID
                } return it[META].i;
            };
            var getWeak = function (it, create) {
                if (!has(it, META)) {
                    // can't set metadata to uncaught frozen object
                    if (!isExtensible(it)) return true;
                    // not necessary to add metadata
                    if (!create) return false;
                    // add missing metadata
                    setMeta(it);
                    // return hash weak collections IDs
                } return it[META].w;
            };
// add metadata on freeze-family methods calling
            var onFreeze = function (it) {
                if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
                return it;
            };
            var meta = module.exports = {
                KEY: META,
                NEED: false,
                fastKey: fastKey,
                getWeak: getWeak,
                onFreeze: onFreeze
            };


        /***/ }),
      /* 120 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";

            var global = __webpack_require__(7);
            var core = __webpack_require__(5);
            var dP = __webpack_require__(21);
            var DESCRIPTORS = __webpack_require__(17);
            var SPECIES = __webpack_require__(8)('species');

            module.exports = function (KEY) {
                var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
                if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
                    configurable: true,
                    get: function () { return this; }
                });
            };


        /***/ }),
      /* 121 */,
      /* 122 */,
      /* 123 */,
      /* 124 */,
      /* 125 */,
      /* 126 */,
      /* 127 */,
      /* 128 */,
      /* 129 */,
      /* 130 */,
      /* 131 */,
      /* 132 */,
      /* 133 */,
      /* 134 */,
      /* 135 */
      /***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
            var $keys = __webpack_require__(113);
            var hiddenKeys = __webpack_require__(73).concat('length', 'prototype');

            exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
                    return $keys(O, hiddenKeys);
                };


        /***/ }),
      /* 136 */
      /***/ (function(module, exports, __webpack_require__) {

            var pIE = __webpack_require__(55);
            var createDesc = __webpack_require__(45);
            var toIObject = __webpack_require__(28);
            var toPrimitive = __webpack_require__(76);
            var has = __webpack_require__(26);
            var IE8_DOM_DEFINE = __webpack_require__(111);
            var gOPD = Object.getOwnPropertyDescriptor;

            exports.f = __webpack_require__(17) ? gOPD : function getOwnPropertyDescriptor(O, P) {
                O = toIObject(O);
                P = toPrimitive(P, true);
                if (IE8_DOM_DEFINE) try {
                    return gOPD(O, P);
                } catch (e) { /* empty */ }
                if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
            };


        /***/ }),
      /* 137 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;

            var _regenerator = __webpack_require__(3);

            var _regenerator2 = _interopRequireDefault(_regenerator);

            var _asyncToGenerator2 = __webpack_require__(4);

            var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

            var _promise = __webpack_require__(32);

            var _promise2 = _interopRequireDefault(_promise);

            exports.create = create;
            exports.createAsync = createAsync;
            exports.resolveTimeoutPromise = resolveTimeoutPromise;
            exports.rejectTimeoutPromise = rejectTimeoutPromise;

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            function create(arg) {
                var _this = this;

                var localResolve = function localResolve(t) {};
                var localReject = function localReject(e) {};
                var id = void 0;

                var promise = new _promise2.default(function () {
                    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(resolve, reject) {
                        return _regenerator2.default.wrap(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        localResolve = resolve;
                                        localReject = reject;

                                        if (!(typeof arg === 'function')) {
                                            _context.next = 11;
                                            break;
                                        }

                                        _context.prev = 3;
                                        _context.next = 6;
                                        return arg();

                                    case 6:
                                        _context.next = 11;
                                        break;

                                    case 8:
                                        _context.prev = 8;
                                        _context.t0 = _context['catch'](3);

                                        reject(_context.t0);

                                    case 11:
                                        if (typeof arg === 'string') id = arg;

                                    case 12:
                                    case 'end':
                                        return _context.stop();
                                }
                            }
                        }, _callee, _this, [[3, 8]]);
                    }));

                    return function (_x, _x2) {
                        return _ref.apply(this, arguments);
                    };
                }());

                return {
                    id: id,
                    resolve: localResolve,
                    reject: localReject,
                    promise: promise
                };
            }

            function createAsync(innerFn) {
                var _this2 = this;

                var localResolve = function localResolve(t) {};
                var localReject = function localReject(e) {};

                var promise = new _promise2.default(function (resolve, reject) {
                    localResolve = resolve;
                    localReject = reject;
                });

                var inner = function () {
                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        _context2.next = 2;
                                        return innerFn();

                                    case 2:
                                    case 'end':
                                        return _context2.stop();
                                }
                            }
                        }, _callee2, _this2);
                    }));

                    return function inner() {
                        return _ref2.apply(this, arguments);
                    };
                }();

                return {
                    resolve: localResolve,
                    reject: localReject,
                    promise: promise,
                    run: function run() {
                        inner();
                        return promise;
                    }
                };
            }

            function resolveTimeoutPromise(delay, result) {
                return new _promise2.default(function (resolve) {
                    setTimeout(function () {
                        resolve(result);
                    }, delay);
                });
            }

            function rejectTimeoutPromise(delay, error) {
                return new _promise2.default(function (resolve, reject) {
                    setTimeout(function () {
                        reject(error);
                    }, delay);
                });
            }

        /***/ }),
      /* 138 */
      /***/ (function(module, exports, __webpack_require__) {

            var toInteger = __webpack_require__(59);
            var defined = __webpack_require__(60);
// true  -> String#at
// false -> String#codePointAt
            module.exports = function (TO_STRING) {
                return function (that, pos) {
                    var s = String(defined(that));
                    var i = toInteger(pos);
                    var l = s.length;
                    var a, b;
                    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
                    a = s.charCodeAt(i);
                    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
                        ? TO_STRING ? s.charAt(i) : a
                        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
                };
            };


        /***/ }),
      /* 139 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";

            var create = __webpack_require__(62);
            var descriptor = __webpack_require__(45);
            var setToStringTag = __webpack_require__(42);
            var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
            __webpack_require__(20)(IteratorPrototype, __webpack_require__(8)('iterator'), function () { return this; });

            module.exports = function (Constructor, NAME, next) {
                Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
                setToStringTag(Constructor, NAME + ' Iterator');
            };


        /***/ }),
      /* 140 */
      /***/ (function(module, exports, __webpack_require__) {

            var dP = __webpack_require__(21);
            var anObject = __webpack_require__(11);
            var getKeys = __webpack_require__(36);

            module.exports = __webpack_require__(17) ? Object.defineProperties : function defineProperties(O, Properties) {
                anObject(O);
                var keys = getKeys(Properties);
                var length = keys.length;
                var i = 0;
                var P;
                while (length > i) dP.f(O, P = keys[i++], Properties[P]);
                return O;
            };


        /***/ }),
      /* 141 */
      /***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
            var toIObject = __webpack_require__(28);
            var toLength = __webpack_require__(77);
            var toAbsoluteIndex = __webpack_require__(142);
            module.exports = function (IS_INCLUDES) {
                return function ($this, el, fromIndex) {
                    var O = toIObject($this);
                    var length = toLength(O.length);
                    var index = toAbsoluteIndex(fromIndex, length);
                    var value;
                    // Array#includes uses SameValueZero equality algorithm
                    // eslint-disable-next-line no-self-compare
                    if (IS_INCLUDES && el != el) while (length > index) {
                        value = O[index++];
                        // eslint-disable-next-line no-self-compare
                        if (value != value) return true;
                        // Array#indexOf ignores holes, Array#includes - not
                    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
                        if (O[index] === el) return IS_INCLUDES || index || 0;
                    } return !IS_INCLUDES && -1;
                };
            };


        /***/ }),
      /* 142 */
      /***/ (function(module, exports, __webpack_require__) {

            var toInteger = __webpack_require__(59);
            var max = Math.max;
            var min = Math.min;
            module.exports = function (index, length) {
                index = toInteger(index);
                return index < 0 ? max(index + length, 0) : min(index, length);
            };


        /***/ }),
      /* 143 */
      /***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
            var has = __webpack_require__(26);
            var toObject = __webpack_require__(53);
            var IE_PROTO = __webpack_require__(63)('IE_PROTO');
            var ObjectProto = Object.prototype;

            module.exports = Object.getPrototypeOf || function (O) {
                    O = toObject(O);
                    if (has(O, IE_PROTO)) return O[IE_PROTO];
                    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
                        return O.constructor.prototype;
                    } return O instanceof Object ? ObjectProto : null;
                };


        /***/ }),
      /* 144 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";

            var addToUnscopables = __webpack_require__(145);
            var step = __webpack_require__(118);
            var Iterators = __webpack_require__(33);
            var toIObject = __webpack_require__(28);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
            module.exports = __webpack_require__(75)(Array, 'Array', function (iterated, kind) {
                this._t = toIObject(iterated); // target
                this._i = 0;                   // next index
                this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
            }, function () {
                var O = this._t;
                var kind = this._k;
                var index = this._i++;
                if (!O || index >= O.length) {
                    this._t = undefined;
                    return step(1);
                }
                if (kind == 'keys') return step(0, index);
                if (kind == 'values') return step(0, O[index]);
                return step(0, [index, O[index]]);
            }, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
            Iterators.Arguments = Iterators.Array;

            addToUnscopables('keys');
            addToUnscopables('values');
            addToUnscopables('entries');


        /***/ }),
      /* 145 */
      /***/ (function(module, exports) {

            module.exports = function () { /* empty */ };


        /***/ }),
      /* 146 */
      /***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
            var cof = __webpack_require__(37);
            module.exports = Array.isArray || function isArray(arg) {
                    return cof(arg) == 'Array';
                };


        /***/ }),
      /* 147 */
      /***/ (function(module, exports, __webpack_require__) {

        /* WEBPACK VAR INJECTION */(function(global) {// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
                var g =
                    typeof global === "object" ? global :
                        typeof window === "object" ? window :
                            typeof self === "object" ? self : this;

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
                var hadRuntime = g.regeneratorRuntime &&
                    Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
                var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
                g.regeneratorRuntime = undefined;

                module.exports = __webpack_require__(148);

                if (hadRuntime) {
                    // Restore the original runtime.
                    g.regeneratorRuntime = oldRuntime;
                } else {
                    // Remove the global property added by runtime.js.
                    try {
                        delete g.regeneratorRuntime;
                    } catch(e) {
                        g.regeneratorRuntime = undefined;
                    }
                }

          /* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

        /***/ }),
      /* 148 */
      /***/ (function(module, exports, __webpack_require__) {

        /* WEBPACK VAR INJECTION */(function(global) {/**
             * Copyright (c) 2014, Facebook, Inc.
             * All rights reserved.
             *
             * This source code is licensed under the BSD-style license found in the
             * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
             * additional grant of patent rights can be found in the PATENTS file in
             * the same directory.
             */

            !(function(global) {
                "use strict";

                var Op = Object.prototype;
                var hasOwn = Op.hasOwnProperty;
                var undefined; // More compressible than void 0.
                var $Symbol = typeof Symbol === "function" ? Symbol : {};
                var iteratorSymbol = $Symbol.iterator || "@@iterator";
                var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
                var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

                var inModule = typeof module === "object";
                var runtime = global.regeneratorRuntime;
                if (runtime) {
                    if (inModule) {
                        // If regeneratorRuntime is defined globally and we're in a module,
                        // make the exports object identical to regeneratorRuntime.
                        module.exports = runtime;
                    }
                    // Don't bother evaluating the rest of this file if the runtime was
                    // already defined globally.
                    return;
                }

                // Define the runtime globally (as expected by generated code) as either
                // module.exports (if we're in a module) or a new, empty object.
                runtime = global.regeneratorRuntime = inModule ? module.exports : {};

                function wrap(innerFn, outerFn, self, tryLocsList) {
                    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
                    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
                    var generator = Object.create(protoGenerator.prototype);
                    var context = new Context(tryLocsList || []);

                    // The ._invoke method unifies the implementations of the .next,
                    // .throw, and .return methods.
                    generator._invoke = makeInvokeMethod(innerFn, self, context);

                    return generator;
                }
                runtime.wrap = wrap;

                // Try/catch helper to minimize deoptimizations. Returns a completion
                // record like context.tryEntries[i].completion. This interface could
                // have been (and was previously) designed to take a closure to be
                // invoked without arguments, but in all the cases we care about we
                // already have an existing method we want to call, so there's no need
                // to create a new function object. We can even get away with assuming
                // the method takes exactly one argument, since that happens to be true
                // in every case, so we don't have to touch the arguments object. The
                // only additional allocation required is the completion record, which
                // has a stable shape and so hopefully should be cheap to allocate.
                function tryCatch(fn, obj, arg) {
                    try {
                        return { type: "normal", arg: fn.call(obj, arg) };
                    } catch (err) {
                        return { type: "throw", arg: err };
                    }
                }

                var GenStateSuspendedStart = "suspendedStart";
                var GenStateSuspendedYield = "suspendedYield";
                var GenStateExecuting = "executing";
                var GenStateCompleted = "completed";

                // Returning this object from the innerFn has the same effect as
                // breaking out of the dispatch switch statement.
                var ContinueSentinel = {};

                // Dummy constructor functions that we use as the .constructor and
                // .constructor.prototype properties for functions that return Generator
                // objects. For full spec compliance, you may wish to configure your
                // minifier not to mangle the names of these two functions.
                function Generator() {}
                function GeneratorFunction() {}
                function GeneratorFunctionPrototype() {}

                // This is a polyfill for %IteratorPrototype% for environments that
                // don't natively support it.
                var IteratorPrototype = {};
                IteratorPrototype[iteratorSymbol] = function () {
                    return this;
                };

                var getProto = Object.getPrototypeOf;
                var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
                if (NativeIteratorPrototype &&
                    NativeIteratorPrototype !== Op &&
                    hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
                    // This environment has a native %IteratorPrototype%; use it instead
                    // of the polyfill.
                    IteratorPrototype = NativeIteratorPrototype;
                }

                var Gp = GeneratorFunctionPrototype.prototype =
                    Generator.prototype = Object.create(IteratorPrototype);
                GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
                GeneratorFunctionPrototype.constructor = GeneratorFunction;
                GeneratorFunctionPrototype[toStringTagSymbol] =
                    GeneratorFunction.displayName = "GeneratorFunction";

                // Helper for defining the .next, .throw, and .return methods of the
                // Iterator interface in terms of a single ._invoke method.
                function defineIteratorMethods(prototype) {
                    ["next", "throw", "return"].forEach(function(method) {
                        prototype[method] = function(arg) {
                            return this._invoke(method, arg);
                        };
                    });
                }

                runtime.isGeneratorFunction = function(genFun) {
                    var ctor = typeof genFun === "function" && genFun.constructor;
                    return ctor
                        ? ctor === GeneratorFunction ||
                        // For the native GeneratorFunction constructor, the best we can
                        // do is to check its .name property.
                        (ctor.displayName || ctor.name) === "GeneratorFunction"
                        : false;
                };

                runtime.mark = function(genFun) {
                    if (Object.setPrototypeOf) {
                        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
                    } else {
                        genFun.__proto__ = GeneratorFunctionPrototype;
                        if (!(toStringTagSymbol in genFun)) {
                            genFun[toStringTagSymbol] = "GeneratorFunction";
                        }
                    }
                    genFun.prototype = Object.create(Gp);
                    return genFun;
                };

                // Within the body of any async function, `await x` is transformed to
                // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
                // `hasOwn.call(value, "__await")` to determine if the yielded value is
                // meant to be awaited.
                runtime.awrap = function(arg) {
                    return { __await: arg };
                };

                function AsyncIterator(generator) {
                    function invoke(method, arg, resolve, reject) {
                        var record = tryCatch(generator[method], generator, arg);
                        if (record.type === "throw") {
                            reject(record.arg);
                        } else {
                            var result = record.arg;
                            var value = result.value;
                            if (value &&
                                typeof value === "object" &&
                                hasOwn.call(value, "__await")) {
                                return Promise.resolve(value.__await).then(function(value) {
                                    invoke("next", value, resolve, reject);
                                }, function(err) {
                                    invoke("throw", err, resolve, reject);
                                });
                            }

                            return Promise.resolve(value).then(function(unwrapped) {
                                // When a yielded Promise is resolved, its final value becomes
                                // the .value of the Promise<{value,done}> result for the
                                // current iteration. If the Promise is rejected, however, the
                                // result for this iteration will be rejected with the same
                                // reason. Note that rejections of yielded Promises are not
                                // thrown back into the generator function, as is the case
                                // when an awaited Promise is rejected. This difference in
                                // behavior between yield and await is important, because it
                                // allows the consumer to decide what to do with the yielded
                                // rejection (swallow it and continue, manually .throw it back
                                // into the generator, abandon iteration, whatever). With
                                // await, by contrast, there is no opportunity to examine the
                                // rejection reason outside the generator function, so the
                                // only option is to throw it from the await expression, and
                                // let the generator function handle the exception.
                                result.value = unwrapped;
                                resolve(result);
                            }, reject);
                        }
                    }

                    if (typeof global.process === "object" && global.process.domain) {
                        invoke = global.process.domain.bind(invoke);
                    }

                    var previousPromise;

                    function enqueue(method, arg) {
                        function callInvokeWithMethodAndArg() {
                            return new Promise(function(resolve, reject) {
                                invoke(method, arg, resolve, reject);
                            });
                        }

                        return previousPromise =
                            // If enqueue has been called before, then we want to wait until
                            // all previous Promises have been resolved before calling invoke,
                            // so that results are always delivered in the correct order. If
                            // enqueue has not been called before, then it is important to
                            // call invoke immediately, without waiting on a callback to fire,
                            // so that the async generator function has the opportunity to do
                            // any necessary setup in a predictable way. This predictability
                            // is why the Promise constructor synchronously invokes its
                            // executor callback, and why async functions synchronously
                            // execute code before the first await. Since we implement simple
                            // async functions in terms of async generators, it is especially
                            // important to get this right, even though it requires care.
                            previousPromise ? previousPromise.then(
                                callInvokeWithMethodAndArg,
                                // Avoid propagating failures to Promises returned by later
                                // invocations of the iterator.
                                callInvokeWithMethodAndArg
                            ) : callInvokeWithMethodAndArg();
                    }

                    // Define the unified helper method that is used to implement .next,
                    // .throw, and .return (see defineIteratorMethods).
                    this._invoke = enqueue;
                }

                defineIteratorMethods(AsyncIterator.prototype);
                AsyncIterator.prototype[asyncIteratorSymbol] = function () {
                    return this;
                };
                runtime.AsyncIterator = AsyncIterator;

                // Note that simple async functions are implemented on top of
                // AsyncIterator objects; they just return a Promise for the value of
                // the final result produced by the iterator.
                runtime.async = function(innerFn, outerFn, self, tryLocsList) {
                    var iter = new AsyncIterator(
                        wrap(innerFn, outerFn, self, tryLocsList)
                    );

                    return runtime.isGeneratorFunction(outerFn)
                        ? iter // If outerFn is a generator, return the full iterator.
                        : iter.next().then(function(result) {
                            return result.done ? result.value : iter.next();
                        });
                };

                function makeInvokeMethod(innerFn, self, context) {
                    var state = GenStateSuspendedStart;

                    return function invoke(method, arg) {
                        if (state === GenStateExecuting) {
                            throw new Error("Generator is already running");
                        }

                        if (state === GenStateCompleted) {
                            if (method === "throw") {
                                throw arg;
                            }

                            // Be forgiving, per 25.3.3.3.3 of the spec:
                            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
                            return doneResult();
                        }

                        context.method = method;
                        context.arg = arg;

                        while (true) {
                            var delegate = context.delegate;
                            if (delegate) {
                                var delegateResult = maybeInvokeDelegate(delegate, context);
                                if (delegateResult) {
                                    if (delegateResult === ContinueSentinel) continue;
                                    return delegateResult;
                                }
                            }

                            if (context.method === "next") {
                                // Setting context._sent for legacy support of Babel's
                                // function.sent implementation.
                                context.sent = context._sent = context.arg;

                            } else if (context.method === "throw") {
                                if (state === GenStateSuspendedStart) {
                                    state = GenStateCompleted;
                                    throw context.arg;
                                }

                                context.dispatchException(context.arg);

                            } else if (context.method === "return") {
                                context.abrupt("return", context.arg);
                            }

                            state = GenStateExecuting;

                            var record = tryCatch(innerFn, self, context);
                            if (record.type === "normal") {
                                // If an exception is thrown from innerFn, we leave state ===
                                // GenStateExecuting and loop back for another invocation.
                                state = context.done
                                    ? GenStateCompleted
                                    : GenStateSuspendedYield;

                                if (record.arg === ContinueSentinel) {
                                    continue;
                                }

                                return {
                                    value: record.arg,
                                    done: context.done
                                };

                            } else if (record.type === "throw") {
                                state = GenStateCompleted;
                                // Dispatch the exception by looping back around to the
                                // context.dispatchException(context.arg) call above.
                                context.method = "throw";
                                context.arg = record.arg;
                            }
                        }
                    };
                }

                // Call delegate.iterator[context.method](context.arg) and handle the
                // result, either by returning a { value, done } result from the
                // delegate iterator, or by modifying context.method and context.arg,
                // setting context.delegate to null, and returning the ContinueSentinel.
                function maybeInvokeDelegate(delegate, context) {
                    var method = delegate.iterator[context.method];
                    if (method === undefined) {
                        // A .throw or .return when the delegate iterator has no .throw
                        // method always terminates the yield* loop.
                        context.delegate = null;

                        if (context.method === "throw") {
                            if (delegate.iterator.return) {
                                // If the delegate iterator has a return method, give it a
                                // chance to clean up.
                                context.method = "return";
                                context.arg = undefined;
                                maybeInvokeDelegate(delegate, context);

                                if (context.method === "throw") {
                                    // If maybeInvokeDelegate(context) changed context.method from
                                    // "return" to "throw", let that override the TypeError below.
                                    return ContinueSentinel;
                                }
                            }

                            context.method = "throw";
                            context.arg = new TypeError(
                                "The iterator does not provide a 'throw' method");
                        }

                        return ContinueSentinel;
                    }

                    var record = tryCatch(method, delegate.iterator, context.arg);

                    if (record.type === "throw") {
                        context.method = "throw";
                        context.arg = record.arg;
                        context.delegate = null;
                        return ContinueSentinel;
                    }

                    var info = record.arg;

                    if (! info) {
                        context.method = "throw";
                        context.arg = new TypeError("iterator result is not an object");
                        context.delegate = null;
                        return ContinueSentinel;
                    }

                    if (info.done) {
                        // Assign the result of the finished delegate to the temporary
                        // variable specified by delegate.resultName (see delegateYield).
                        context[delegate.resultName] = info.value;

                        // Resume execution at the desired location (see delegateYield).
                        context.next = delegate.nextLoc;

                        // If context.method was "throw" but the delegate handled the
                        // exception, let the outer generator proceed normally. If
                        // context.method was "next", forget context.arg since it has been
                        // "consumed" by the delegate iterator. If context.method was
                        // "return", allow the original .return call to continue in the
                        // outer generator.
                        if (context.method !== "return") {
                            context.method = "next";
                            context.arg = undefined;
                        }

                    } else {
                        // Re-yield the result returned by the delegate method.
                        return info;
                    }

                    // The delegate iterator is finished, so forget it and continue with
                    // the outer generator.
                    context.delegate = null;
                    return ContinueSentinel;
                }

                // Define Generator.prototype.{next,throw,return} in terms of the
                // unified ._invoke helper method.
                defineIteratorMethods(Gp);

                Gp[toStringTagSymbol] = "Generator";

                // A Generator should always return itself as the iterator object when the
                // @@iterator function is called on it. Some browsers' implementations of the
                // iterator prototype chain incorrectly implement this, causing the Generator
                // object to not be returned from this call. This ensures that doesn't happen.
                // See https://github.com/facebook/regenerator/issues/274 for more details.
                Gp[iteratorSymbol] = function() {
                    return this;
                };

                Gp.toString = function() {
                    return "[object Generator]";
                };

                function pushTryEntry(locs) {
                    var entry = { tryLoc: locs[0] };

                    if (1 in locs) {
                        entry.catchLoc = locs[1];
                    }

                    if (2 in locs) {
                        entry.finallyLoc = locs[2];
                        entry.afterLoc = locs[3];
                    }

                    this.tryEntries.push(entry);
                }

                function resetTryEntry(entry) {
                    var record = entry.completion || {};
                    record.type = "normal";
                    delete record.arg;
                    entry.completion = record;
                }

                function Context(tryLocsList) {
                    // The root entry object (effectively a try statement without a catch
                    // or a finally block) gives us a place to store values thrown from
                    // locations where there is no enclosing try statement.
                    this.tryEntries = [{ tryLoc: "root" }];
                    tryLocsList.forEach(pushTryEntry, this);
                    this.reset(true);
                }

                runtime.keys = function(object) {
                    var keys = [];
                    for (var key in object) {
                        keys.push(key);
                    }
                    keys.reverse();

                    // Rather than returning an object with a next method, we keep
                    // things simple and return the next function itself.
                    return function next() {
                        while (keys.length) {
                            var key = keys.pop();
                            if (key in object) {
                                next.value = key;
                                next.done = false;
                                return next;
                            }
                        }

                        // To avoid creating an additional object, we just hang the .value
                        // and .done properties off the next function object itself. This
                        // also ensures that the minifier will not anonymize the function.
                        next.done = true;
                        return next;
                    };
                };

                function values(iterable) {
                    if (iterable) {
                        var iteratorMethod = iterable[iteratorSymbol];
                        if (iteratorMethod) {
                            return iteratorMethod.call(iterable);
                        }

                        if (typeof iterable.next === "function") {
                            return iterable;
                        }

                        if (!isNaN(iterable.length)) {
                            var i = -1, next = function next() {
                                while (++i < iterable.length) {
                                    if (hasOwn.call(iterable, i)) {
                                        next.value = iterable[i];
                                        next.done = false;
                                        return next;
                                    }
                                }

                                next.value = undefined;
                                next.done = true;

                                return next;
                            };

                            return next.next = next;
                        }
                    }

                    // Return an iterator with no values.
                    return { next: doneResult };
                }
                runtime.values = values;

                function doneResult() {
                    return { value: undefined, done: true };
                }

                Context.prototype = {
                    constructor: Context,

                    reset: function(skipTempReset) {
                        this.prev = 0;
                        this.next = 0;
                        // Resetting context._sent for legacy support of Babel's
                        // function.sent implementation.
                        this.sent = this._sent = undefined;
                        this.done = false;
                        this.delegate = null;

                        this.method = "next";
                        this.arg = undefined;

                        this.tryEntries.forEach(resetTryEntry);

                        if (!skipTempReset) {
                            for (var name in this) {
                                // Not sure about the optimal order of these conditions:
                                if (name.charAt(0) === "t" &&
                                    hasOwn.call(this, name) &&
                                    !isNaN(+name.slice(1))) {
                                    this[name] = undefined;
                                }
                            }
                        }
                    },

                    stop: function() {
                        this.done = true;

                        var rootEntry = this.tryEntries[0];
                        var rootRecord = rootEntry.completion;
                        if (rootRecord.type === "throw") {
                            throw rootRecord.arg;
                        }

                        return this.rval;
                    },

                    dispatchException: function(exception) {
                        if (this.done) {
                            throw exception;
                        }

                        var context = this;
                        function handle(loc, caught) {
                            record.type = "throw";
                            record.arg = exception;
                            context.next = loc;

                            if (caught) {
                                // If the dispatched exception was caught by a catch block,
                                // then let that catch block handle the exception normally.
                                context.method = "next";
                                context.arg = undefined;
                            }

                            return !! caught;
                        }

                        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                            var entry = this.tryEntries[i];
                            var record = entry.completion;

                            if (entry.tryLoc === "root") {
                                // Exception thrown outside of any try block that could handle
                                // it, so set the completion value of the entire function to
                                // throw the exception.
                                return handle("end");
                            }

                            if (entry.tryLoc <= this.prev) {
                                var hasCatch = hasOwn.call(entry, "catchLoc");
                                var hasFinally = hasOwn.call(entry, "finallyLoc");

                                if (hasCatch && hasFinally) {
                                    if (this.prev < entry.catchLoc) {
                                        return handle(entry.catchLoc, true);
                                    } else if (this.prev < entry.finallyLoc) {
                                        return handle(entry.finallyLoc);
                                    }

                                } else if (hasCatch) {
                                    if (this.prev < entry.catchLoc) {
                                        return handle(entry.catchLoc, true);
                                    }

                                } else if (hasFinally) {
                                    if (this.prev < entry.finallyLoc) {
                                        return handle(entry.finallyLoc);
                                    }

                                } else {
                                    throw new Error("try statement without catch or finally");
                                }
                            }
                        }
                    },

                    abrupt: function(type, arg) {
                        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                            var entry = this.tryEntries[i];
                            if (entry.tryLoc <= this.prev &&
                                hasOwn.call(entry, "finallyLoc") &&
                                this.prev < entry.finallyLoc) {
                                var finallyEntry = entry;
                                break;
                            }
                        }

                        if (finallyEntry &&
                            (type === "break" ||
                            type === "continue") &&
                            finallyEntry.tryLoc <= arg &&
                            arg <= finallyEntry.finallyLoc) {
                            // Ignore the finally entry if control is not jumping to a
                            // location outside the try/catch block.
                            finallyEntry = null;
                        }

                        var record = finallyEntry ? finallyEntry.completion : {};
                        record.type = type;
                        record.arg = arg;

                        if (finallyEntry) {
                            this.method = "next";
                            this.next = finallyEntry.finallyLoc;
                            return ContinueSentinel;
                        }

                        return this.complete(record);
                    },

                    complete: function(record, afterLoc) {
                        if (record.type === "throw") {
                            throw record.arg;
                        }

                        if (record.type === "break" ||
                            record.type === "continue") {
                            this.next = record.arg;
                        } else if (record.type === "return") {
                            this.rval = this.arg = record.arg;
                            this.method = "return";
                            this.next = "end";
                        } else if (record.type === "normal" && afterLoc) {
                            this.next = afterLoc;
                        }

                        return ContinueSentinel;
                    },

                    finish: function(finallyLoc) {
                        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                            var entry = this.tryEntries[i];
                            if (entry.finallyLoc === finallyLoc) {
                                this.complete(entry.completion, entry.afterLoc);
                                resetTryEntry(entry);
                                return ContinueSentinel;
                            }
                        }
                    },

                    "catch": function(tryLoc) {
                        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                            var entry = this.tryEntries[i];
                            if (entry.tryLoc === tryLoc) {
                                var record = entry.completion;
                                if (record.type === "throw") {
                                    var thrown = record.arg;
                                    resetTryEntry(entry);
                                }
                                return thrown;
                            }
                        }

                        // The context.catch method must only be called with a location
                        // argument that corresponds to a known catch block.
                        throw new Error("illegal catch attempt");
                    },

                    delegateYield: function(iterable, resultName, nextLoc) {
                        this.delegate = {
                            iterator: values(iterable),
                            resultName: resultName,
                            nextLoc: nextLoc
                        };

                        if (this.method === "next") {
                            // Deliberately forget the last sent value so that we don't
                            // accidentally pass it on to the delegate.
                            this.arg = undefined;
                        }

                        return ContinueSentinel;
                    }
                };
            })(
                // Among the various tricks for obtaining a reference to the global
                // object, this seems to be the most reliable technique that does not
                // use indirect eval (which violates Content Security Policy).
                typeof global === "object" ? global :
                    typeof window === "object" ? window :
                        typeof self === "object" ? self : this
            );

          /* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

        /***/ }),
      /* 149 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(86);
            __webpack_require__(52);
            __webpack_require__(54);
            __webpack_require__(150);
            __webpack_require__(156);
            __webpack_require__(157);
            module.exports = __webpack_require__(5).Promise;


        /***/ }),
      /* 150 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";

            var LIBRARY = __webpack_require__(44);
            var global = __webpack_require__(7);
            var ctx = __webpack_require__(25);
            var classof = __webpack_require__(78);
            var $export = __webpack_require__(10);
            var isObject = __webpack_require__(14);
            var aFunction = __webpack_require__(38);
            var anInstance = __webpack_require__(92);
            var forOf = __webpack_require__(64);
            var speciesConstructor = __webpack_require__(94);
            var task = __webpack_require__(95).set;
            var microtask = __webpack_require__(154)();
            var newPromiseCapabilityModule = __webpack_require__(65);
            var perform = __webpack_require__(96);
            var promiseResolve = __webpack_require__(97);
            var PROMISE = 'Promise';
            var TypeError = global.TypeError;
            var process = global.process;
            var $Promise = global[PROMISE];
            var isNode = classof(process) == 'process';
            var empty = function () { /* empty */ };
            var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
            var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

            var USE_NATIVE = !!function () {
                try {
                    // correct subclassing with @@species support
                    var promise = $Promise.resolve(1);
                    var FakePromise = (promise.constructor = {})[__webpack_require__(8)('species')] = function (exec) {
                        exec(empty, empty);
                    };
                    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
                    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
                } catch (e) { /* empty */ }
            }();

// helpers
            var isThenable = function (it) {
                var then;
                return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
            };
            var notify = function (promise, isReject) {
                if (promise._n) return;
                promise._n = true;
                var chain = promise._c;
                microtask(function () {
                    var value = promise._v;
                    var ok = promise._s == 1;
                    var i = 0;
                    var run = function (reaction) {
                        var handler = ok ? reaction.ok : reaction.fail;
                        var resolve = reaction.resolve;
                        var reject = reaction.reject;
                        var domain = reaction.domain;
                        var result, then;
                        try {
                            if (handler) {
                                if (!ok) {
                                    if (promise._h == 2) onHandleUnhandled(promise);
                                    promise._h = 1;
                                }
                                if (handler === true) result = value;
                                else {
                                    if (domain) domain.enter();
                                    result = handler(value);
                                    if (domain) domain.exit();
                                }
                                if (result === reaction.promise) {
                                    reject(TypeError('Promise-chain cycle'));
                                } else if (then = isThenable(result)) {
                                    then.call(result, resolve, reject);
                                } else resolve(result);
                            } else reject(value);
                        } catch (e) {
                            reject(e);
                        }
                    };
                    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
                    promise._c = [];
                    promise._n = false;
                    if (isReject && !promise._h) onUnhandled(promise);
                });
            };
            var onUnhandled = function (promise) {
                task.call(global, function () {
                    var value = promise._v;
                    var unhandled = isUnhandled(promise);
                    var result, handler, console;
                    if (unhandled) {
                        result = perform(function () {
                            if (isNode) {
                                process.emit('unhandledRejection', value, promise);
                            } else if (handler = global.onunhandledrejection) {
                                handler({ promise: promise, reason: value });
                            } else if ((console = global.console) && console.error) {
                                console.error('Unhandled promise rejection', value);
                            }
                        });
                        // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
                        promise._h = isNode || isUnhandled(promise) ? 2 : 1;
                    } promise._a = undefined;
                    if (unhandled && result.e) throw result.v;
                });
            };
            var isUnhandled = function (promise) {
                return promise._h !== 1 && (promise._a || promise._c).length === 0;
            };
            var onHandleUnhandled = function (promise) {
                task.call(global, function () {
                    var handler;
                    if (isNode) {
                        process.emit('rejectionHandled', promise);
                    } else if (handler = global.onrejectionhandled) {
                        handler({ promise: promise, reason: promise._v });
                    }
                });
            };
            var $reject = function (value) {
                var promise = this;
                if (promise._d) return;
                promise._d = true;
                promise = promise._w || promise; // unwrap
                promise._v = value;
                promise._s = 2;
                if (!promise._a) promise._a = promise._c.slice();
                notify(promise, true);
            };
            var $resolve = function (value) {
                var promise = this;
                var then;
                if (promise._d) return;
                promise._d = true;
                promise = promise._w || promise; // unwrap
                try {
                    if (promise === value) throw TypeError("Promise can't be resolved itself");
                    if (then = isThenable(value)) {
                        microtask(function () {
                            var wrapper = { _w: promise, _d: false }; // wrap
                            try {
                                then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
                            } catch (e) {
                                $reject.call(wrapper, e);
                            }
                        });
                    } else {
                        promise._v = value;
                        promise._s = 1;
                        notify(promise, false);
                    }
                } catch (e) {
                    $reject.call({ _w: promise, _d: false }, e); // wrap
                }
            };

// constructor polyfill
            if (!USE_NATIVE) {
                // 25.4.3.1 Promise(executor)
                $Promise = function Promise(executor) {
                    anInstance(this, $Promise, PROMISE, '_h');
                    aFunction(executor);
                    Internal.call(this);
                    try {
                        executor(ctx($resolve, this, 1), ctx($reject, this, 1));
                    } catch (err) {
                        $reject.call(this, err);
                    }
                };
                // eslint-disable-next-line no-unused-vars
                Internal = function Promise(executor) {
                    this._c = [];             // <- awaiting reactions
                    this._a = undefined;      // <- checked in isUnhandled reactions
                    this._s = 0;              // <- state
                    this._d = false;          // <- done
                    this._v = undefined;      // <- value
                    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
                    this._n = false;          // <- notify
                };
                Internal.prototype = __webpack_require__(98)($Promise.prototype, {
                    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
                    then: function then(onFulfilled, onRejected) {
                        var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
                        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
                        reaction.fail = typeof onRejected == 'function' && onRejected;
                        reaction.domain = isNode ? process.domain : undefined;
                        this._c.push(reaction);
                        if (this._a) this._a.push(reaction);
                        if (this._s) notify(this, false);
                        return reaction.promise;
                    },
                    // 25.4.5.1 Promise.prototype.catch(onRejected)
                    'catch': function (onRejected) {
                        return this.then(undefined, onRejected);
                    }
                });
                OwnPromiseCapability = function () {
                    var promise = new Internal();
                    this.promise = promise;
                    this.resolve = ctx($resolve, promise, 1);
                    this.reject = ctx($reject, promise, 1);
                };
                newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
                    return C === $Promise || C === Wrapper
                        ? new OwnPromiseCapability(C)
                        : newGenericPromiseCapability(C);
                };
            }

            $export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
            __webpack_require__(42)($Promise, PROMISE);
            __webpack_require__(120)(PROMISE);
            Wrapper = __webpack_require__(5)[PROMISE];

// statics
            $export($export.S + $export.F * !USE_NATIVE, PROMISE, {
                // 25.4.4.5 Promise.reject(r)
                reject: function reject(r) {
                    var capability = newPromiseCapability(this);
                    var $$reject = capability.reject;
                    $$reject(r);
                    return capability.promise;
                }
            });
            $export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
                // 25.4.4.6 Promise.resolve(x)
                resolve: function resolve(x) {
                    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
                }
            });
            $export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(155)(function (iter) {
                    $Promise.all(iter)['catch'](empty);
                })), PROMISE, {
                // 25.4.4.1 Promise.all(iterable)
                all: function all(iterable) {
                    var C = this;
                    var capability = newPromiseCapability(C);
                    var resolve = capability.resolve;
                    var reject = capability.reject;
                    var result = perform(function () {
                        var values = [];
                        var index = 0;
                        var remaining = 1;
                        forOf(iterable, false, function (promise) {
                            var $index = index++;
                            var alreadyCalled = false;
                            values.push(undefined);
                            remaining++;
                            C.resolve(promise).then(function (value) {
                                if (alreadyCalled) return;
                                alreadyCalled = true;
                                values[$index] = value;
                                --remaining || resolve(values);
                            }, reject);
                        });
                        --remaining || resolve(values);
                    });
                    if (result.e) reject(result.v);
                    return capability.promise;
                },
                // 25.4.4.4 Promise.race(iterable)
                race: function race(iterable) {
                    var C = this;
                    var capability = newPromiseCapability(C);
                    var reject = capability.reject;
                    var result = perform(function () {
                        forOf(iterable, false, function (promise) {
                            C.resolve(promise).then(capability.resolve, reject);
                        });
                    });
                    if (result.e) reject(result.v);
                    return capability.promise;
                }
            });


        /***/ }),
      /* 151 */
      /***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
            var anObject = __webpack_require__(11);
            module.exports = function (iterator, fn, value, entries) {
                try {
                    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
                    // 7.4.6 IteratorClose(iterator, completion)
                } catch (e) {
                    var ret = iterator['return'];
                    if (ret !== undefined) anObject(ret.call(iterator));
                    throw e;
                }
            };


        /***/ }),
      /* 152 */
      /***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
            var Iterators = __webpack_require__(33);
            var ITERATOR = __webpack_require__(8)('iterator');
            var ArrayProto = Array.prototype;

            module.exports = function (it) {
                return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
            };


        /***/ }),
      /* 153 */
      /***/ (function(module, exports) {

// fast apply, http://jsperf.lnkit.com/fast-apply/5
            module.exports = function (fn, args, that) {
                var un = that === undefined;
                switch (args.length) {
                    case 0: return un ? fn()
                        : fn.call(that);
                    case 1: return un ? fn(args[0])
                        : fn.call(that, args[0]);
                    case 2: return un ? fn(args[0], args[1])
                        : fn.call(that, args[0], args[1]);
                    case 3: return un ? fn(args[0], args[1], args[2])
                        : fn.call(that, args[0], args[1], args[2]);
                    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                        : fn.call(that, args[0], args[1], args[2], args[3]);
                } return fn.apply(that, args);
            };


        /***/ }),
      /* 154 */
      /***/ (function(module, exports, __webpack_require__) {

            var global = __webpack_require__(7);
            var macrotask = __webpack_require__(95).set;
            var Observer = global.MutationObserver || global.WebKitMutationObserver;
            var process = global.process;
            var Promise = global.Promise;
            var isNode = __webpack_require__(37)(process) == 'process';

            module.exports = function () {
                var head, last, notify;

                var flush = function () {
                    var parent, fn;
                    if (isNode && (parent = process.domain)) parent.exit();
                    while (head) {
                        fn = head.fn;
                        head = head.next;
                        try {
                            fn();
                        } catch (e) {
                            if (head) notify();
                            else last = undefined;
                            throw e;
                        }
                    } last = undefined;
                    if (parent) parent.enter();
                };

                // Node.js
                if (isNode) {
                    notify = function () {
                        process.nextTick(flush);
                    };
                    // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
                } else if (Observer && !(global.navigator && global.navigator.standalone)) {
                    var toggle = true;
                    var node = document.createTextNode('');
                    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
                    notify = function () {
                        node.data = toggle = !toggle;
                    };
                    // environments with maybe non-completely correct, but existent Promise
                } else if (Promise && Promise.resolve) {
                    var promise = Promise.resolve();
                    notify = function () {
                        promise.then(flush);
                    };
                    // for other environments - macrotask based on:
                    // - setImmediate
                    // - MessageChannel
                    // - window.postMessag
                    // - onreadystatechange
                    // - setTimeout
                } else {
                    notify = function () {
                        // strange IE + webpack dev server bug - use .call(global)
                        macrotask.call(global, flush);
                    };
                }

                return function (fn) {
                    var task = { fn: fn, next: undefined };
                    if (last) last.next = task;
                    if (!head) {
                        head = task;
                        notify();
                    } last = task;
                };
            };


        /***/ }),
      /* 155 */
      /***/ (function(module, exports, __webpack_require__) {

            var ITERATOR = __webpack_require__(8)('iterator');
            var SAFE_CLOSING = false;

            try {
                var riter = [7][ITERATOR]();
                riter['return'] = function () { SAFE_CLOSING = true; };
                // eslint-disable-next-line no-throw-literal
                Array.from(riter, function () { throw 2; });
            } catch (e) { /* empty */ }

            module.exports = function (exec, skipClosing) {
                if (!skipClosing && !SAFE_CLOSING) return false;
                var safe = false;
                try {
                    var arr = [7];
                    var iter = arr[ITERATOR]();
                    iter.next = function () { return { done: safe = true }; };
                    arr[ITERATOR] = function () { return iter; };
                    exec(arr);
                } catch (e) { /* empty */ }
                return safe;
            };


        /***/ }),
      /* 156 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";
// https://github.com/tc39/proposal-promise-finally

            var $export = __webpack_require__(10);
            var core = __webpack_require__(5);
            var global = __webpack_require__(7);
            var speciesConstructor = __webpack_require__(94);
            var promiseResolve = __webpack_require__(97);

            $export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
                var C = speciesConstructor(this, core.Promise || global.Promise);
                var isFunction = typeof onFinally == 'function';
                return this.then(
                    isFunction ? function (x) {
                        return promiseResolve(C, onFinally()).then(function () { return x; });
                    } : onFinally,
                    isFunction ? function (e) {
                        return promiseResolve(C, onFinally()).then(function () { throw e; });
                    } : onFinally
                );
            } });


        /***/ }),
      /* 157 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";

// https://github.com/tc39/proposal-promise-try
            var $export = __webpack_require__(10);
            var newPromiseCapability = __webpack_require__(65);
            var perform = __webpack_require__(96);

            $export($export.S, 'Promise', { 'try': function (callbackfn) {
                var promiseCapability = newPromiseCapability.f(this);
                var result = perform(callbackfn);
                (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
                return promiseCapability.promise;
            } });


        /***/ }),
      /* 158 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;
            var HANDSHAKE = exports.HANDSHAKE = 'iframe_handshake';

            var ERROR = exports.ERROR = 'iframe_error';
            var CALL = exports.CALL = 'iframe_call';
            var RESPONSE = exports.RESPONSE = 'iframe_response';

        /***/ }),
      /* 159 */
      /***/ (function(module, exports, __webpack_require__) {

            var core = __webpack_require__(5);
            var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
            module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
                return $JSON.stringify.apply($JSON, arguments);
            };


        /***/ }),
      /* 160 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(54);
            __webpack_require__(52);
            module.exports = __webpack_require__(161);


        /***/ }),
      /* 161 */
      /***/ (function(module, exports, __webpack_require__) {

            var anObject = __webpack_require__(11);
            var get = __webpack_require__(93);
            module.exports = __webpack_require__(5).getIterator = function (it) {
                var iterFn = get(it);
                if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
                return anObject(iterFn.call(it));
            };


        /***/ }),
      /* 162 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(163);
            module.exports = __webpack_require__(5).Object.keys;


        /***/ }),
      /* 163 */
      /***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 Object.keys(O)
            var toObject = __webpack_require__(53);
            var $keys = __webpack_require__(36);

            __webpack_require__(164)('keys', function () {
                return function keys(it) {
                    return $keys(toObject(it));
                };
            });


        /***/ }),
      /* 164 */
      /***/ (function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
            var $export = __webpack_require__(10);
            var core = __webpack_require__(5);
            var fails = __webpack_require__(27);
            module.exports = function (KEY, exec) {
                var fn = (core.Object || {})[KEY] || Object[KEY];
                var exp = {};
                exp[KEY] = exec(fn);
                $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
            };


        /***/ }),
      /* 165 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;
            exports.setDataAttributes = exports.validate = exports.parse = undefined;

            var _getIterator2 = __webpack_require__(18);

            var _getIterator3 = _interopRequireDefault(_getIterator2);

            var _keys = __webpack_require__(58);

            var _keys2 = _interopRequireDefault(_keys);

            var _extends2 = __webpack_require__(29);

            var _extends3 = _interopRequireDefault(_extends2);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

        /*
         * Initial settings for connect.
         * It could be changed by passing values into TrezorConnect.init(...) method
         */

            var initialSettings = {
                debug: false,
                trustedHost: false,
                iframe_src: 'iframe.html',
                popup_src: 'popup.html',
                config_src: 'config.json',
                coins_src: 'coins.json',
                firmware_releases_src: 'releases.json',
                transport_config_src: 'config_signed.bin',
                latest_bridge_src: 'latest.txt',
                transport_reconnect: true
            };

            var currentSettings = initialSettings;

            var parse = exports.parse = function parse(input) {
                if (!input) return currentSettings;

                var settings = (0, _extends3.default)({}, currentSettings);
                if (typeof input.debug === 'boolean') {
                    settings.debug = input.debug;
                } else if (typeof input.debug === 'string') {
                    settings.debug = input.debug === 'true';
                }

                if (typeof input.hostname === 'string') {
                    settings.trustedHost = input.hostname === 'localhost'; // || trezor.io
                }
                var hostname = window.location.hostname;
                var host = hostname.substring(hostname.lastIndexOf(".", hostname.lastIndexOf(".") - 1) + 1);
                settings.trustedHost = host === 'localhost' || host === 'trezor.io';

                if (typeof input.iframe_src === 'string') {
                    // TODO: escape string
                    settings.iframe_src = input.iframe_src;
                }

                if (typeof input.popup_src === 'string') {
                    // TODO: escape string
                    settings.popup_src = input.popup_src;
                }

                if (typeof input.coins_src === 'string') {
                    // TODO: escape string
                    settings.coins_src = input.coins_src;
                }

                if (typeof input.firmware_releases_src === 'string') {
                    // TODO: escape string
                    settings.firmware_releases_src = input.firmware_releases_src;
                }

                if (typeof input.transport_config_src === 'string') {
                    // TODO: escape string
                    settings.transport_config_src = input.transport_config_src;
                }

                if (typeof input.latest_bridge_src === 'string') {
                    // TODO: escape string
                    settings.latest_bridge_src = input.latest_bridge_src;
                }

                if (typeof input.transport_reconnect === 'boolean') {
                    settings.transport_reconnect = input.transport_reconnect;
                }

                currentSettings = settings;
                return currentSettings;
            };

            var validate = exports.validate = function validate(input) {
                // parse(input);
                var valid = {};

                for (var _iterator = (0, _keys2.default)(input), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
                    var _ref;

                    if (_isArray) {
                        if (_i >= _iterator.length) break;
                        _ref = _iterator[_i++];
                    } else {
                        _i = _iterator.next();
                        if (_i.done) break;
                        _ref = _i.value;
                    }

                    var _key = _ref;

                    if (typeof initialSettings[_key] !== 'undefined') {
                        valid[_key] = input[_key];
                    }
                }
                return valid;
            };

            var setDataAttributes = exports.setDataAttributes = function setDataAttributes(iframe, input) {
                var settings = validate(input);
                var attrs = {};
                var ignored = ['iframe_src', 'popup_src'];
                for (var _iterator2 = (0, _keys2.default)(settings), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
                    var _ref2;

                    if (_isArray2) {
                        if (_i2 >= _iterator2.length) break;
                        _ref2 = _iterator2[_i2++];
                    } else {
                        _i2 = _iterator2.next();
                        if (_i2.done) break;
                        _ref2 = _i2.value;
                    }

                    var _key2 = _ref2;

                    if (ignored.indexOf(_key2) < 0) {
                        iframe.setAttribute('data-' + _key2, encodeURI(settings[_key2].toString()));
                    }
                }
                return attrs;
            };

        /***/ }),
      /* 166 */,
      /* 167 */,
      /* 168 */,
      /* 169 */,
      /* 170 */,
      /* 171 */,
      /* 172 */,
      /* 173 */,
      /* 174 */,
      /* 175 */,
      /* 176 */,
      /* 177 */,
      /* 178 */,
      /* 179 */,
      /* 180 */,
      /* 181 */,
      /* 182 */,
      /* 183 */,
      /* 184 */,
      /* 185 */,
      /* 186 */,
      /* 187 */,
      /* 188 */,
      /* 189 */,
      /* 190 */,
      /* 191 */,
      /* 192 */,
      /* 193 */,
      /* 194 */,
      /* 195 */,
      /* 196 */,
      /* 197 */,
      /* 198 */,
      /* 199 */,
      /* 200 */,
      /* 201 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = { "default": __webpack_require__(202), __esModule: true };

        /***/ }),
      /* 202 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(52);
            __webpack_require__(54);
            module.exports = __webpack_require__(89).f('iterator');


        /***/ }),
      /* 203 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = { "default": __webpack_require__(204), __esModule: true };

        /***/ }),
      /* 204 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(205);
            __webpack_require__(86);
            __webpack_require__(208);
            __webpack_require__(209);
            module.exports = __webpack_require__(5).Symbol;


        /***/ }),
      /* 205 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";

// ECMAScript 6 symbols shim
            var global = __webpack_require__(7);
            var has = __webpack_require__(26);
            var DESCRIPTORS = __webpack_require__(17);
            var $export = __webpack_require__(10);
            var redefine = __webpack_require__(112);
            var META = __webpack_require__(119).KEY;
            var $fails = __webpack_require__(27);
            var shared = __webpack_require__(72);
            var setToStringTag = __webpack_require__(42);
            var uid = __webpack_require__(46);
            var wks = __webpack_require__(8);
            var wksExt = __webpack_require__(89);
            var wksDefine = __webpack_require__(90);
            var enumKeys = __webpack_require__(206);
            var isArray = __webpack_require__(146);
            var anObject = __webpack_require__(11);
            var isObject = __webpack_require__(14);
            var toIObject = __webpack_require__(28);
            var toPrimitive = __webpack_require__(76);
            var createDesc = __webpack_require__(45);
            var _create = __webpack_require__(62);
            var gOPNExt = __webpack_require__(207);
            var $GOPD = __webpack_require__(136);
            var $DP = __webpack_require__(21);
            var $keys = __webpack_require__(36);
            var gOPD = $GOPD.f;
            var dP = $DP.f;
            var gOPN = gOPNExt.f;
            var $Symbol = global.Symbol;
            var $JSON = global.JSON;
            var _stringify = $JSON && $JSON.stringify;
            var PROTOTYPE = 'prototype';
            var HIDDEN = wks('_hidden');
            var TO_PRIMITIVE = wks('toPrimitive');
            var isEnum = {}.propertyIsEnumerable;
            var SymbolRegistry = shared('symbol-registry');
            var AllSymbols = shared('symbols');
            var OPSymbols = shared('op-symbols');
            var ObjectProto = Object[PROTOTYPE];
            var USE_NATIVE = typeof $Symbol == 'function';
            var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
            var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
            var setSymbolDesc = DESCRIPTORS && $fails(function () {
                return _create(dP({}, 'a', {
                        get: function () { return dP(this, 'a', { value: 7 }).a; }
                    })).a != 7;
            }) ? function (it, key, D) {
                var protoDesc = gOPD(ObjectProto, key);
                if (protoDesc) delete ObjectProto[key];
                dP(it, key, D);
                if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
            } : dP;

            var wrap = function (tag) {
                var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
                sym._k = tag;
                return sym;
            };

            var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
                return typeof it == 'symbol';
            } : function (it) {
                return it instanceof $Symbol;
            };

            var $defineProperty = function defineProperty(it, key, D) {
                if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
                anObject(it);
                key = toPrimitive(key, true);
                anObject(D);
                if (has(AllSymbols, key)) {
                    if (!D.enumerable) {
                        if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
                        it[HIDDEN][key] = true;
                    } else {
                        if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
                        D = _create(D, { enumerable: createDesc(0, false) });
                    } return setSymbolDesc(it, key, D);
                } return dP(it, key, D);
            };
            var $defineProperties = function defineProperties(it, P) {
                anObject(it);
                var keys = enumKeys(P = toIObject(P));
                var i = 0;
                var l = keys.length;
                var key;
                while (l > i) $defineProperty(it, key = keys[i++], P[key]);
                return it;
            };
            var $create = function create(it, P) {
                return P === undefined ? _create(it) : $defineProperties(_create(it), P);
            };
            var $propertyIsEnumerable = function propertyIsEnumerable(key) {
                var E = isEnum.call(this, key = toPrimitive(key, true));
                if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
                return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
            };
            var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
                it = toIObject(it);
                key = toPrimitive(key, true);
                if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
                var D = gOPD(it, key);
                if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
                return D;
            };
            var $getOwnPropertyNames = function getOwnPropertyNames(it) {
                var names = gOPN(toIObject(it));
                var result = [];
                var i = 0;
                var key;
                while (names.length > i) {
                    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
                } return result;
            };
            var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
                var IS_OP = it === ObjectProto;
                var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
                var result = [];
                var i = 0;
                var key;
                while (names.length > i) {
                    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
                } return result;
            };

// 19.4.1.1 Symbol([description])
            if (!USE_NATIVE) {
                $Symbol = function Symbol() {
                    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
                    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
                    var $set = function (value) {
                        if (this === ObjectProto) $set.call(OPSymbols, value);
                        if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
                        setSymbolDesc(this, tag, createDesc(1, value));
                    };
                    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
                    return wrap(tag);
                };
                redefine($Symbol[PROTOTYPE], 'toString', function toString() {
                    return this._k;
                });

                $GOPD.f = $getOwnPropertyDescriptor;
                $DP.f = $defineProperty;
                __webpack_require__(135).f = gOPNExt.f = $getOwnPropertyNames;
                __webpack_require__(55).f = $propertyIsEnumerable;
                __webpack_require__(91).f = $getOwnPropertySymbols;

                if (DESCRIPTORS && !__webpack_require__(44)) {
                    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
                }

                wksExt.f = function (name) {
                    return wrap(wks(name));
                };
            }

            $export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

            for (var es6Symbols = (
                // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
                'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
            ).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

            for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

            $export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
                // 19.4.2.1 Symbol.for(key)
                'for': function (key) {
                    return has(SymbolRegistry, key += '')
                        ? SymbolRegistry[key]
                        : SymbolRegistry[key] = $Symbol(key);
                },
                // 19.4.2.5 Symbol.keyFor(sym)
                keyFor: function keyFor(sym) {
                    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
                    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
                },
                useSetter: function () { setter = true; },
                useSimple: function () { setter = false; }
            });

            $export($export.S + $export.F * !USE_NATIVE, 'Object', {
                // 19.1.2.2 Object.create(O [, Properties])
                create: $create,
                // 19.1.2.4 Object.defineProperty(O, P, Attributes)
                defineProperty: $defineProperty,
                // 19.1.2.3 Object.defineProperties(O, Properties)
                defineProperties: $defineProperties,
                // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
                getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
                // 19.1.2.7 Object.getOwnPropertyNames(O)
                getOwnPropertyNames: $getOwnPropertyNames,
                // 19.1.2.8 Object.getOwnPropertySymbols(O)
                getOwnPropertySymbols: $getOwnPropertySymbols
            });

// 24.3.2 JSON.stringify(value [, replacer [, space]])
            $JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
                    var S = $Symbol();
                    // MS Edge converts symbol values to JSON as {}
                    // WebKit converts symbol values to JSON as null
                    // V8 throws on boxed symbols
                    return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
                })), 'JSON', {
                stringify: function stringify(it) {
                    var args = [it];
                    var i = 1;
                    var replacer, $replacer;
                    while (arguments.length > i) args.push(arguments[i++]);
                    $replacer = replacer = args[1];
                    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
                    if (!isArray(replacer)) replacer = function (key, value) {
                        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
                        if (!isSymbol(value)) return value;
                    };
                    args[1] = replacer;
                    return _stringify.apply($JSON, args);
                }
            });

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
            $Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(20)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
            setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
            setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
            setToStringTag(global.JSON, 'JSON', true);


        /***/ }),
      /* 206 */
      /***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
            var getKeys = __webpack_require__(36);
            var gOPS = __webpack_require__(91);
            var pIE = __webpack_require__(55);
            module.exports = function (it) {
                var result = getKeys(it);
                var getSymbols = gOPS.f;
                if (getSymbols) {
                    var symbols = getSymbols(it);
                    var isEnum = pIE.f;
                    var i = 0;
                    var key;
                    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
                } return result;
            };


        /***/ }),
      /* 207 */
      /***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
            var toIObject = __webpack_require__(28);
            var gOPN = __webpack_require__(135).f;
            var toString = {}.toString;

            var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
                ? Object.getOwnPropertyNames(window) : [];

            var getWindowNames = function (it) {
                try {
                    return gOPN(it);
                } catch (e) {
                    return windowNames.slice();
                }
            };

            module.exports.f = function getOwnPropertyNames(it) {
                return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
            };


        /***/ }),
      /* 208 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(90)('asyncIterator');


        /***/ }),
      /* 209 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(90)('observable');


        /***/ }),
      /* 210 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = { "default": __webpack_require__(211), __esModule: true };

        /***/ }),
      /* 211 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(212);
            module.exports = __webpack_require__(5).Object.setPrototypeOf;


        /***/ }),
      /* 212 */
      /***/ (function(module, exports, __webpack_require__) {

// 19.1.3.19 Object.setPrototypeOf(O, proto)
            var $export = __webpack_require__(10);
            $export($export.S, 'Object', { setPrototypeOf: __webpack_require__(213).set });


        /***/ }),
      /* 213 */
      /***/ (function(module, exports, __webpack_require__) {

// Works with __proto__ only. Old v8 can't work with null proto objects.
        /* eslint-disable no-proto */
            var isObject = __webpack_require__(14);
            var anObject = __webpack_require__(11);
            var check = function (O, proto) {
                anObject(O);
                if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
            };
            module.exports = {
                set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
                    function (test, buggy, set) {
                        try {
                            set = __webpack_require__(25)(Function.call, __webpack_require__(136).f(Object.prototype, '__proto__').set, 2);
                            set(test, []);
                            buggy = !(test instanceof Array);
                        } catch (e) { buggy = true; }
                        return function setPrototypeOf(O, proto) {
                            check(O, proto);
                            if (buggy) O.__proto__ = proto;
                            else set(O, proto);
                            return O;
                        };
                    }({}, false) : undefined),
                check: check
            };


        /***/ }),
      /* 214 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = { "default": __webpack_require__(215), __esModule: true };

        /***/ }),
      /* 215 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(216);
            var $Object = __webpack_require__(5).Object;
            module.exports = function create(P, D) {
                return $Object.create(P, D);
            };


        /***/ }),
      /* 216 */
      /***/ (function(module, exports, __webpack_require__) {

            var $export = __webpack_require__(10);
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
            $export($export.S, 'Object', { create: __webpack_require__(62) });


        /***/ }),
      /* 217 */
      /***/ (function(module, exports, __webpack_require__) {

            module.exports = { "default": __webpack_require__(218), __esModule: true };

        /***/ }),
      /* 218 */
      /***/ (function(module, exports, __webpack_require__) {

            __webpack_require__(219);
            module.exports = __webpack_require__(5).Object.assign;


        /***/ }),
      /* 219 */
      /***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
            var $export = __webpack_require__(10);

            $export($export.S + $export.F, 'Object', { assign: __webpack_require__(220) });


        /***/ }),
      /* 220 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";

// 19.1.2.1 Object.assign(target, source, ...)
            var getKeys = __webpack_require__(36);
            var gOPS = __webpack_require__(91);
            var pIE = __webpack_require__(55);
            var toObject = __webpack_require__(53);
            var IObject = __webpack_require__(85);
            var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
            module.exports = !$assign || __webpack_require__(27)(function () {
                var A = {};
                var B = {};
                // eslint-disable-next-line no-undef
                var S = Symbol();
                var K = 'abcdefghijklmnopqrst';
                A[S] = 7;
                K.split('').forEach(function (k) { B[k] = k; });
                return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
            }) ? function assign(target, source) { // eslint-disable-line no-unused-vars
                var T = toObject(target);
                var aLen = arguments.length;
                var index = 1;
                var getSymbols = gOPS.f;
                var isEnum = pIE.f;
                while (aLen > index) {
                    var S = IObject(arguments[index++]);
                    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
                    var length = keys.length;
                    var j = 0;
                    var key;
                    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
                } return T;
            } : $assign;


        /***/ }),
      /* 221 */,
      /* 222 */,
      /* 223 */,
      /* 224 */,
      /* 225 */,
      /* 226 */,
      /* 227 */,
      /* 228 */,
      /* 229 */,
      /* 230 */,
      /* 231 */,
      /* 232 */,
      /* 233 */,
      /* 234 */,
      /* 235 */,
      /* 236 */,
      /* 237 */,
      /* 238 */,
      /* 239 */,
      /* 240 */,
      /* 241 */,
      /* 242 */,
      /* 243 */,
      /* 244 */,
      /* 245 */,
      /* 246 */,
      /* 247 */,
      /* 248 */,
      /* 249 */,
      /* 250 */,
      /* 251 */,
      /* 252 */,
      /* 253 */,
      /* 254 */,
      /* 255 */,
      /* 256 */,
      /* 257 */,
      /* 258 */,
      /* 259 */,
      /* 260 */,
      /* 261 */,
      /* 262 */,
      /* 263 */,
      /* 264 */,
      /* 265 */,
      /* 266 */,
      /* 267 */,
      /* 268 */,
      /* 269 */,
      /* 270 */,
      /* 271 */,
      /* 272 */,
      /* 273 */,
      /* 274 */,
      /* 275 */,
      /* 276 */,
      /* 277 */,
      /* 278 */,
      /* 279 */,
      /* 280 */,
      /* 281 */,
      /* 282 */,
      /* 283 */,
      /* 284 */,
      /* 285 */,
      /* 286 */,
      /* 287 */,
      /* 288 */,
      /* 289 */,
      /* 290 */,
      /* 291 */,
      /* 292 */,
      /* 293 */,
      /* 294 */,
      /* 295 */,
      /* 296 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;
            exports.eventEmitter = undefined;

            var _extends2 = __webpack_require__(29);

            var _extends3 = _interopRequireDefault(_extends2);

            var _regenerator = __webpack_require__(3);

            var _regenerator2 = _interopRequireDefault(_regenerator);

            var _asyncToGenerator2 = __webpack_require__(4);

            var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

            var _classCallCheck2 = __webpack_require__(15);

            var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

            var _events = __webpack_require__(39);

            var _events2 = _interopRequireDefault(_events);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            var eventEmitter = exports.eventEmitter = new _events2.default();

            var Trezor = function () {
                function Trezor() {
                    (0, _classCallCheck3.default)(this, Trezor);
                }

                Trezor.on = function on(type, fn) {
                    eventEmitter.on(type, fn);
                };

                Trezor.off = function off(type, fn) {
                    eventEmitter.removeListener(type, fn);
                };

                Trezor.init = function () {
                    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(settings) {
                        return _regenerator2.default.wrap(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                    case 'end':
                                        return _context.stop();
                                }
                            }
                        }, _callee, this);
                    }));

                    function init(_x) {
                        return _ref.apply(this, arguments);
                    }

                    return init;
                }();

                Trezor.changeSettings = function changeSettings(settings) {
                    // to override
                };

                Trezor.getFeatures = function () {
                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(params) {
                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        _context2.next = 2;
                                        return this.__call((0, _extends3.default)({ method: 'getFeatures' }, params));

                                    case 2:
                                        return _context2.abrupt('return', _context2.sent);

                                    case 3:
                                    case 'end':
                                        return _context2.stop();
                                }
                            }
                        }, _callee2, this);
                    }));

                    function getFeatures(_x2) {
                        return _ref2.apply(this, arguments);
                    }

                    return getFeatures;
                }();

                Trezor.cipherKeyValue = function () {
                    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(params) {
                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                            while (1) {
                                switch (_context3.prev = _context3.next) {
                                    case 0:
                                        _context3.next = 2;
                                        return this.__call((0, _extends3.default)({ method: 'cipherKeyValue' }, params));

                                    case 2:
                                        return _context3.abrupt('return', _context3.sent);

                                    case 3:
                                    case 'end':
                                        return _context3.stop();
                                }
                            }
                        }, _callee3, this);
                    }));

                    function cipherKeyValue(_x3) {
                        return _ref3.apply(this, arguments);
                    }

                    return cipherKeyValue;
                }();

                Trezor.requestLogin = function () {
                    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(params) {
                        return _regenerator2.default.wrap(function _callee4$(_context4) {
                            while (1) {
                                switch (_context4.prev = _context4.next) {
                                    case 0:
                                        _context4.next = 2;
                                        return this.__call((0, _extends3.default)({ method: 'requestLogin' }, params));

                                    case 2:
                                        return _context4.abrupt('return', _context4.sent);

                                    case 3:
                                    case 'end':
                                        return _context4.stop();
                                }
                            }
                        }, _callee4, this);
                    }));

                    function requestLogin(_x4) {
                        return _ref4.apply(this, arguments);
                    }

                    return requestLogin;
                }();

                Trezor.getPublicKey = function () {
                    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(params) {
                        return _regenerator2.default.wrap(function _callee5$(_context5) {
                            while (1) {
                                switch (_context5.prev = _context5.next) {
                                    case 0:
                                        _context5.next = 2;
                                        return this.__call((0, _extends3.default)({ method: 'getxpub' }, params));

                                    case 2:
                                        return _context5.abrupt('return', _context5.sent);

                                    case 3:
                                    case 'end':
                                        return _context5.stop();
                                }
                            }
                        }, _callee5, this);
                    }));

                    function getPublicKey(_x5) {
                        return _ref5.apply(this, arguments);
                    }

                    return getPublicKey;
                }();

                Trezor.composeTransaction = function () {
                    var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(params) {
                        return _regenerator2.default.wrap(function _callee6$(_context6) {
                            while (1) {
                                switch (_context6.prev = _context6.next) {
                                    case 0:
                                        _context6.next = 2;
                                        return this.__call((0, _extends3.default)({ method: 'composetx' }, params));

                                    case 2:
                                        return _context6.abrupt('return', _context6.sent);

                                    case 3:
                                    case 'end':
                                        return _context6.stop();
                                }
                            }
                        }, _callee6, this);
                    }));

                    function composeTransaction(_x6) {
                        return _ref6.apply(this, arguments);
                    }

                    return composeTransaction;
                }();

                Trezor.signTransaction = function () {
                    var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(params) {
                        return _regenerator2.default.wrap(function _callee7$(_context7) {
                            while (1) {
                                switch (_context7.prev = _context7.next) {
                                    case 0:
                                        _context7.next = 2;
                                        return this.__call((0, _extends3.default)({ method: 'signtx' }, params));

                                    case 2:
                                        return _context7.abrupt('return', _context7.sent);

                                    case 3:
                                    case 'end':
                                        return _context7.stop();
                                }
                            }
                        }, _callee7, this);
                    }));

                    function signTransaction(_x7) {
                        return _ref7.apply(this, arguments);
                    }

                    return signTransaction;
                }();

                Trezor.ethereumSignTransaction = function () {
                    var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(params) {
                        return _regenerator2.default.wrap(function _callee8$(_context8) {
                            while (1) {
                                switch (_context8.prev = _context8.next) {
                                    case 0:
                                        _context8.next = 2;
                                        return this.__call((0, _extends3.default)({ method: 'ethereumSignTx' }, params));

                                    case 2:
                                        return _context8.abrupt('return', _context8.sent);

                                    case 3:
                                    case 'end':
                                        return _context8.stop();
                                }
                            }
                        }, _callee8, this);
                    }));

                    function ethereumSignTransaction(_x8) {
                        return _ref8.apply(this, arguments);
                    }

                    return ethereumSignTransaction;
                }();

                Trezor.ethereumGetAddress = function () {
                    var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(params) {
                        return _regenerator2.default.wrap(function _callee9$(_context9) {
                            while (1) {
                                switch (_context9.prev = _context9.next) {
                                    case 0:
                                        _context9.next = 2;
                                        return this.__call((0, _extends3.default)({ method: 'ethereumGetAddress' }, params));

                                    case 2:
                                        return _context9.abrupt('return', _context9.sent);

                                    case 3:
                                    case 'end':
                                        return _context9.stop();
                                }
                            }
                        }, _callee9, this);
                    }));

                    function ethereumGetAddress(_x9) {
                        return _ref9.apply(this, arguments);
                    }

                    return ethereumGetAddress;
                }();

                Trezor.accountComposeTransaction = function () {
                    var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(params) {
                        return _regenerator2.default.wrap(function _callee10$(_context10) {
                            while (1) {
                                switch (_context10.prev = _context10.next) {
                                    case 0:
                                        _context10.next = 2;
                                        return this.__call((0, _extends3.default)({ method: 'account-composetx' }, params));

                                    case 2:
                                        return _context10.abrupt('return', _context10.sent);

                                    case 3:
                                    case 'end':
                                        return _context10.stop();
                                }
                            }
                        }, _callee10, this);
                    }));

                    function accountComposeTransaction(_x10) {
                        return _ref10.apply(this, arguments);
                    }

                    return accountComposeTransaction;
                }();

                // TODO


                Trezor.customCall = function () {
                    var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(params) {
                        return _regenerator2.default.wrap(function _callee11$(_context11) {
                            while (1) {
                                switch (_context11.prev = _context11.next) {
                                    case 0:
                                        _context11.next = 2;
                                        return this.__call((0, _extends3.default)({ method: 'custom' }, params));

                                    case 2:
                                        return _context11.abrupt('return', _context11.sent);

                                    case 3:
                                    case 'end':
                                        return _context11.stop();
                                }
                            }
                        }, _callee11, this);
                    }));

                    function customCall(_x11) {
                        return _ref11.apply(this, arguments);
                    }

                    return customCall;
                }();

                Trezor.__call = function () {
                    var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(params) {
                        return _regenerator2.default.wrap(function _callee12$(_context12) {
                            while (1) {
                                switch (_context12.prev = _context12.next) {
                                    case 0:
                                        return _context12.abrupt('return', {});

                                    case 1:
                                    case 'end':
                                        return _context12.stop();
                                }
                            }
                        }, _callee12, this);
                    }));

                    function __call(_x12) {
                        return _ref12.apply(this, arguments);
                    }

                    return __call;
                }();

                Trezor.uiMessage = function uiMessage(message) {
                    // to override
                };

                Trezor.dispose = function dispose() {
                    // TODO!
                };

                Trezor.getVersion = function getVersion() {
                    // to override
                    return {};
                };

                return Trezor;
            }();

            exports.default = Trezor;

        /***/ }),
      /* 297 */,
      /* 298 */,
      /* 299 */,
      /* 300 */,
      /* 301 */,
      /* 302 */,
      /* 303 */,
      /* 304 */,
      /* 305 */,
      /* 306 */,
      /* 307 */,
      /* 308 */,
      /* 309 */,
      /* 310 */,
      /* 311 */,
      /* 312 */,
      /* 313 */,
      /* 314 */,
      /* 315 */,
      /* 316 */,
      /* 317 */,
      /* 318 */,
      /* 319 */,
      /* 320 */,
      /* 321 */,
      /* 322 */,
      /* 323 */,
      /* 324 */,
      /* 325 */,
      /* 326 */,
      /* 327 */,
      /* 328 */,
      /* 329 */,
      /* 330 */,
      /* 331 */,
      /* 332 */,
      /* 333 */,
      /* 334 */,
      /* 335 */,
      /* 336 */,
      /* 337 */,
      /* 338 */,
      /* 339 */,
      /* 340 */,
      /* 341 */,
      /* 342 */,
      /* 343 */,
      /* 344 */,
      /* 345 */,
      /* 346 */,
      /* 347 */,
      /* 348 */,
      /* 349 */,
      /* 350 */,
      /* 351 */,
      /* 352 */,
      /* 353 */,
      /* 354 */,
      /* 355 */,
      /* 356 */,
      /* 357 */,
      /* 358 */,
      /* 359 */,
      /* 360 */,
      /* 361 */,
      /* 362 */,
      /* 363 */,
      /* 364 */,
      /* 365 */,
      /* 366 */,
      /* 367 */,
      /* 368 */,
      /* 369 */,
      /* 370 */,
      /* 371 */,
      /* 372 */,
      /* 373 */,
      /* 374 */,
      /* 375 */,
      /* 376 */,
      /* 377 */,
      /* 378 */,
      /* 379 */,
      /* 380 */,
      /* 381 */,
      /* 382 */,
      /* 383 */,
      /* 384 */,
      /* 385 */,
      /* 386 */,
      /* 387 */,
      /* 388 */,
      /* 389 */,
      /* 390 */,
      /* 391 */,
      /* 392 */,
      /* 393 */,
      /* 394 */,
      /* 395 */,
      /* 396 */,
      /* 397 */,
      /* 398 */,
      /* 399 */,
      /* 400 */,
      /* 401 */,
      /* 402 */,
      /* 403 */,
      /* 404 */,
      /* 405 */,
      /* 406 */,
      /* 407 */,
      /* 408 */,
      /* 409 */,
      /* 410 */,
      /* 411 */,
      /* 412 */,
      /* 413 */,
      /* 414 */,
      /* 415 */,
      /* 416 */,
      /* 417 */,
      /* 418 */,
      /* 419 */,
      /* 420 */,
      /* 421 */,
      /* 422 */,
      /* 423 */,
      /* 424 */,
      /* 425 */,
      /* 426 */,
      /* 427 */,
      /* 428 */,
      /* 429 */,
      /* 430 */,
      /* 431 */,
      /* 432 */,
      /* 433 */,
      /* 434 */,
      /* 435 */,
      /* 436 */,
      /* 437 */,
      /* 438 */,
      /* 439 */,
      /* 440 */,
      /* 441 */,
      /* 442 */,
      /* 443 */,
      /* 444 */,
      /* 445 */,
      /* 446 */,
      /* 447 */,
      /* 448 */,
      /* 449 */,
      /* 450 */,
      /* 451 */,
      /* 452 */,
      /* 453 */,
      /* 454 */,
      /* 455 */,
      /* 456 */,
      /* 457 */,
      /* 458 */,
      /* 459 */,
      /* 460 */,
      /* 461 */,
      /* 462 */,
      /* 463 */,
      /* 464 */,
      /* 465 */,
      /* 466 */,
      /* 467 */,
      /* 468 */,
      /* 469 */,
      /* 470 */,
      /* 471 */,
      /* 472 */,
      /* 473 */,
      /* 474 */,
      /* 475 */,
      /* 476 */,
      /* 477 */,
      /* 478 */,
      /* 479 */,
      /* 480 */,
      /* 481 */,
      /* 482 */,
      /* 483 */,
      /* 484 */,
      /* 485 */,
      /* 486 */,
      /* 487 */,
      /* 488 */,
      /* 489 */,
      /* 490 */,
      /* 491 */,
      /* 492 */,
      /* 493 */,
      /* 494 */,
      /* 495 */,
      /* 496 */,
      /* 497 */,
      /* 498 */,
      /* 499 */,
      /* 500 */,
      /* 501 */,
      /* 502 */,
      /* 503 */,
      /* 504 */,
      /* 505 */,
      /* 506 */,
      /* 507 */,
      /* 508 */,
      /* 509 */,
      /* 510 */,
      /* 511 */,
      /* 512 */,
      /* 513 */,
      /* 514 */,
      /* 515 */,
      /* 516 */,
      /* 517 */,
      /* 518 */,
      /* 519 */,
      /* 520 */,
      /* 521 */,
      /* 522 */,
      /* 523 */,
      /* 524 */,
      /* 525 */,
      /* 526 */,
      /* 527 */,
      /* 528 */,
      /* 529 */,
      /* 530 */,
      /* 531 */,
      /* 532 */,
      /* 533 */,
      /* 534 */,
      /* 535 */,
      /* 536 */,
      /* 537 */,
      /* 538 */,
      /* 539 */,
      /* 540 */,
      /* 541 */,
      /* 542 */,
      /* 543 */,
      /* 544 */,
      /* 545 */,
      /* 546 */,
      /* 547 */,
      /* 548 */,
      /* 549 */,
      /* 550 */,
      /* 551 */,
      /* 552 */,
      /* 553 */,
      /* 554 */,
      /* 555 */,
      /* 556 */,
      /* 557 */,
      /* 558 */,
      /* 559 */,
      /* 560 */,
      /* 561 */,
      /* 562 */,
      /* 563 */,
      /* 564 */,
      /* 565 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            /**
             * (C) 2017 SatoshiLabs
             * TODO: description
             * GPLv3
             */

            exports.__esModule = true;
            exports.RESPONSE_EVENT = exports.DEVICE_EVENT = exports.UI_EVENT = exports.DEVICE = exports.UI = exports.TRANSPORT = undefined;

            var _classCallCheck2 = __webpack_require__(15);

            var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

            var _possibleConstructorReturn2 = __webpack_require__(51);

            var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

            var _inherits2 = __webpack_require__(56);

            var _inherits3 = _interopRequireDefault(_inherits2);

            var _regenerator = __webpack_require__(3);

            var _regenerator2 = _interopRequireDefault(_regenerator);

            var _asyncToGenerator2 = __webpack_require__(4);

            var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

            var _index = __webpack_require__(296);

            var _index2 = _interopRequireDefault(_index);

            var _transport = __webpack_require__(114);

            var TRANSPORT = _interopRequireWildcard(_transport);

            var _popup = __webpack_require__(115);

            var POPUP = _interopRequireWildcard(_popup);

            var _iframe2 = __webpack_require__(158);

            var IFRAME = _interopRequireWildcard(_iframe2);

            var _ui = __webpack_require__(34);

            var UI = _interopRequireWildcard(_ui);

            var _device = __webpack_require__(57);

            var DEVICE = _interopRequireWildcard(_device);

            var _errors = __webpack_require__(116);

            var _PopupManager = __webpack_require__(566);

            var _PopupManager2 = _interopRequireDefault(_PopupManager);

            var _debug = __webpack_require__(74);

            var _debug2 = _interopRequireDefault(_debug);

            var _inlineStyles = __webpack_require__(568);

            var _inlineStyles2 = _interopRequireDefault(_inlineStyles);

            var _deferred = __webpack_require__(137);

            var _CoreMessage = __webpack_require__(30);

            var _ConnectSettings = __webpack_require__(165);

            function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            exports.TRANSPORT = TRANSPORT;
            exports.UI = UI;
            exports.DEVICE = DEVICE;
            exports.UI_EVENT = _CoreMessage.UI_EVENT;
            exports.DEVICE_EVENT = _CoreMessage.DEVICE_EVENT;
            exports.RESPONSE_EVENT = _CoreMessage.RESPONSE_EVENT;


            var _log = new _debug2.default('[trezor-connect.js]', true);
            var _settings = void 0;
            var _popupManager = void 0;
            var _iframe = void 0;
            var _iframeOrigin = void 0;
            var _iframeHandshakePromise = void 0;
            var _messageID = 0;

// every postMessage to iframe has its own promise to resolve
            var _messagePromises = {};

            var initIframe = function () {
                var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(settings) {
                    var existedFrame, src, iframeSrcHost;
                    return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    existedFrame = document.getElementById('trezorconnect');

                                    if (existedFrame) {
                                        _iframe = existedFrame;
                                    } else {
                                        _iframe = document.createElement('iframe');
                                        _iframe.frameBorder = '0';
                                        _iframe.width = '0px';
                                        _iframe.height = '0px';
                                        _iframe.style.position = 'absolute';
                                        _iframe.style.display = 'none';
                                        _iframe.id = 'trezorconnect';
                                    }

                                    (0, _ConnectSettings.setDataAttributes)(_iframe, settings);

                                    _settings = (0, _ConnectSettings.parse)(settings);
                                    _popupManager = initPopupManager();

                                    // let src: string =  window.location.hostname === 'localhost' ? 'iframe.html' : 'https://dev.trezor.io/experiments/iframe.html';
                                    // const src: string = `${settings.iframeSrc}?settings=${ encodeURI( JSON.stringify(settings) ) }`;
                                    src = _settings.iframe_src + '?' + Date.now();

                                    _iframe.setAttribute('src', src);

                                    if (document.body) {
                                        document.body.appendChild(_iframe);
                                    }

                                    // eslint-disable-next-line no-irregular-whitespace
                                    iframeSrcHost = _iframe.src.match(/^.+\:\/\/[^\â€Œâ€‹/]+/);

                                    if (iframeSrcHost && iframeSrcHost.length > 0) {
                                        _iframeOrigin = iframeSrcHost[0];
                                    }

                                    _iframeHandshakePromise = (0, _deferred.create)();
                                    return _context.abrupt('return', _iframeHandshakePromise.promise);

                                case 12:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, undefined);
                }));

                return function initIframe(_x) {
                    return _ref.apply(this, arguments);
                };
            }();

            var injectStyleSheet = function injectStyleSheet() {
                var doc = _iframe.ownerDocument;
                var head = doc.head || doc.getElementsByTagName('head')[0];
                var style = document.createElement('style');
                style.setAttribute('type', 'text/css');
                style.setAttribute('id', 'TrezorjsStylesheet');

                if (style.styleSheet) {
                    // IE
                    // $FlowIssue
                    style.styleSheet.cssText = _inlineStyles2.default;
                } else {
                    style.appendChild(document.createTextNode(_inlineStyles2.default));
                }
                head.append(style);
            };

            var initPopupManager = function initPopupManager() {
                var pm = new _PopupManager2.default(_settings.popup_src);
                pm.on(POPUP.CLOSED, function () {
                    postMessage({ type: POPUP.CLOSED }, false);
                });
                return pm;
            };

// post messages to iframe
            var postMessage = function postMessage(message) {
                var usePromise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                _messageID++;
                message.id = _messageID;
                _iframe.contentWindow.postMessage(message, '*');

                if (typeof window.chrome !== 'undefined' && window.chrome.runtime && window.chrome.runtime.onConnect) {
                    window.chrome.runtime.onConnect.addListener(function (a, b) {
                        console.log("chrome.runtime.onConnect", a, b);
                    });
                }

                console.warn("postmessage", message);

                if (usePromise) {
                    _messagePromises[_messageID] = (0, _deferred.create)();
                    return _messagePromises[_messageID].promise;
                }
                return null;
            };

// handle message received from iframe
            var handleMessage = function handleMessage(messageEvent) {
                // ignore messages from domain other then iframe origin
                if (messageEvent.origin !== _iframeOrigin) return;

                var message = (0, _CoreMessage.parseMessage)(messageEvent.data);
                // TODO: destructuring with type
                // https://github.com/Microsoft/TypeScript/issues/240
                // const { id, event, type, data, error }: CoreMessage = message;
                var id = message.id || 0;
                var event = message.event;
                var type = message.type;
                var data = message.data;

                _log.log('handleMessage', message);

                switch (event) {

                    case _CoreMessage.RESPONSE_EVENT:
                        if (_messagePromises[id]) {
                            //_messagePromises[id].resolve(data);
                            _messagePromises[id].resolve(message);
                            delete _messagePromises[id];
                        } else {
                            console.warn('Unknown message id ' + id);
                        }
                        break;

                    case _CoreMessage.DEVICE_EVENT:
                        // pass DEVICE event up to html
                        _index.eventEmitter.emit(event, message);
                        _index.eventEmitter.emit(type, data); // DEVICE_EVENT also emit single events (connect/disconnect...)
                        break;

                    case _CoreMessage.UI_EVENT:
                        // pass UI event up
                        //eventEmitter.emit(event, data);
                        _index.eventEmitter.emit(event, type, data);
                        if (type === IFRAME.HANDSHAKE) {
                            if (_iframeHandshakePromise) {
                                _iframeHandshakePromise.resolve();
                            }
                            _iframeHandshakePromise = null;
                            injectStyleSheet();
                        } else if (type === POPUP.CANCEL_POPUP_REQUEST) {
                            _popupManager.cancel();
                        } else if (type === UI.CLOSE_UI_WINDOW) {
                            _popupManager.close();
                        } else {
                            _popupManager.postMessage(new _CoreMessage.UiMessage(type, data));
                        }
                        break;

                    default:
                        _log.log('Undefined message', event, messageEvent);
                }
            };

            var TrezorConnect = function (_TrezorBase) {
                (0, _inherits3.default)(TrezorConnect, _TrezorBase);

                function TrezorConnect() {
                    (0, _classCallCheck3.default)(this, TrezorConnect);
                    return (0, _possibleConstructorReturn3.default)(this, _TrezorBase.apply(this, arguments));
                }

                // static on(type: string, fn: Function): void {
                //     eventEmitter.on(type, fn);
                // }

                // static off(type: string, fn: Function): void {
                //     eventEmitter.removeListener(type, fn);
                // }

                TrezorConnect.init = function () {
                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                        var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                        var iframeTimeout;
                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        if (!_iframe) {
                                            _context2.next = 2;
                                            break;
                                        }

                                        throw _errors.IFRAME_INITIALIZED;

                                    case 2:

                                        // TODO: check browser support

                                        window.addEventListener('message', handleMessage);
                                        iframeTimeout = window.setTimeout(function () {
                                            throw _errors.IFRAME_TIMEOUT;
                                        }, 10000);
                                        _context2.next = 6;
                                        return initIframe(settings);

                                    case 6:

                                        window.clearTimeout(iframeTimeout);

                                        window.onbeforeunload = function () {
                                            _popupManager.onbeforeunload();
                                        };

                                    case 8:
                                    case 'end':
                                        return _context2.stop();
                                }
                            }
                        }, _callee2, this);
                    }));

                    function init() {
                        return _ref2.apply(this, arguments);
                    }

                    return init;
                }();

                TrezorConnect.changeSettings = function changeSettings(settings) {
                    postMessage({ type: UI.CHANGE_SETTINGS, data: (0, _ConnectSettings.parse)(settings) }, false);
                };

                TrezorConnect.__call = function () {
                    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(params) {
                        var response;
                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                            while (1) {
                                switch (_context3.prev = _context3.next) {
                                    case 0:
                                        if (!_iframeHandshakePromise) {
                                            _context3.next = 2;
                                            break;
                                        }

                                        return _context3.abrupt('return', { success: false, message: _errors.NO_IFRAME.message });

                                    case 2:

                                        // request popup. it might be used in the future
                                        _popupManager.request(params);

                                        // post message to iframe
                                        _context3.prev = 3;
                                        _context3.next = 6;
                                        return postMessage({ type: IFRAME.CALL, data: params });

                                    case 6:
                                        response = _context3.sent;

                                        if (!response) {
                                            _context3.next = 12;
                                            break;
                                        }

                                        // TODO: unlock popupManager request only if there wasn't error "in progress"
                                        if (response.error !== _errors.DEVICE_CALL_IN_PROGRESS.message) {
                                            _popupManager.unlock();
                                        }
                                        return _context3.abrupt('return', response);

                                    case 12:
                                        _popupManager.unlock();
                                        // TODO
                                        return _context3.abrupt('return', { success: false });

                                    case 14:
                                        _context3.next = 20;
                                        break;

                                    case 16:
                                        _context3.prev = 16;
                                        _context3.t0 = _context3['catch'](3);

                                        console.log('Call error', _context3.t0);
                                        return _context3.abrupt('return', _context3.t0);

                                    case 20:
                                    case 'end':
                                        return _context3.stop();
                                }
                            }
                        }, _callee3, this, [[3, 16]]);
                    }));

                    function __call(_x4) {
                        return _ref3.apply(this, arguments);
                    }

                    return __call;
                }();

                TrezorConnect.dispose = function dispose() {
                    // TODO
                };

                TrezorConnect.getVersion = function getVersion() {
                    return {
                        type: 'connect'
                    };
                };

                return TrezorConnect;
            }(_index2.default);

// auto init


            var scripts = document.getElementsByTagName('script');
            var index = scripts.length - 1;
            var myself = scripts[index];
            var queryString = myself.src.replace(/^[^\?]+\??/, '');

            if (queryString === 'init') {
                TrezorConnect.init();
            }

            window.TrezorConnect = TrezorConnect;
            module.exports = TrezorConnect;
// export default TrezorConnect;

        /***/ }),
      /* 566 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;

            var _classCallCheck2 = __webpack_require__(15);

            var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

            var _possibleConstructorReturn2 = __webpack_require__(51);

            var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

            var _inherits2 = __webpack_require__(56);

            var _inherits3 = _interopRequireDefault(_inherits2);

            var _events = __webpack_require__(39);

            var _events2 = _interopRequireDefault(_events);

            var _popup = __webpack_require__(115);

            var _showPopupRequest = __webpack_require__(567);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            var POPUP_WIDTH = 600;
            var POPUP_HEIGHT = 500;
            var POPUP_REQUEST_TIMEOUT = 400;
            var POPUP_CLOSE_INTERVAL = 500;
            var POPUP_OPEN_TIMEOUT = 2000;

            var PopupManager = function (_EventEmitter) {
                (0, _inherits3.default)(PopupManager, _EventEmitter);

                // Window
                function PopupManager(src) {
                    (0, _classCallCheck3.default)(this, PopupManager);

                    var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

                    _this.requestTimeout = 0;
                    _this.closeInterval = 0;

                    _this.src = src;
                    return _this;
                }

                PopupManager.prototype.request = function request(params) {
                    var _this2 = this;

                    // popup request
                    // TODO: ie - open imediately and hide it but post handshake after timeout

                    // bring popup window to front
                    if (this.locked) {
                        if (this._window) {
                            this._window.focus();
                        }
                        return;
                    }

                    if (params && typeof params.method === 'string') {
                        this.currentMethod = params.method;
                    }

                    var openFn = this.open.bind(this);
                    this.locked = true;
                    this.requestTimeout = window.setTimeout(function () {
                        _this2.requestTimeout = 0;
                        openFn();
                        // this.setAddress(settings.popupURL);
                    }, POPUP_REQUEST_TIMEOUT);
                    // this.open();
                };

                PopupManager.prototype.cancel = function cancel() {
                    this.close();
                };

                PopupManager.prototype.unlock = function unlock() {
                    this.locked = false;
                };

                // workaround for IE. hide window (blur) finally set address and window.focus after timeout


                PopupManager.prototype.setAddress = function setAddress(url) {
                    this._window.location = url;
                };

                PopupManager.prototype.open = function open() {
                    var _this3 = this;

                    var left = (window.screen.width - POPUP_WIDTH) / 2;
                    var top = (window.screen.height - POPUP_HEIGHT) / 2;
                    var width = POPUP_WIDTH;
                    var height = POPUP_HEIGHT;
                    var opts = 'width=' + width + '\n            ,height=' + height + '\n            ,left=' + left + '\n            ,top=' + top + '\n            ,menubar=no\n            ,toolbar=no\n            ,location=no\n            ,personalbar=no\n            ,status=no';

                    this._window = window.open(this.src, '_blank', opts);
                    // pass method name before popup is loaded
                    if (this._window) {
                        this._window.name = this.currentMethod;
                    }

                    this.closeInterval = window.setInterval(function () {
                        if (_this3._window && _this3._window.closed) {
                            _this3.close();
                            _this3.emit(_popup.CLOSED);
                        }
                    }, POPUP_CLOSE_INTERVAL);

                    this.openTimeout = window.setTimeout(function () {
                        if (!(_this3._window && !_this3._window.closed)) {
                            console.log('OPEN TIME OUT!!!!');
                            _this3.close();

                            (0, _showPopupRequest.showPopupRequest)(_this3.open.bind(_this3), function () {
                                _this3.emit(_popup.CLOSED);
                            });
                        }
                    }, POPUP_OPEN_TIMEOUT);
                };

                PopupManager.prototype.close = function close() {
                    if (this.requestTimeout) {
                        window.clearTimeout(this.requestTimeout);
                        this.requestTimeout = 0;
                    }

                    if (this.openTimeout) {
                        window.clearTimeout(this.openTimeout);
                        this.openTimeout = 0;
                    }
                    if (this.closeInterval) {
                        window.clearInterval(this.closeInterval);
                        this.closeInterval = 0;
                    }
                    if (this._window) {
                        this._window.close();
                        this._window = null;
                    }
                };

                PopupManager.prototype.postMessage = function postMessage(message) {
                    var _this4 = this;

                    // post message before popup request finalized
                    if (this.requestTimeout) {
                        return;
                    }

                    // device needs interaction but there is no popup/ui
                    // maybe popup request wasn't handled
                    // ignore "ui_request_window" type
                    if (!this._window && message.type !== 'ui_request_window' && this.openTimeout) {
                        this.close();
                        (0, _showPopupRequest.showPopupRequest)(this.open.bind(this), function () {
                            _this4.emit(_popup.CLOSED);
                        });
                        console.error('TODO ---- render alert in page!', this.closeInterval, this.openTimeout, this.requestTimeout);
                        return;
                    }

                    // post message to popup window
                    if (this._window) {
                        this._window.postMessage(message, '*');
                    }
                };

                PopupManager.prototype.onbeforeunload = function onbeforeunload() {
                    this.close();
                };

                return PopupManager;
            }(_events2.default);

            exports.default = PopupManager;

        /***/ }),
      /* 567 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;
            var layerID = 'TrezorConnectInteractionLayer';

            var layerInnerHtml = '\n    <div class="trezorconnect-container" id="' + layerID + '">\n        <div class="trezorconnect-window">\n            <div class="trezorconnect-head">\n                <svg width="78px" height="20px" viewBox="0 0 63 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n                    <g stroke="none" stroke-width="1" fill="none" transform="translate(-537.000000, -874.000000)">\n                        <path d="M552.459206,878.900031 L559.367802,878.900031 L559.367802,880.902943 L557.029925,880.902943 L557.029925,887.434943 L554.809687,887.434943 L554.809687,880.902943 L552.459206,880.902943 L552.459206,878.900031 Z M567.325636,881.739209 C567.325636,883.15431 566.504457,883.955628 565.692063,884.268821 L567.561295,887.434752 L565.014877,887.434752 L563.436304,884.554515 L562.578458,884.554515 L562.578458,887.434752 L560.369678,887.434752 L560.369678,878.899458 L564.378559,878.899458 C566.141992,878.899458 567.325636,880.040706 567.325636,881.739209 Z M562.578458,880.866468 L562.578458,882.587506 L564.125712,882.587506 C564.697864,882.587506 565.082863,882.241465 565.082863,881.726605 C565.082863,881.212509 564.697864,880.866468 564.125712,880.866468 L562.578458,880.866468 Z M568.349015,887.434828 L568.349015,878.899916 L574.534592,878.899916 L574.534592,880.866544 L570.557031,880.866544 L570.557031,882.117409 L574.450565,882.117409 L574.450565,884.084037 L570.557031,884.084037 L570.557031,885.455597 L574.534592,885.455597 L574.534592,887.434828 L568.349015,887.434828 Z M582.162388,880.603118 L578.608403,885.432031 L582.162388,885.432031 L582.162388,887.434943 L575.627715,887.434943 L575.627715,885.719252 L579.180554,880.902179 L575.627715,880.902179 L575.627715,878.900031 L582.162388,878.900031 L582.162388,880.603118 Z M586.960555,878.766465 C589.54173,878.766465 591.414781,880.62042 591.414781,883.172949 C591.414781,885.726624 589.54173,887.579432 586.960555,887.579432 C584.386255,887.579432 582.518169,885.726624 582.518169,883.172949 C582.518169,880.62042 584.386255,878.766465 586.960555,878.766465 Z M586.960555,885.563916 C588.254962,885.563916 589.159022,884.580793 589.159022,883.172949 C589.159022,881.765487 588.254962,880.781982 586.960555,880.781982 C585.65278,880.781982 584.773928,881.742952 584.773928,883.172949 C584.773928,884.580793 585.673023,885.563916 586.960555,885.563916 Z M597.640691,884.268821 L599.510305,887.434752 L596.964269,887.434752 L595.385696,884.554515 L594.527087,884.554515 L594.527087,887.434752 L592.319071,887.434752 L592.319071,878.899458 L596.327951,878.899458 C598.091385,878.899458 599.276174,880.040706 599.276174,881.739209 C599.276174,883.15431 598.453849,883.955628 597.640691,884.268821 Z M594.527087,880.866468 L594.527087,882.587506 L596.075104,882.587506 C596.647256,882.587506 597.032255,882.241465 597.032255,881.726605 C597.032255,881.212509 596.647256,880.866468 596.075104,880.866468 L594.527087,880.866468 Z M546.397723,878.915232 L548.007997,878.915232 L548.007997,887.433339 L547.996921,887.433339 L542.504189,890 L537.011076,887.433339 L537,887.433339 L537,878.915232 L538.611038,878.915232 L538.611038,877.719367 C538.611038,875.668712 540.358048,874 542.504953,874 C544.650713,874 546.397723,875.668712 546.397723,877.719367 L546.397723,878.915232 Z M545.792724,886.01671 L545.792724,880.913943 L539.215273,880.913943 L539.215273,886.01671 L542.504189,887.549832 L545.792724,886.01671 Z M540.608221,877.719367 L540.608221,878.915232 L544.400539,878.915232 L544.400539,877.719367 C544.400539,876.770237 543.549569,875.997947 542.504953,875.997947 C541.459192,875.997947 540.608221,876.770237 540.608221,877.719367 Z" id="Logotype" fill="#000000"></path>\n                    </g>\n                </svg>\n\n            </div>\n            <div class="trezorconnect-body">\n                <h2>Popup was blocked</h2>\n                <p>Please click to \u201CContinue\u201D to open popup manually</p>\n                <button class="trezorconnect-open">Continue</button>\n            </div>\n        </div>\n    </div>\n';

            var showPopupRequest = exports.showPopupRequest = function showPopupRequest(open, cancel) {
                if (document.getElementById(layerID)) {
                    return;
                }

                var div = document.createElement('div');
                div.id = layerID;
                div.className = 'trezorconnect-container';
                div.innerHTML = layerInnerHtml;

                if (document.body) {
                    document.body.appendChild(div);
                }

                var button = div.getElementsByClassName('trezorconnect-open')[0];
                button.onclick = function () {
                    open();
                    if (document.body) {
                        document.body.removeChild(div);
                    }
                };

                // button = div.getElementsByClassName('cancel')[0];
                // button.onclick = () => {
                //     cancel();
                //     if (document.body) { document.body.removeChild(div); }
                // };
            };

        /***/ }),
      /* 568 */
      /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            exports.__esModule = true;
            var css = ".trezorconnect-container{position:fixed!important;z-index:10000!important;width:100%!important;height:100%!important;top:0!important;left:0!important;background:rgba(0,0,0,.35)!important;display:-webkit-box!important;display:-webkit-flex!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-orient:vertical!important;-webkit-box-direction:normal!important;-webkit-flex-direction:column!important;-ms-flex-direction:column!important;flex-direction:column!important;-webkit-box-align:center!important;-webkit-align-items:center!important;-ms-flex-align:center!important;align-items:center!important;overflow:auto!important;padding:20px!important;margin:0!important}.trezorconnect-container .trezorconnect-window{width:370px!important;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif!important;margin:auto!important;position:relative!important;border-radius:4px!important;background-color:#fff!important;text-align:center!important;overflow:hidden!important}.trezorconnect-container .trezorconnect-window .trezorconnect-head{text-align:left;padding:12px 24px!important}.trezorconnect-container .trezorconnect-window .trezorconnect-body{padding:24px 48px!important;background:#FBFBFB!important;border-top:1px solid #EBEBEB}.trezorconnect-container .trezorconnect-window .trezorconnect-body h3{color:#505050!important;font-size:16px!important;font-weight:500!important;margin-top:14px!important}.trezorconnect-container .trezorconnect-window .trezorconnect-body p{margin:5px 0!important;font-weight:400!important;color:#A9A9A9!important;font-size:12px!important}/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0IiwiJHN0ZGluIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHlCQUNJLFNBQUEsZ0JBQ0EsUUFBQSxnQkFDQSxNQUFBLGVBQ0EsT0FBQSxlQUNBLElBQUEsWUFDQSxLQUFBLFlBQ0EsV0FBQSwwQkFDQSxRQUFBLHNCQUNBLFFBQUEsdUJBQ0EsUUFBQSxzQkFDQSxRQUFBLGVBQ0EsbUJBQUEsbUJBQ0Esc0JBQUEsaUJDQ0YsdUJBQXdCLGlCRGRwQixtQkFlRixpQkFFSSxlQUFBLGlCQUNBLGtCQUFBLGlCQUNBLG9CQUFBLGlCQUNBLGVBQUEsaUJBQ0EsWUFBQSxpQkFDQSxTQUFBLGVBQ0EsUUFBQSxlQUNBLE9BQUEsWUFFQSwrQ0FDSSxNQUFBLGdCQUNBLFlBQUEsY0FBQSxtQkFBQSxXQUFBLE9BQUEsaUJBQUEsTUFBQSxxQkNBVixPQUFRLGVENUJSLFNBQVUsbUJBZ0NBLGNBQUEsY0FDQSxpQkFBQSxlQUNBLFdBQUEsaUJDRFYsU0FBVSxpQkRJSSxtRUFDQSxXQUFBLEtBQ0EsUUFBQSxLQUFBLGVDQWhCLG1FRHZDRSxRQUFTLEtBQUssZUEyQ0EsV0FBQSxrQkFDQSxXQUFBLElBQUEsTUFBQSxRQUVBLHNFQ0RkLE1BQU8sa0JBQ1AsVUFBVyxlQUNYLFlBQWEsY0FDYixXQUFZLGVBRWQscUVBQ0UsT0FBUSxJQUFJLFlBQ1osWUFBYSxjQUNiLE1BQU8sa0JBQ1AsVUFBVyJ9 */";exports.default = css;

        /***/ })
      /******/ ]);
});