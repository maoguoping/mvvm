function MVVM(options) {
    this.$options = options;
    var data = this._data = this.$options.data,
        _ = this;
    // 属性代理，实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(function (key) {
        _._proxy(key);
    });
    this._initComputed();
    observe(data, this);
    this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
    $watch :function(key,cb,options){
        new Watcher(this,key,cb);
    },
    _proxy: function (key) {
        var _ = this;
        Object.defineProperty(_, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return _._data[key];
            },
            set: function proxySetter(newVal) {
                _._data[key] = newVal;
            }
        })
    },
    _initComputed:function () {
        var _= this;
        var computed = this.$options.computed;
        if(typeof computed === 'object'){
            Object.keys(computed).forEach(function (key) {
                Object.defineProperty(_,key,{
                    get:typeof computed[key] == 'function'
                        ? computed[key]
                        :computed[key].get,
                    set:function () {}
                })
            })
        }
    }
};