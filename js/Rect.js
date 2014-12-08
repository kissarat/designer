"use strict";

function Rect(element) {
    var size = rand(35, 70);
    Shape.call(this, mergeDefaults(element, {
        type:'rect',
        height: size,
        width: size
    }));
}

inherit(Rect, Shape, {
    set: function(name, value) {
        if (this.keys.indexOf(name) >= 0) {
            switch (name) {
                case 'x':
                    if (value < 0)
                        value = 0;
                    else if ((value + this.width) > designer.width)
                        value = designer.width - this.width;
                    break;
                case 'y':
                    if (value < 0)
                        value = 0;
                    else if ((value + this.height) > designer.height)
                        value = designer.height - this.height;
                    break;
                case 'width':
                    if (this.x + value > designer.width)
                        value = designer.width - this.x;
            }
            this.round(name, value);
        }
        else
            Model.prototype.set.call(this, name, value);
    },

    move: function(x, y) {
        if ('move' == this.cursor) {
            this.inc('x', x);
            this.inc('y', y);
        }
        else {
            if ('w' == this.cursor[0] || 'w' == this.cursor[1]) {
                this.inc('x', x);
                this.inc('width', -x);
            }
            else if ('e' == this.cursor[0] || 'e' == this.cursor[1])
                this.inc('width', x);

            if ('n' == this.cursor[0]) {
                this.inc('y', y);
                this.inc('height', -y);
            }
            else if ('s' == this.cursor[0])
                this.inc('height', y);
        }
    },

    mouseover: function(e) {
        var f = e.box;
            f.x = (e.clientX - f.left)/ f.width;
            f.y = (e.clientY - f.top)/ f.height;
            for (var i in resizeCursor) {
                var rc = resizeCursor[i];
                if (f.x > rc[0] && f.y > rc[1] && f.x < rc[2] && f.y < rc[3]) {
                    this.cursor = rc[4];
                }
            }
    },

    properties: {
        x: 'number',
        y: 'number',
        width: 'number',
        height: 'number'
    },

    keys: ['x', 'y', 'width', 'height']
});

Model.add(Rect, 'rect');
