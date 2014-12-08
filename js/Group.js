function Group() {
    Model.call(this);
    this.dict = {};
    for (var i = 0; i < arguments.length; i++)
        this.add(arguments[i]);
}

inherit(Group, Model, {
    add: function(shape) {
        shape.isActive = true;
        this.dict[shape.id] = shape;
    },

    toggle: function(shape) {
        if (shape.id in this.dict) {
            delete this.dict[shape.id];
            shape.isActive = false;
            return false;
        }
        else {
            this.add(shape);
            return true;
        }
    },

    move: function(x, y) {
        for(var id in this.dict)
            this.dict[id].move(x, y);
    },

    set isActive(value) {
        for(var id in this.dict)
            this.dict[id].isActive = value;
        //Model.descriptor.isActive.set.call(this, value);
    }
});