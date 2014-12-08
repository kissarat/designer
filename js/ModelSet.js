
/**
 * Set of models identified by id with active element
 * @param {Element} element - container
 * @constructor
 */
function ModelSet(element) {
    Model.call(this);
    if (!(element instanceof Element)) {
        element = '_' in element ? $new(element) : designer.createElement(element);
    }
    this.$ = element;
    this.dict = {};
    this.restore = [];
}

inherit(ModelSet, Model, {
    /**
     * Adds model to set
     * @param item - model
     * @param {boolean} [activate] - make model active
     * @returns {Model}
     */
    add: function(item, activate) {
        if (!item)
            return console.error('Item is undefined');
        this.dict[item.id] = item;
        this.$.appendChild(item.$);
        var dict = this.dict;
        item.on('id', function(value, old) {
            var target = dict[old];
            delete dict[old];
            dict[value] = target;
        });
        this.fire('add', item);
        if (activate)
            this.active = item;
        return item;
    },

    /**
     * Removes model from set and destroy it
     * @param item
     */
    remove: function(item) {
        if (!item)
            item = this.active;
        else if ('string' == typeof item)
            item = this.dict[item];
        delete this.dict[item.id];
        this.fire('remove', item);
        item.destroy();
    },

    /**
     * Get model by index in container
     * @param i - index
     * @returns {Model}
     */
    item: function(i) {
        var item = this.$.childNodes[i];
        return this.dict[item.id];
    },

    /**
     * Iterates model set that ordered by index
     * @param call
     */
    each: function(call) {
        for (var i = 0; i < this.$.childNodes.length; i++) {
            var model = this.$.childNodes[i];
            model = this.dict[model.id];
            if (model)
                call(model, i);
        }
    },

    /**
     * Gets JSON-serializable state of model set
     * @returns {Object}
     */
    toJSON: function() {
        var list = [];
        for(var id in this.dict)
            list.push(this.dict[id].toJSON());
        var json = {
            id: this.id,
            $: list
        };
        if (this.restore.length > 0)
            json.restore = this.restore;
        return json;
    },

    /**
     * Restores state of model set from JSON-serializable object
     * @param {Object} json
     */
    fromJSON: function(json) {
        if (json.id)
            this.id = json.id;
        if (json.restore)
            this.restore = json.restore;
        for (var i = 0; i < json.$.length; i++) {
            var info = json.$[i];
            var item = this.create(info);
            if (item)
                this.add(item);
            else
                this.restore.push(info);
        }
    },

    /**
     * Removes all models from set
     */
    clear: function() {
        for(var id in this.dict)
            this.dict[id].destroy();
        this.restore = [];
    },

    destroy: function() {
        this.active = null;
        this.clear();
        Model.prototype.destroy.call(this);
    },

    /**
     * Get number of models in set
     * @returns {Number}
     */
    get length() {
        return count(this.dict);
    },

    get active() {
        return this._active;
    },

    /**
     * Sets active model
     * @param value
     */
    set active(value) {
        if (this._active !== value) {
            if (this._active)
                this._active.isActive = false;
            var oldActive = this._active;
            this._active = value;
            if (value)
                value.isActive = true;
            this.fire('active', [value, oldActive]);
        }
    },

    //get isActive() {
    //    return Model.descriptor.isActive.get.call(this);
    //},

    set isActive(value) {
        if (!value)
            this.active = false;
        Model.descriptor.isActive.set.call(this, value);
    },

    get restoreNumber() {
        var count = this.restore.length;
        for(var key in this.dict)
            if (this.dict[key].restoreNumber)
                count += this.dict[key].restoreNumber;
        return count;
    }
});
