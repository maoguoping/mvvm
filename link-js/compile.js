function Compile(el, vm) {
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    init: function () {
        this.compileElement(this.$fragment);
    },
    node2Fragment: function (el) {
        var fragment = document.createDocumentFragment(),
            child;
        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    },
    compileElement: function (el) {
        var childNode = el.childNodes,
            _ = this;
        [].slice.call(childNode).forEach(function (node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/; // 表达式文本,匹配有内容的{{}}
            // 按元素节点方式编译
            if (_.isElementNode(node)) {
                _.compile(node);
            } else if (_.isTextNode(node) && reg.test(text)) {
                _.compileText(node, RegExp.$1)
            }
            //遍历编译子节点
            if (node.childNodes && node.childNodes.length) {
                _.compileElement(node);
            }
        })
    },
    compile: function (node) {
        var nodeAttrs = node.attributes,
            _ = this;
        [].slice.call(nodeAttrs).forEach(function (attr) {
            // 规定：指令以 l-xxx 命名
            // 如 <span l-text="content"></span> 中指令为 l-text
            var attrName = attr.name;	// l-text
            if (_.isDirective(attrName)) {
                var exp = attr.value;//获取指令的值
                var dir = attrName.substring(2);//获取命令后缀
                if (_.isEventDirective(dir)) {
                    // 事件指令, 如 l-on:click
                    compileUtil.eventHandler(node, _.$vm, exp, dir);
                } else {
                    compileUtil[dir] && compileUtil[dir](node, _.$vm, exp);
                }
                node.removeAttribute(attrName);
            }
        })
    },

    compileText: function (node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },

    isElementNode: function (node) {
        return node.nodeType == 1;
    },

    isTextNode: function (node) {
        return node.nodeType == 3;
    },

    isDirective: function (attr) {
        return attr.indexOf('l-') == 0;
    },

    isEventDirective: function (dir) {
        return dir.indexOf('on') === 0;
    },
};
// 指令处理集合
var compileUtil = {
    text: function (node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },
    html:function(node,vm,exp){
        this.bind(node,vm,exp,'html')
    },
    model:function(node,vm,exp){
        this.bind(node,vm,exp,'model');
        var _ = this,
            val = this._getVMVal(vm,exp);
        node.addEventListener('input',function (e) {
            var newValue = e.target.value;
            if(val === newValue){
                return;
            }
            _._setVMVal(vm,exp,newValue);
            val = newValue;
        })
    },
    bind: function (node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater'];
        // 第一次初始化视图
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        // 实例化订阅者，此操作会在对应的属性消息订阅器中添加了该订阅者watcher
        new Watcher(vm, exp, function (value, oldValue) {
            // 一旦属性值有变化，会收到通知执行此更新函数，更新视图
            updaterFn && updaterFn(node, value, oldValue);
        })
    },
    class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },
    // 事件处理
    eventHandler: function (node, vm, exp, dir) {
        var eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[exp];

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },
    _getVMVal: function(vm, exp) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    },

    _setVMVal: function(vm, exp, value) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k, i) {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }
};

// 更新函数
var updater = {
    textUpdater: function (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    htmlUpdater:function (node,value) {
        node.innerHTML = typeof value == 'undefined' ? '':value;
    },
    modelUpdater:function (node,value) {
        node.value = typeof value === 'undefined' ? '':value;
    },
    classUpdater:function (node,value,oldValue) {
        var className = node.className;
        className = className.replace(oldValue,'').replace(/\s$/, '');
        var space = className && String(value) ? ' ' : '';
        node.className = className + space + value;
    }
    // ...省略
};