"use strict";

function Designer(element, root) {
    if (!element)
        element = 'svg';
    if ('string' == typeof element)
        element = $$(element);
    this.$ = element;

    this.$root = root || $$('.designer');
    this.scale = 1;
    this.initViewBox();
    var it = this;

    //region menus
    //this.$menu = $all('.menu')[1];
    //normilize(this.$menu);
    //each(this.$menu, function(div) {
    //    on(div, function() {
    //        it.remember('add ' + div.className);
    //        it.$menu.classList.remove('visible');
    //        var shapeType = div.dataset.shape;
    //        var shape = it.createShape(shapeType, true, true);
    //        if (!shape)
    //            return console.error(shapeType + ' does not created');
    //    });
    //});
    //endregion

    //region panels
    this.project = new Project(this.$);
    dialogs.Layers = new LayersPanel();
    dialogs.Shapes = new ShapesPanel();
    this.panels = {
        get layers() {
            console.log('panels.layers is obsolete');
            return dialogs.Layers;
        },
        get shapes() {
            console.log('panels.shapes is obsolete');
            return dialogs.Shapes;
        }
    };

    //this.$colors = this.$$('.panel.colors');
    //var i=1;
    //var tryColor = this.tryColor.bind(this);
    //var setColor = this.setColor.bind(this);
    //var colorsFragment = document.createDocumentFragment();
    //var row = document.createElement('div');
    //for (var name in darkColors) {
    //     if (0 == i % 14) {
    //         colorsFragment.appendChild(row);
    //         row = document.createElement('div');
    //     }
    //     var cell = document.createElement('div');
    //     cell.style.backgroundColor = name;
    //     cell.setAttribute('title', name);
    //     on(cell, 'mouseenter', tryColor);
    //     on(cell, 'click', setColor);
    //     row.appendChild(cell);
    //     i++;
    //}
    //colorsFragment.appendChild(row);
    //this.$colors.appendChild(colorsFragment);
    //on(this.$colors, 'mouseleave', this.resetColor.bind(this));
    //endregion

    //region dialogs
    //endregion

    //region events
    register(window, {
        keydown: this.keydown.bind(this),
        wheel: this.wheel.bind(this),

        popstate: function(e) {
            it.clear();
            it.fromJSON(e.state);
        },

        beforeunload: function () {
            //it.save();
        },

        unload: function() {
        },

        load: function() {
            it.initConfig('mime', 'application/json');
            it.initConfig('draft.disable', 'false');
            it.clear();
            function init() {
                if (it.getConfig('uid'))
                    it.load(function() {
                        if (it.draft && it.saveDraft)
                            it.fromString(it.draft);
                        else
                            it.project.id = 'project' + rand(1, 2000);
                        if (!it.project.identify())
                            console.error('Project identification error');
                        it.project.isActive = true;
                    });
                if (0 == it.project.length)
                    it.layer = it.project.add();
                it.$.attach();
            }
            init();
        }
    });

    var paste = this.paste.bind(this);
    register(this.$, {
        mousemove: this.drag.bind(this),
        contextmenu: this.menu.bind(this),
        click: this.click.bind(this),
        drop: paste,
        dragover: this.cancelPaste,
        dragenter: this.cancelPaste
    });
    //endregion
}
