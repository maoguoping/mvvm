function MVVM(options) {
    this.$options = options;
    var data = this._data = this.$options.data,
         _ = this;
    // 属性代理，实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(function (key) {
       _._proxy(key);
    });
    observer(data,this);
    this.$compile = new Compile(options.el || document.body,this)
}
MVVM.prototype = {
  _proxy:function (key) {
      var _ = this;
      Object.defineProperty(_,key,{
          configurable:false,
          enumerable:true,
          get:function proxyGetter() {
              return _._data[key];
          },
          set: function proxySetter(newVal) {
              _._data[key] = newVal;
          }
      })
  }
};