function Dialog(_) {
    this.$content = $id(_.id);
    if (this.$content)
        this.$content.removeAttribute('id');
    else
        this.$content = $new(_.content || {});
    this.$content.classList.add('content');
    this.head = new Menu({_:'div', $:reverse(_.head), class:'head'});
    this.foot = new Menu({_:'div', $:_.foot, class:'foot'});
    delete _.head;
    delete _.content;
    delete _.foot;
    if (!_.class)
        _.class = [];
    _.class.push('dialog');
    this.$ = $new(_);
    movable(this.head.$, this.$);
    this.$.appendChild(this.head.$);
    this.$.appendChild(this.$content);
    this.$.appendChild(this.foot.$);
    $$('#dialogs').appendChild(this.$);

    Model.call(this);
    if (!this.$.style.left) {
        this.$.setInt('left', innerWidth /3 + Math.random() * 40);
        this.$.setInt('top', innerHeight /3 + Math.random() * 40);
    }
}

inherit(Dialog, Model, {
    open: function() {
        this.isVisible = true;
    },

    close: function() {
        this.validate('close', arguments);
        this.isVisible = false;
    },

    toJSON: function() {
        var json = Model.prototype.toJSON.call(this);
        delete json.id;
        json.class = json.class.filter(function(clazz) {
           return clazz != 'dialog';
        });
        if (0 == json.class.length)
            delete json.class;
        return json;
    }
});
var dialogs = {};

register(window, {
    load: function() {
        //dialogs = JSON.parse(storage['dialogs']);
        //for(var id in dialogs) {
        //    var dialog = dialogs[id];
        //    dialog.id = id;
        //    Dialog.init(dialog);
        //}
    },
    unload: function() {
        for(var id in dialogs)
            dialogs[id] = dialogs[id].toJSON();
        storage['dialogs'] = JSON.stringify(dialogs);
    }
});

Dialog.open = function(id) {
    var dialog = dialogs[id];
    if (!(dialog instanceof Dialog)) {
        dialog = Dialog.init(dialog || {id:id});
    }
    dialog.open();
    return dialog;
};

Dialog.init = function(info) {
    var dialog = new DefaultDialog(info);
    dialogs[info.id] = dialog;
    return dialog;
};

function DefaultDialog(_) {
    var it = this;
    var head = _.head || {};
    head[_.id] = [true, function close() {
      Dialog.prototype.close.apply(it, arguments);
    }];
    Dialog.call(this, mergeDefaults(_, {
        head: head
        //foot: {ok: [true, close]}
    }));
}

inherit(DefaultDialog, Dialog);

function Action(info) {
    if (!(this instanceof Action)) {
        var action = Object.create(Action.prototype);
        Action.apply(action, arguments);
        return action;
    }
    var i=0;
    var _;
    var hasTitle = false;
    if ('object' == typeof info) {
        i++;
        _ = info;
    }
    else
        _ = {};
    if (!(_.$ instanceof Array))
        _.$ = [];
    for(; i<arguments.length; i++) {
        var arg = arguments[i];
        if (arg instanceof Function)
            _.onclick = arg;
        else if ('string' == typeof arg) {
            if (_.id)
                _.$.push(arg);
            else {
                _.id = arg;
                _.$.push($icon(arg, true));
            }
        }
        else if (true === arg)
            hasTitle = true;
        else
            _.$.push(arg);
    }
    if (hasTitle)
        _.title = _.id;
    else
        _.$.push(_.id);
    _.class = 'action';
    this.$ = $new(_);
    Model.call(this);
}

inherit(Action, Model, {
    get name() {
        var $span = this.$$('span');
        if ($span)
            return $span.textContent;
    },

    get onclick() {
        return this.$.onclick;
    },

    set onclick(call) {
        this.$.onclick = call;
    }
});

function IconAction(id, call) {
    Action.call(this, id, true, call);
}

inherit(IconAction, Action);

function Menu(info) {
    var items;
    if ('$' in info) {
        if ('object' == typeof info.$) {
            items = info.$;
        }
        delete info.$;
        if (!info._)
            info._ = 'div';
        ModelSet.call(this, info);
    }
    else {
        items = info;
        ModelSet.call(this, {_:'div'});
    }
    if (items)
        for(var name in items) {
            var item = items[name];
            if (item instanceof Action) {
                this.add(item);
            }
            else {
                var args = [name];
                if (item instanceof Array) {
                    args = args.concat(item);
                }
                else {
                    args.push((function () {
                        this.isVisible = true;
                    }).bind(new Menu(item)));
                }
                this.add(Action.apply(null, args));
            }
        }
}

inherit(Menu, ModelSet);


function ProjectExplorer() {
    DefaultDialog.call(this, {id:'Open',
        head: {
            'Add Catalog': [true]
        }
    });
}

var i = 10;

inherit(ProjectExplorer, DefaultDialog, {
    open: function() {
        var it = this;
        if (this.list)
            DefaultDialog.prototype.open.call(this);
        else
            on(ProjectExplorer.load(this.$content), 'success', function(e) {
                it.list = e.detail;
                it.open();
            })
    }
});

ProjectExplorer.load = function(catalog) {
    if (i-- < 0)
        throw '';
    var request = new XMLHttpRequest();
    request.open('GET', '/api/designer' + (catalog.uid ? '/' + catalog.uid : ''));
    on(request, 'load', function() {
        if (200 != request.status)
            return console.error(request.responseText);
        var list = JSON.parse(request.responseText);
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var info = {$:[]};
            var isCatalog = 'length' in item;
            info.$.push($icon(isCatalog ? 'Catalog' : 'About'));
            info.$.push(item.name);
            info.uid = item.uid;
            if (isCatalog)

            info.onclick = isCatalog ? function() {
                var $catalog = this;
                if (!this.classList.contains('catalog')) {
                    on(ProjectExplorer.load(this), 'success', function() {
                        $catalog.classList.add('catalog');
                    });
                }
            }
                : function() {

            }
        }
        this.dispatchEvent(new CustomEvent('success', {
            detail: list
        }))
    });
    request.send(null);
    return request;
};

dialogs.Open = new ProjectExplorer();