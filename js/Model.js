/**
 * Base class for any event subscrible objects
 * @constructor
 */
function Model() {
    this.events = {};
    var current = this.constructor;
    do {
        for(var name in current.events)
            this.events[name] = current.events[name];
    }
    while(current = current.prototype.base);
    this.fire('create', [this]);
}

inherit(Model, Object, {
    /**
     * Register event listener
     * @param {string} name
     * @param {function} call
     */
    on: function(name, call) {
        (this.events[name] || (this.events[name] = [])).push(call);
    },

    /**
     * Register event listener that executes only once
     * @param {string} name
     * @param {function} call
     */
    once: function(name, call) {
        function _call() {
            call.call(this);
            this.off(name, _call);
        }
        this.on(name, _call);
    },

    /**
     * Removes event listener
     * @param {string} name
     * @param {function} call
     */
    off: function(name, call) {
        var i = this.events[name].indexOf(call);
        this.events[name] = this.events[name].splice(i, 1);
    },

    /**
     * Triggers some events
     * @param name
     * @param {Array|Object} args - arguments that will be pass to listeners
     */
    fire: function(name, args) {
        var events = this.events[name];
        if (events && events.length > 0) {
            if (!(args instanceof Array))
                args = [args];
            for (var i = 0; i < events.length; i++)
                events[i].apply(this, args);
        }
    },

    /**
     * Triggers some validators
     * @param name
     * @param {Array|Object} args - arguments that will be pass to listeners
     */
    validate: function(name, args) {
        try {
            this.fire(name, args);
        }
        catch (ex) {
            alert(ex);
        }
    },

    /**
     * Add many event listeners
     * @param {Object} events - named event listeners
     */
    register: function(events) {
        for(var name in events)
            this.on(name, events[name]);
    },

    /**
     * Remove many event listeners
     * @param {Object} events - named event listeners
     */
    unregister: function(events) {
        for(var name in events)
            this.off(name, events[name]);
    },

    /**
     * Defines property
     * @param {string} name - property name
     * @param {description} options
     * @see Object.defineProperty
     */
    define: function(name, options) {
        Object.defineProperty(this, name, options);
    },

    /**
     * Defines properties
     * @param {Object} extension
     * @see Object.defineProperty
     */
    extend: function(extension) {
        var keys = Object.getOwnPropertyNames(extension);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            Object.defineProperty(this, key,
                Object.getOwnPropertyDescriptor(extension, key));
        }
    },

    /**
     * Relative query selector
     * @param {string} selector
     * @returns {Element}
     */
    $$: function(selector) {
        return this.$.querySelector(selector);
    },

    /**
     * Destruction function, removes from DOM target element
     */
    destroy: function() {
        this.$.parentNode.removeChild(this.$);
        this.fire('destroy', [this]);
    },

    /**
     * SVG attribute getter
     * @param name
     * @returns {*}
     */
    get: function(name) {
        if (name in this)
            return this[name];
        var attr = this.$[name];
        return attr && attr.baseVal ? attr.baseVal.value : attr;
    },

    /**
     * SVG attribute setter
     * @param name
     * @param value
     */

    set: function(name, value) {
        var old = this.get(name);
        if (value != old) {
            if (this.$[name] && this.$[name].baseVal)
                this.$[name].baseVal.value = value;
            else
                this.$[name] = value;
            this.fire(name, [value, old]);
        }
    },

    /**
     * Adds value to attribute
     * @param name
     * @param value
     */
    inc: function(name, value) {
        this.set(name, this.get(name) + value);
    },

    /**
     * Gets or generates id of model if not available
     * @returns {string}
     */
    get id() {
        this.identify();
        return this.$.id;
    },

    set id(value) {
        this.$.id = value;
        this.fire('id', value);
    },

    identify: function() {
        if (!this.$.id) {
            if (!this.constructor.cid) {
                if (isNaN(this.constructor.id_count))
                    this.constructor.id_count = 0;
                this.constructor.cid = find(models, this.constructor)
                    || (this.constructor.name
                    || this.constructor.toString().match(/^function\s*([^\s(]+)/)[1])
                    .toLowerCase();
            }
            this.$.id = this.constructor.cid + ++this.constructor.id_count;
        }
        else
            return true;
    },

    toJSON: function() {
        var json = every(this.$.attributes, function(attribute) {
           this[attribute.nodeName] = attribute.value;
        });
        if (json.class)
            json.class = json.class.split(' ');
        return json;
    },

    properties: {
        'id': 'text'
    }
}, {
    flags: ['Active', 'Visible']
});

/**
 * Add common for class event listener, uses for loosely coupled binding
 * @param model
 * @param name
 * @param call
 */
function live(model, name, call) {
    if (!model.events)
        model.events = {};
    Model.prototype.on.call(model, name, call);
}
