function Plain(element) {
    Shape.call(this, mergeDefaults(element, {
        type: 'text'
    }));
    if (!element.$)
        this.$.textContent = this.id;
}

inherit(Plain, Shape, {
    keys: ['x', 'y'],

    dblclick: function() {
        var self = this;
        designer.dialog(this.$.textContent, function(result) {
            if ('ok' == result) {
                self.$.textContent = this.value;
            }
        });
    },

    set: function(name, value) {
        if (this.keys.indexOf(name) >= 0)
            this.$[name].baseVal[0].value = value;
        else
            this.base.prototype.set.call(this, name, value);
    },

    get: function(name) {
        if (this.keys.indexOf(name) >= 0)
            return this.$[name].baseVal[0].value;
        else
            return this.base.prototype.get.call(this, name);
    },

    move: function(x, y) {
        this.inc('x', x);
        this.inc('y', y);
    },

    properties: {

    }
});

Model.add(Plain, 'text');
