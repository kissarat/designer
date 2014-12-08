"use strict";

function Polyline(element) {
    this.points = [];
    var x = element.x;
    var y = element.y;
    delete element.x;
    delete element.y;
    Shape.call(this, mergeDefaults(element, {type: 'polyline'}));
    if (0 == this.$.points.length && x && y) {
        var dx = rand(40, 80);
        var dy = rand(30, 40);
        this.add(this.create({x:x, y:y}));
        this.add(this.create({x:x + dx, y:y}));
        this.add(this.create({x:x + dx, y:y + dy}));
        this.add(this.create({x:x, y:y + dy}));
    }
    else {
        var it = this;
        each(this.$.points, function(p) {
            it.points.push(new Point(p));
        });
    }
}

inherit(Polyline, Shape, {
    add: function(p) {
        this.$.points.appendItem(p.target);
        this.points.push(p);
    },

    create: function(p) {
        var point = new Point(p);
        point.$.classList.add('control');
        return point;
    },

    insert: function(p, i) {
        p = this.create(p);
        this.$.points.insertItemBefore(p.target, i);
        this.points = this.points.splice(i, 0, p);
    },

    findIndex: function(p) {
        if (!p)
            p = designer.selected.target;
        return this.points.indexOf(p);
    },

    remove: function(p) {
        var i = this.findIndex(p.target);
        //p = this.points[i];
        this.$.points.removeItem(i);
        this.designer.foreground.$.removeChild(p.$);
    },

    move: function(x, y) {
        each(this.points, function(p) {
            p.move(x, y);
        });
    },

    clear: function() {
        var p;
        while(p = this.points.pop())
            designer.foreground.$.removeChild(p.$);
    },

    destroy: function() {
        this.clear();
        Shape.prototype.destroy.call(this);
    }
});

Model.add(Polyline, 'polyline');
