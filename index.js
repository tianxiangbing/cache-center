var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
 * Created with Visual Studio Code.
 * github: https://github.com/tianxiangbing/cache-center
 * User: 田想兵
 * Date: 2020-10-13
 * Time: 20:00:00
 * Contact: 55342775@qq.com
 * desc: 建立统一的缓存中心，子模块打开时，去缓存中心取对应的缓存，没有时loading，并请求对应的缓存。
 * 请使用https://github.com/tianxiangbing/cache-center 上的代码
 */
(function (definition) {
    // 
    if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
        module.exports = definition();
        // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);
    } else {
        CacheCenter = definition();
    }
})(function () {
    var CacheCenter = {
        saveStorage: 'ls',
        /**
         * 缓存集合{key:{promise:promise,status:'pending'}}
         *  @property {key} 键值对
         */
        list: {},
        caches: {},
        init: function init(arr) {},

        /**
         * @desc: 添加初始化缓存
         * @param {String} key 区分缓存请求的唯一值
         * @param {Promise} promise 不要在这里处理数据，在callback中处理数据
         * @return {Function} 返回需要缓存的键值对 ,{cache1:[],cache2:{}}
         */
        add: function add(key, promise, callback) {
            //添加一个缓存
            CacheCenter.list[key] = {
                promiseFunc: promise,
                status: 'determined',
                callback: callback
            };
        },
        /**
         * @desc: 缓存预载,不处理数据
         * @param {String} key 缓存关键字 
         * @return {promise} 
         */
        preload: function preload(key) {
            var cache = CacheCenter.list[key];
            if (cache.status == 'determined') {
                cache.status = 'pending';
                cache.promise = CacheCenter.list[key].promiseFunc();
                return cache.promise.then(function (res) {
                    cache.status = 'success';
                });
            }
        },
        /**
         * @desc: 加载缓存
         * @param {String} 缓存主键 
         * @param {Dom} container loading container
         * @return {Promise} 如果缓存已存在，直接返回该缓存的promise
         */
        load: function load(key) {
            var container = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;

            if (CacheCenter.list.hasOwnProperty(key)) {
                var load = null;
                var cache = CacheCenter.list[key];
                if (cache.status === 'determined') {
                    cache.promise = CacheCenter.list[key].promiseFunc();
                    cache.status = 'pending';
                }
                if (cache.status != 'success') {
                    load = CacheCenter.showLoading(container);
                }
                return CacheCenter.request(key).then(function (res) {
                    //关闭loading
                    load && load.hideLoading(container);
                    return res;
                });
            } else {
                console.error('没有这个缓存:', key);
                return Promise.reject('没有这个缓存:' + key);
            }
        },
        request: function request(key) {
            var cache = CacheCenter.list[key];
            return cache.promise.then(function (res) {
                cache.status = 'success';
                //判断是否有callback处理数据
                if (cache.callback) {
                    var result = cache.callback(res);
                    CacheCenter.saveCache(key, result);
                } else {
                    CacheCenter.saveCache(key, res);
                }
                return res;
            }).catch(function (res) {
                console.error(res);
                cache.status = 'determined'; //重置状态
            });
        },

        /**
         * @desc 更新缓存
         * @param {*} key 
         */
        update: function update(key) {
            var cache = CacheCenter.list[key];
            cache.status = 'determined';
            cache.promise = CacheCenter.list[key].promiseFunc();
            cache.status = 'pending';
            return this.request(key);
        },
        saveCache: function saveCache(key, res) {
            _extends(CacheCenter.caches, _defineProperty({}, key, res));
        },
        get: function get(key, cacheName) {
            return CacheCenter.caches[key][cacheName];
        },

        /**
         * @desc: 显示加载效果
         * @param {type} 
         * @return {type} 
         */
        showLoading: function showLoading(container) {
            window.status = 'loading...';
            return CacheCenter;
        },
        hideLoading: function hideLoading() {
            window.status = '';
        }
        // CacheCenter.
    };return CacheCenter;
});