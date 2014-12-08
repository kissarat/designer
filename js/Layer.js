function Layer(id, hidden) {
    var info = id && 'string' == typeof id ? {id: id} : id;
    if (!info)
        info = {};
    if (!hidden)
        info.class = 'layer';
    ModelSet.call(this, info);
}

inherit(Layer, ModelSet, {
    create: function(shape) {
        return designer.createShape(shape);
    }
});

Model.add(Layer, 'layer');