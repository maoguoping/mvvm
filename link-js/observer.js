function Observer(data) {
    this.data = data;
    this.walk(data);
}

Observer.prototype = {
    walk: function (data) {
        var _ = this;
        Object.keys(data).forEach(function (key) {
            _.defineReactive(_.data, key, data[key]);
        })
    },
    defineReactive: function (data, key, val) {
        var dep = new Dep();
        var childObj = observe(val);//监听子组件
        Object.defineProperty(data, key, {
            enumerable: true,//可枚举
            configurable: false,//不能再define
            get: function () {
                // 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
                if (Dep.target) {
                    dep.depend();
                }
                return val;
            },
            set: function (newVal) {
                if (val === newVal) return;
                console.log('数据发生变化', val, '=>', newVal);
                val = newVal;
                // 新的值是object的话，进行监听
                childObj = observe(newVal);
                dep.notify();
            }
        })
    }
};
function observe(value,vm) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value)
}
var uid = 0;
function Dep() {
    this.id = uid++;
    this.subs = [];
}

Dep.prototype = {
    addSub: function (sub) {
        this.subs.push(sub);
    },
    depend: function() {
        Dep.target.addDep(this);
    },
    notify: function () {
        this.subs.forEach(function (sub) {
            sub.update()
        })
    },
    removeSub: function (sub) {
        var index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    }
};
Dep.target = null;



