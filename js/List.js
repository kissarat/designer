function Button() {
    if (!(this instanceof Button)) {
        var button = Object.create(Button.prototype);
        return Button.apply(button, arguments);
    }
    construct(this, arguments);
    Model.call(this);
    this.$ = $new({onclick: this.call, $:[
        $icon(this.icon),
        this.text
    ]});
}
Button.defaults = {
    text: null,
    icon: null,
    call: null
};
inherit(Button, Model);

function List(info) {
    this.list = [];
    this.$ = $new(info) || document.createElement('div');
}

inherit(List, Model, {
    add: function(item) {
        this.list.push(item);
        this.$.appendChild(item.$);
        this.fire('add', [item, this]);
    },

    addItem: function() {
        this.add(Button.apply(this, arguments));
    },

    remove: function(text) {
        var i, button;
        for (i = 0; i < this.list.length; i++) {
            button = this.list[i];
            if (text == button.text)
                break;
        }
        if (this.list.length == i)
            return console.error('Button with text ' + text + ' not found');
        this.list = this.list.splice(i);
        this.$.detach();
        this.$.innerHTML = '';
        for (i = 0; i < this.list.length; i++)
            this.$.appendChild(this.list[i].$);
        this.$.attach();
        this.fire('remove', [button, this]);
    },

    clear: function() {
        var item;
        this.$.detach();
        while (item = this.list.pop()) {
            this.$.removeChild(item.$);
            this.fire('remove', [item, this]);
        }
        this.$.attach();
    }
});

function Tree(items) {
    if (items._) {
        var tmp = items.$;
        delete items.$;
        this.$ = $new(items);
        items = tmp;
    }
    else
        this.$ = document.createElement('div');
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item instanceof Array)
            this.addItem(item);
        else
            this.add(new Tree(item));
    }
}

inherit(Tree, List);
