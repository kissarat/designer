function Shape(element) {
    Model.call(this);
    if ('string' == typeof element)
        element = designer.$$(element);
    else if (!(element instanceof SVGElement))
        element = designer.createElement(element);
    this.$ = element;
    this.movable = true;
    //this.init(true);
}

inherit(Shape, Model, {
    /**
     * Properties values of which must be verified and rounded
     */
    keys: [],

    /**
     * Initializing keys values
     * @see keys
     */
    init: function() {
        for (var i = 0; i < this.keys.length; i++) {
            var key = this.keys[i];
            this[key] = this.get(key);
        }
    },

    /**
     * Default implementation of JSON serialization for all shapes
     * @returns {Object}
     */
    toJSON: function() {
        var attrs = this.$.attributes;
        var json = {type: this.constructor.cid || find(models, this.constructor)};
        for(var i=0; i<attrs.length; i++) {
            var attr = attrs[i];
            json[attr.nodeName] = attr.value;
        }
        json.title = this.title;
        delete json.style;
        delete json.class;
        return json;
    },

    get classes() {
        return this.$.getAttribute('class').split(' ').filter(function(clazz) {
            return clazz != 'active';
        });
    },

    //region properties
    /**
     * Root element that uses for element creation
     * @returns {SVGSVGElement}
     */
    get root() {
        return this.$.ownerSVGElement;
    },

    get cursor() {
        return this.$.style.cursor;
    },

    /**
     * Sets CSS cursor
     * @param {string} value
     */
    set cursor(value) {
        this.$.style.cursor = value;
    },

    /**
     * Sets shape hint
     * @param value
     */
    set title(value) {
        var tag = this.$$('title');
        if (!tag) {
            tag = document.createElementNS(svgns, 'title');
            this.$.appendChild(tag);
        }
        tag.textContent = value;
    },

    get title() {
        var tag = this.$$('title');
        if (tag)
            return tag.textContent;
    },
    //endregion

    //region events
    /**
     * Motion start event
     * @param {MouseEvent} e
     */
    dragstart: function(e) {
        if (!(designer.active instanceof Group)) {
            if (this.$.classList.contains('control'))
                designer.selected = this;
            else
                designer.active = this;
        }
        this.motionStart = e;
        this.init(false);
        e.cancelBubble = false;
        return false;
    },

    /**
     * Motion end event
     */
    dragend: function(e) {
        var start = this.motionStart;
        if (e.ctrlKey && start.clientX == e.clientX && start.clientY == e.clientY) {
            if (this.$.classList.contains('control')) {
                if (designer.selected instanceof Group)
                    designer.selected.toggle(this);
                else if (designer.selected instanceof Shape)
                    designer.selected = new Group(designer.selected, this);
            }
            else {
                if (designer.active instanceof Group)
                    designer.active.toggle(this);
                else if (designer.active instanceof Shape)
                    designer.active = new Group(designer.active, this);
            }
        }
        delete this.motionStart;
    },

    /**
     * Motion movement event
     * @param {MouseEvent} e
     */
    drag: function(e) {
        var active = this.$.classList.contains('control') ? designer.selected : designer.active;
        if (1 != e.button && this.motionStart) {
            (active instanceof Group ? active : this)
                .move(
                e.movementX * designer.scale,
                e.movementY * designer.scale);
        }
        else {
            if (active instanceof Group)
                this.cursor = 'move';
            else
                this.mouseover(e);
        }
    },

    mouseover: function(e) {
        this.cursor = 'move';
    },

    toString: function() {
        return this.$.id;
    },

    /**
     * Rounds and sets attribute
     * @param name
     * @param value
     * @returns {number}
     */
    round: function(name, value) {
        this[name] = value;
        Model.prototype.set.call(this, name, Math.round(value / designer.grid) * designer.grid);
    },

    /**
     * Makes shapes movable
     * @param value
     */
    set movable(value) {
        var it = this;
        //if shape is not movable already
        if (!this.mousedown)
            Object.defineProperty(this, 'mousedown', {value: function(e) {
                var now = Date.now();
                if (now - it.firstClick < 300) {
                    it.dblclick(e);
                }
                else {
                    on(it.root, 'mousemove', drag);
                    off(it.$, 'mousemove', drag);
                    on(it.root, 'mouseup', dragend);
                    on(it.root, 'mouseleave', dragend);
                    it.dragstart(e);
                }
                //timestamp for detecting double click
                it.firstClick = now;
            },
                enumerable: false
            });

        function drag(e) {
            it.drag(e);
        }

        function dragend(e) {
            it.dragend(e);
            off(it.root, 'mouseup', dragend);
            off(it.root, 'mouseleave', dragend);
            off(it.root, 'mousemove', drag);
            on(it.$, 'mousemove', drag);
        }

        if (value) {
            on(this.$, 'mousemove', drag);
            on(this.$, 'mousedown', this.mousedown);
        }
        else {
            dragend(false);
            off(this.$, 'mousedown', this.mousedown);
            this.mousedown = null;
        }
    },

    /**
     * Double click event
     */
    dblclick: function() {
        var it = this;
        designer.dialog(this.title, function(result) {
            if ('ok' == result) {
                it.title = this.value;
            }
        });
    },

    /**
     * Gets index of element in parentNode
     * @returns {number}
     */
    get zIndex() {
        return indexOf(this.$);
    },

    set zIndex(i) {
        if (isNaN(i))
            return;
        var info = designer.getShape(this.id);
        var layer = info[1];
        var ref = layer.item(i);

        if (layer.length == i)
            layer.$.appendChild(this.$);
        else
            layer.$.insertBefore(this.$,
                    1 == i && 0 == this.zIndex
                    ? ref.$.nextElementSibling : ref.$);
        this.fire('zIndex', [i]);
    },

    //endregion
    /**
     * Properties list for panel
     */
    properties: {
        fill: 'color',
        stroke: 'color',
        opacity: 'range',
        'fill-opacity': 'range'

//        'z-index': inherit(function () {
//            Property.types.number.call(this);
//        }, Property.types.number, {
//            set target(target) {
//                this.input.mix = 0;
//                this.input.max = target.parentNode.childNodes.length - 1;
//                Property.descriptor.target.set.call(this, target);
//            },
//
//            get value() {
//                return this._target.zIndex;
//            },
//
//            set value(value) {
//                this._target.zIndex = value;
//            }
//        })
    }
});
