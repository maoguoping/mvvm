function Dep() {
    this.subs = [];
}
Dep.prototype = {
    addSub:function (sub) {
        this.subs.push(sub);
    },
    notify:function () {
        this.subs.forEach(function (sub) {
            sub.update()
        })
    },
    removeSub: function(sub) {
        var index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    }
};
Dep.target = null;
function observer(data) {
    if(!data || typeof data !== 'object' ){
        return;
    }
    //遍历所有属性
    Object.keys(data).forEach(function(key){
        defineReactive(data,key,data[key]);
    })
}
function defineReactive(data,key,val) {
    var dep = new Dep();
    console.log(dep);
    observer(val);//监听子组件
    Object.defineProperty(data,key,{
        enumerable:true,//可枚举
        configurable:false,//不能再define
        get:function(){
            // 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
            Dep.target && dep.addDep(Dep.target);
            return val;
        },
        set:function(newVal){
            if(val === newVal) return;
            console.log('数据发生变化',val,'=>',newVal);
            val = newVal;
            dep.notify();
        }
    })
}

