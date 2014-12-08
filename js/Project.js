function Project(element) {
    ModelSet.call(this, element);
}

inherit(Project, ModelSet, {
    create: function(info) {
        var layer = new Layer();
        layer.fromJSON(info);
        return layer;
    },

    add: function(layer, i) {
        var hidden = true === i;
        if (!(layer instanceof Layer))
            layer = new Layer(layer, hidden);
        if (hidden)
            this.$.appendChild(layer.$);
        else {
            this.$.insertBefore(layer.$, isNaN(i) ? designer.foreground.$ : this.item(i).$);
            this.dict[layer.id] = layer;
            this.fire('add', layer);
            this.active = layer;
            designer.layer = layer;
        }
        return layer;
    }
});

Model.add(Project, 'project');
