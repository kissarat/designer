function ListPanel(id, target) {
    DefaultDialog.call(this, {id:id});
    this.actions = {};
    var it = this;
    for(var key in ListPanel.actions)
        this.actions[key] = (function() {
            if (it.target || 'focus' == this)
                ListPanel.actions[this].apply(it, arguments);
        }).bind(key);
    if (target) {
        this.create(target);
        this.actions.focus(target);
    }
    this.create = this.create.bind(this);
}

inherit(ListPanel, DefaultDialog, {
    create: function(target) {
        target.register(this.actions);
    },

    getById: function(content) {
        for (var i = 0; i < this.$content.childNodes.length; i++)
            if (content == this.$content.childNodes[i].childNodes[1].textContent)
                return this.$content.childNodes[i];
    },

    get isEmpty() {
        return 0 == this.$content.childNodes.length;
    }
});

ListPanel.actions = {
    destroy: function(target) {
        target.unregister(this.actions);
    },

    focus: function(target) {
        this.target = target;
        if (target.each) {
            this.$content.detach();
            target.each(this.actions.add);
            this.$content.attach();
        }
        else
            console.error('Target ' + target.id + ' is not iterable');
    },

    blur: function() {
        this.$content.innerHTML = '';
        this.target = null;
    },

    add: function(item) {
        var it = this;
        var $item = document.createElement('div');
        var $visible = document.createElement('input');
        $visible.setAttribute('type', 'checkbox');
        $visible.checked = true;
        on($visible, 'change', function(e) {
            var shape = it.target.dict[e.target.nextSibling.textContent];
            if (e.target.checked)
                shape.$.attach();
            else
                shape.$.detach();
        });
        $item.appendChild($visible);
        var $id_text = document.createTextNode(item.id);
        $item.appendChild($id_text);
        if (item.isActive)
            $item.classList.add('active');
        item.on('id', function(value, old) {
            it.getById(old).childNodes[1].textContent = value;
        });
        on($item, function() {
            designer.active = item;
        });
        this.$content.appendChild($item);
    },

    remove: function(item) {
        this.$content.removeChild(this.getById(item.id));
    },

    active: function(newItem, oldItem) {
        if (0 == this.$content.childNodes.length)
            return;
        if (oldItem)
            this.getById(oldItem.id).classList.remove('active');
        if (newItem)
            this.getById(newItem.id).classList.add('active');
    }
};

function LayersPanel() {
    ListPanel.call(this, 'Layers');
    var it = this;
    on(document, 'DOMContentLoaded', function() {
        it.create(designer.project);
        //it.actions.focus(designer.project);
    });
    on('.panel.layers .add', function() {
        designer.project.add()
    });
}

inherit(LayersPanel, ListPanel);

function ShapesPanel() {
    ListPanel.call(this, 'Shapes');
    var it = this;
    live(Layer, 'create', it.create);
}

inherit(ShapesPanel, ListPanel);
