"use strict";

function Circle(element) {
    Shape.call(this, mergeDefaults(element, {type: 'circle', r:5}));
    this.init();
}

inherit(Circle, Shape, {
    keys: ['cx', 'cy'],

    set: function(name, value) {
        if (name in this)
            this.round(name, value);
        else
            Model.descriptor.set.call(this, name, value);
    },

    move: function(x, y) {
        this.inc('cx', x);
        this.inc('cy', y);
    },

    setPosition: function (x, y) {
        this.set('cx', x);
        this.set('cy', y);
    }
});


function Point(element) {
    if (element instanceof SVGPoint) {
        Circle.call(this);
        this.target = element;
    }
    else {
        Circle.call(this, element);
        this.target = designer.$.createSVGPoint();
    }
    this.$.classList.add('control');
    //this.init(true);
    var it = this;
    this.on('cx', function(x) {
        it.target.x = x;
    });
    this.on('cy', function(y) {
        it.target.y = y;
    });

    this.setPosition(element.x, element.y);
    this.init(true);
    designer.foreground.$.appendChild(this.$);
}

inherit(Point, Circle, {
    destroy: function() {
        designer.foreground.$.removeChild(this.$);
    }
});
