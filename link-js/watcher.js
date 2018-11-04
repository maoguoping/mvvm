function Watcher(vm,exp,cb){
    this.cb = cb;
    this.vm = vm;
    this.exp = exp;
    // 此处为了触发属性的getter，从而在dep添加自己，结合Observer更易理解
    this.value = this.get();
}
Watcher.prototype = {
    update:function(){
        this.run(); //属性值变化收到通知
    },
    run:function(){
        var value = this.get();//从实例data中取到最新值，并为实力数据添加当前订阅
        var oldVal = this.value;//取到原始值
        if(value !== oldVal){
            this.value = value;
            this.cb.call(this.vm,value,oldVal); // 执行Compile中绑定的回调，更新视图
        }
    },
    get:function (key) {
        Dep.target = this;// 将当前订阅者指向自己
        var value = this.vm[key];// 触发getter，添加自己到属性订阅器中
        Dep.target = null;
        return value;
    }
};