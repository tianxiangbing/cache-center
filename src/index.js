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
    if (typeof exports === "object") {
        module.exports = definition();
        // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);
    } else {
        CacheCenter = definition();
    }
})(function () {
    const CacheCenter = {
        saveStorage: 'ls',
        /**
         * 缓存集合{key:{promise:promise,status:'pending'}}
         *  @property {key} 键值对
         */
        list: {},
        caches: {},
        /**
         * @desc: 添加初始化缓存
         * @param {String} key 区分缓存请求的唯一值
         * @param {Promise} promise 返回需要缓存的键值对 ,{cache1:[],cache2:{}}
         * @return {Promise} 返回请求的数据
         */
        add: (key, promise) => {
            //添加一个缓存
            CacheCenter.list[key] = {
                promiseFunc: promise,
                status: 'determined',
                // callback:res=>{
                //     CacheCenter.list[key].status = 'success';
                // }
            };
        },
        /**
         * @desc: 缓存预载,不处理数据
         * @param {type} 
         * @return {type} 
         */
        preload: (key, promiseFuc) => {
            CacheCenter.list[key] = {
                promise: promiseFuc(),
                status: 'pending'
            }
        },
        /**
         * @desc: 加载缓存
         * @param {String} 缓存主键 
         * @param {Dom} container loading container
         * @return {Promise} 如果缓存已存在，直接返回该缓存的promise
         */
        load: (key, container = document.body) => {
            if (CacheCenter.list.hasOwnProperty(key)) {
                let load = null;
                if (CacheCenter.list[key].status != 'success') {
                    load = CacheCenter.showLoading(container);
                }
                if(CacheCenter.list[key].status ==='determined'){
                    CacheCenter.list[key].promise = CacheCenter.list[key].promiseFunc()
                    CacheCenter.list[key].status='pending'
                }
                return CacheCenter.list[key].promise.then(res => {
                    load && load.hideLoading();
                    CacheCenter.list[key].status = 'success';
                    CacheCenter.saveCache(res);
                    return res;
                })
            } else {
                console.error('没有这个缓存:', key);
                return Promise.reject('没有这个缓存:'+key)
            }
        },
        saveCache(res){
            Object.assign(CacheCenter.caches,res); 
        },
        get: (cacheName) => {

        },
        /**
         * @desc: 显示加载效果
         * @param {type} 
         * @return {type} 
         */
        showLoading: (container) => {
            window.status = 'loading...'
            return CacheCenter;
        },
        hideLoading: () => {
            window.status = '';
        }
    }
    // CacheCenter.
    return CacheCenter;
})