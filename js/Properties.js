"use strict";

function Properties(dict) {
    this.list = [];
    for(var name in dict) {
        var p = dict[name];
        if (!(p instanceof Property)) {
            if ('string' == typeof p)
                p = Property.create({type: p});
            else if ('object' == typeof p)
                p = Property.create(p);
        }
        p.name = name;
        this.list.push(p);
    }
}

Properties.prototype = {
    traverse: function(call) {
        var current = this.target.constructor;
        this.$.detach();
        do {
            var ps = current.prototype.properties.list;
            for (var i = 0; i < ps.length; i++) {
                call.call(this, ps[i]);
            }
        } while(current = current.prototype.base);
        this.$.attach();
    }
};

Properties.create = function(ctor) {
    for (; ctor && ctor.prototype && ctor.prototype.properties;
         ctor = ctor.prototype.base)
        if (!(ctor.prototype.properties instanceof Properties))
            ctor.prototype.properties = new Properties(ctor.prototype.properties);
};

Properties.actions = {
    focus: function(target) {
        this.target = target;
        this.traverse(function(p) {
            p.target = target;
            target.on(p.name, p.change);
            this.$.appendChild(p.$container);
        });
    },

    blur: function() {
        this.traverse(function(p) {
            p.target.off(p.name, p.change);
            //if (this.$.contains(p.$container))
            //    this.$.removeChild(p.$container);
            //else
            //    console.error('Properties does not contains ' + p.name);
//            p.target = null;
        });
        this.$.innerHTML = '';
    }
};

var models = {};

Model.add = function(ctor, name) {
    models[name] = ctor;
    //ctor.id_count = 0;
    Properties.create(ctor);
    live(ctor, 'create', function(model) {
            var actions = {};
            for (var name in Properties.actions)
                actions[name] = Properties.actions[name].bind(model.properties);
            model.register(actions);
    });
};
