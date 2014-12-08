"use strict";

inherit(Designer, Model, {
    format_version: 0.2,
    randomColor: randDict(darkColors),
    width: 800,
    height: 600,
    grid: 10,

    //region initialization
    initViewBox: function (x, y, width, height) {
        var args = [x || 0, y || 0,
                width || innerWidth,
               height || innerHeight];
        this.$.setAttribute('viewBox', join(args));
        this.centerX = args[2]/2;
        this.centerY = args[3]/2;
    },

    createElement: function (info, htmlTag) {
        if ('boolean' == typeof info) {
            htmlTag = info;
            info = {};
        }
        if (!info)
            info = {};
        var shape = htmlTag || 'div' == info.type ?
            document.createElement(info.type || 'div')
            : document.createElementNS(svgns, info.type || 'g');
        if (!htmlTag && info.title) {
                var title = document.createElementNS(svgns, 'title');
                title.textContent = info.title;
                shape.appendChild(title);
            }
        for(var name in info) {
            var value = info[name];
            if ('on' == name.slice(0, 2)) {
                on(shape, name.slice(2), value);
                continue;
            }
            //if (value instanceof Function)
            //    value = value();
            if ('$' == name) {
                if (value instanceof Array)
                    shape.appendAll(value, shape);
                else
                    shape.innerHTML = value;
            }
            else if ('href' == name)
                shape.setAttributeNS(xlinkns, 'xlink:' + name, value);
            else if (['type', 'list'].indexOf(name) < 0)
                shape.setAttribute(name, value);
        }
        return shape;
    },

    appendAll: function(list, target, call) {
        if (!call)
            call = tellme;
        for(var key in list) {
            var child = call(list[key], key);
            child = this.createElement(child);
            target.appendChild(child);
        }
    },

    clear: function() {
        this.project.clear();
        dialogs.Shapes.actions.blur();

        if (!this.background) {
            this.background = this.project.add({
                class: 'background control',
                id: 'background'
            }, true);
            var path = this.createElement({type: 'path', stroke: '#DDDDDD', fill: 'transparent'});
            var path_bold = this.createElement({type: 'path', stroke: '#BBB', fill: 'transparent'});
            var grid = 10;
            var width = this.width / grid;
            var height = this.height / grid;
            var i, j;

            for(i=0; i<=width; i++) {
                if (i % 5) {
                    path.pathSegList.appendItem(path.createSVGPathSegMovetoAbs(i*grid, 0));
                    path.pathSegList.appendItem(path.createSVGPathSegLinetoVerticalRel(this.height));
                }
                else {
                    path_bold.pathSegList.appendItem(path_bold.createSVGPathSegMovetoAbs(i*grid, 0));
                    path_bold.pathSegList.appendItem(path_bold.createSVGPathSegLinetoVerticalRel(this.height));
                }
            }
            for(i=0; i<=height; i++) {
                if (i % 5) {
                    path.pathSegList.appendItem(path.createSVGPathSegMovetoAbs(0, i*grid));
                    path.pathSegList.appendItem(path.createSVGPathSegLinetoHorizontalRel(this.width));
                }
                else {
                    path_bold.pathSegList.appendItem(path_bold.createSVGPathSegMovetoAbs(0, i*grid));
                    path_bold.pathSegList.appendItem(path_bold.createSVGPathSegLinetoHorizontalRel(this.width));
                }
            }
            this.background.$.appendChild(path);
            this.background.$.appendChild(path_bold);

            for(i=0; i<=width; i+=10)
                for(j=0; j<height; j+=30) {
                    var text = this.createElement({
                        style: 'font-weight: bold; fill: #AAAAAA; font-family: "Courier New"',
                        type: 'text', x: i*grid + 2, y: j*grid + 15, $: i*grid
                    });
                    this.background.$.appendChild(text);
                }
            for(i=0; i<=height; i+=10)
                for(j=0; j<width; j+=30) {
                    text = this.createElement({
                        style: 'font-weight: bold; fill: #AAAAAA; font-family: "Courier New"',
                        transform: 'rotate(90, ' + j*grid + ', ' + i*grid + ')',
                        type: 'text', y: (i - 6)*grid, x: j*grid + 1, $: i*grid
                    });
                    this.background.$.appendChild(text);
                }
        }
        if (!this.foreground)
            this.foreground = this.project.add({
                class:'foreground control',
                id: 'foreground'
            }, true);
    },

    save: function() {
        if (this.isEmpty)
            return console.log('Nothing to save');
        this.draft = this.toString();
        var it = this;
        var url = '/api/designer';
        var method = 'POST';
        if (this.getConfig('uid')) {
            url += '/' + this.getConfig('uid');
            method = 'PUT';
        }
        var request = new XMLHttpRequest();
        request.open(method, url);
        request.setRequestHeader('Content-Type', this.getConfig('mime'));
        request.setRequestHeader('Project-Name', this.project.id);
        request.onload = function() {
            if (200 != request.status) {
                if (404 == request.status) {
                    it.removeConfig('uid');
                    it.save()
                }
                return;
            }
            var data = JSON.parse(request.responseText);
            if (data.uid) {
                it.setConfig('uid', data.uid);
                it.removeConfig('draft');
            }
        };
        request.send(this.draft);
    },

    load: function(uid, call) {
        if (!call) {
            call = uid;
            uid = this.getConfig('uid');
        }
        if (!uid) {
            //console.error('Nothing to load');
            return call();
        }

        var it = this;
        var request = new XMLHttpRequest();
        request.open('GET', '/api/designer/' + uid);
        request.setRequestHeader('Accept', this.getConfig('mime'));
        request.onload = function() {
            if ([200, 304].indexOf(request.status) < 0)
                return console.error(request.statusText);
            it.draft = JSON.parse(request.responseText);
            it.clear();
            it.fromString(it.draft);
            call();
        };
        request.send(null);
    },

    reset: function() {
        for(var key in models)
            models[key].id_count = 0;
        Layer.id_count = 0;
        this.removeConfig('draft');
        this.removeConfig('uid');
        this.clear();
    },

    error: function(message, model) {
        console.error(message, model ? model.id : '');
    },
    //endregion

    //region panels
    dialog: function(text, call) {
        this.closeDialogCallback = call;
        this.$dialog.classList.add('visible');
        this.$dialog.querySelector('textarea').textContent = text;
    },
    //endregion

    //region events
    drag: function(e) {
        this.mouse = e;
        if (1 != e.button)
            return true;
        var scale = this.scale;
        var vb = this.$.viewBox.baseVal;
            vb.x -= e.movementX*scale;
            vb.y -= e.movementY*scale;
        this.centerX = vb.x + this.get('width')/2;
        this.centerY = vb.y + this.get('height')/2;
        return false;
    },

    click: function(e) {
        this.$menu.classList.remove('visible');
    },

    wheel: function(e) {
        if (!(document.elementFromPoint(e.clientX, e.clientY) instanceof SVGElement))
            return true;
        if (0 != e.wheelDeltaX)
            return false;
        var box = this.$.getBoundingClientRect();
        this._scale = e.wheelDeltaY > 0 ? this._scale + 1 : this._scale - 1;
        var scale = this.scale;
        if (scale > 2)
            this.scale = scale = 2;
        var dx = scale * box.width/2;
        var dy = scale * box.height/2;
        var vbox = this.$.viewBox.baseVal;
        vbox.width = dx*2;
        vbox.height = dy*2;
        vbox.x = this.centerX - dx;
        vbox.y = this.centerY - dy;
        e.preventDefault();
        return false;
    },

    keydown: function(e) {
        switch (e.keyCode) {
            case KeyCode.ENTER:
                if (e.shiftKey && $$('.dialog').classList.contains('visible')) {
                    $$('.ok').click();
                    e.preventDefault();
                    return false;
                }
                break;
            case KeyCode.ESCAPE:
                if ($$('.dialog').classList.contains('visible'))
                    $$('.close').click();
                else
                    designer.active = null;
                break;
            case KeyCode.DELETE:
                this.remember('delete');
                this.layer.remove();
                break;
            case KeyCode.ADD: //+
            case KeyCode.NUMPAD_ADD:
                var active = this.active;
                if (active instanceof Polyline) {
                    var i = active.findIndex();
                    var p = active.create();
                    active.insert(p, i);
                    p.setPosition(this.mouse.offsetX, this.mouse.offsetY);
                    p.$.dispatchEvent(new MouseEvent('mousedown', this.mouse));
                }
                else
                    this.error('Active model is not polyline', active);
                break;
            case KeyCode.SUBTRACT: //-
            case KeyCode.NUMPAD_SUBTRACT:
                this.selected.remove();
                break;
            case KeyCode.Z:
                if (e.ctrlKey)
                    history.back();
                break;
            case KeyCode.F9:
                this.$root.requestFullScreen();
                break;
            case KeyCode.V:
                if (e.ctrlKey)
                    this.panels.shapes.$.focus();
        }
    },

    cancelPaste: function(e) {
        e.preventDefault();
        return false;
    },

    pasteFile: function(file) {
        if (!file || file.type.indexOf('image') != 0)
            return;
        var reader = new FileReader();
        reader.onload = (function (e) {
            designer.createShape({
                type: 'image',
                href: e.target.result
            }, true, true);
        }).bind(file);
        reader.readAsDataURL(file);
    },

    paste: function(e) {
        e.preventDefault();
        var i=0;
        if (e.clipboardData) {
            var item;
            for (; i < e.clipboardData.items.length; i++) {
                item = e.clipboardData.items[i];
                this.pasteFile(item.getAsFile());
            }
            if (item)
                if (1 == i && 'text/plain' == item.type);
                    //item.getAsString(this.text.bind(this, e));
                else if (2 == i && 'text/html' == item.type)
                    item.getAsString(function(string) {
                        var foreign = designer.createShape('foreign', true);
                        foreign.$.innerHTML = string;
                    });
        }
        else if (e.dataTransfer)
            for (;i < e.dataTransfer.files.length; i++)
                this.pasteFile(e.dataTransfer.files[i]);
        else
            console.error('Unknown paste event', e);
        if (0 == i)
            console.warn('Nothing pasted');
        return false;
    },
    
    tryColor: function(e) {
        if (this.active) 
            this.active.$.style.fill = e.target.style.backgroundColor;
    },
    
    setColor: function(e) {
        if (this.active) 
            this.active.$.setAttribute('fill', e.target.style.backgroundColor);
    },
    
    resetColor: function(e) {
        if(this.active && this.active.$.style.fill)
            this.active.$.style.fill = '';
    },
    //endregion

    //region shapes
    menu: function(e) {
        e.preventDefault();
        e.returnValue = false; //Internet Explorer ???
//        e.defaultPrevented = true;
        this.mouse = e;
        this.$menu.style.left = e.clientX + 'px';
        this.$menu.style.top = e.clientY + 'px';
        this.$menu.classList.add('visible');
        return false;
    },

    createShape: function(shape, add, activate) {
        var type;
        if ('string' == typeof shape) {
            type = shape;
            shape = {};
            if (['foreign', 'text', 'image'].indexOf(type) < 0)
                shape.fill = this.randomColor();
        }
        else
            type = shape.type;
        if (isNaN(shape.x))
            shape.x = this.mouse.offsetX;
        if (isNaN(shape.y))
            shape.y = this.mouse.offsetY;
        if (type && type in models)
            shape = new models[type](shape);
        else
            return this.error('Alias not found', shape);
        if (add)
            this.layer.add(shape, activate);
        //this.fire('createShape', shape);
        return shape;
    },

    getShape: function(id) {
        for (var layer_id in this.project.dict) {
            var layer = this.project.dict[layer_id];
            if (layer.dict[id])
                return [layer.dict[id], layer];
        }
    },
    //endregion

    //region serialization
    toJSON: function() {
        var json = this.project.toJSON();
        json.format = this.format_version;
        json.counter = {};
        for (var key in models)
            json.counter[key] = models[key].id_count || 0;
        json.counter.layer = Layer.id_count;
        return json;
    },

    toString: function() {
        return JSON.stringify(this.toJSON(), function(key, value) {
            if (/^\d+$/.test(value))
                return parseInt(value);
            return value;
        });
    },

    fromJSON: function(project) {
        if (!project || !project.format) {
            console.error('Unknown format');
            return false;
        }
        if (project.format != this.format_version) {
            console.error('Unknown format version ' + project.format);
            return false;
        }
        for(var key in models)
            models[key].id_count = project.counter[key];
        Layer.id_count = project.counter.layer;
        this.$.detach();
        this.project.fromJSON(project);
        this.$.attach();
        return true;
    },

    fromString: function(project) {
        return this.fromJSON(JSON.parse(project));
    },

    remember: function(name) {
        document.title =
            name + (this.active ? ' ' + this.active.$.id : ' ')
            + ' ' + new Date().toLocaleTimeString();
        history.pushState(this.toJSON(), document.title, null);
    },
    //endregion

    //region properties
    $$: function(selector) {
        return this.$root.querySelector(selector);
    },

    get shapesNumber() {
        var count = 0;
        this.project.each(function(layer) {
            count += layer.length;
        });
        return count;
    },

    get draft() {
        var draft = this.getConfig('draft');
        if (draft)
            return draft;
    },

    set draft(value) {
        if ('object' == typeof value)
            value = JSON.stringify(value);
        this.setConfig('draft', value);
    },

    get isEmpty() {
        return 0 == this.shapesNumber && 0 == this.project.restoreNumber;
    },

    get active() {
        return this._active;
    },

    set active(value) {
        if (value === this._active)
            return;
        this.selected = null;
        if (this._active instanceof Group)
            this._active.isActive = false;
        if (value instanceof Layer)
            this.layer = value;
        else if (value instanceof Shape) {
            var info = this.getShape(value.id);
            if (info) {
                this.layer = info[1];
                this.layer.active = info[0];
            }
            else
                throw new Error("Shape with id " + value.id + " not found");
        }
        this._active = value;
    },

    get selected() {
        return this._selected;
    },

    set selected(value) {
        if (this._selected) {
            if (this._selected.$)
                this._selected.$.classList.remove('selected');
            this._selected = null;
        }
        if (value)  {
            if (value.$)
                value.$.classList.add('selected');
            this._selected = value;
        }
    },

    get layer() {
        return this.project.active;
    },

    set layer(value) {
        this.project.active = value;
    },

    set saveDraft(value) {
        this.setConfig('draft.disable', !value);
    },

    get saveDraft() {
        return 'true' != this.getConfig('draft.disable');
    },

    setConfig: function(name, value) {
        storage[name] = value;
    },

    getConfig: function(name) {
        return storage[name];
    },

    removeConfig: function(name) {
        delete storage[name];
    },

    initConfig: function(name, defaultValue) {
        if (!this.getConfig(name))
            this.setConfig(name, defaultValue);
    },

    get scale() {
        return Math.pow(Math.E, this._scale/8);
    },

    set scale(value) {
        this._scale = Math.log(value)*8;
    },
    //endregion

    properties: {
        width: 'number',
        height: 'number',
        grid: 'number'
    }
});

var designer = new Designer($designer);

Properties.prototype.$ = designer.$$('.properties .content');