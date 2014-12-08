/**
 * Utilities and extensions for working with user interface
 */
"use strict";

/**
 * Helper function for making movable elements
 * @param {Element|selector} it - element for movement
 * @param {Element} [root] - container
 * @param call - movement implementation callback
 */
function movable(it, root, call) {
    if ('string' == typeof it)
        it = document.querySelector(it);
    if (2 == arguments.length) {
        call = root;
        root = document.body;
    }
    if (call instanceof Element)
        call = (function(e) {
        this.addFloat('left', e.movementX);
        this.addFloat('top', e.movementY);
    }).bind(call);
    it._mousemove = function(e) {
        if (it.motionStart)
            call.call(it, e);
    };
    it._mouseup = function(e) {
        off(root, 'mouseleave', it._mouseup);
        off(root, 'mouseup', it._mouseup);
        off(root, 'mousemove', it._mousemove);
        it.motionStart = null;
    };
    on(it, 'mousedown', function(e) {
        on(root, 'mousemove', it._mousemove);
        on(root, 'mouseup', it._mouseup);
        on(root, 'mouseleave', it._mouseup);
        it.motionStart = e;
    });
    it.style.cursor = 'move';
}

define(MouseEvent, 'box', {
    /**
     * Gets bounding client rect for event
     * @returns {ClientRect}
     * @see Element.prototype.getBoundingClientRect
     */
    get: function() {
        if (!this._box)
            this._box = this.target.getBoundingClientRect();
        return this._box
    }
});

function add(element, name, value, min) {
    value = parseInt(element.style[name]) + value;
    if (value < (min || 0))
        return false;
    element.style[name] = Math.round(value) + 'px';
    return true;
}

/**
 * Shorthand for querySelector
 * @param {string} selector
 * @param {Element} [context]
 * @returns {Element}
 * @see Element.prototype.querySelector
 */
function $$(selector, context) {
    return (context || document).querySelector(selector);
}

/**
 * Shorthand for querySelectorAll
 * @param {string} selector
 * @param {Element} [context]
 * @returns {NodeList}
 * @see Element.prototype.querySelectorAll
 */
function $all(selector, context) {
    return (context || document).querySelectorAll(selector);
}

function $id(id) {
    return document.getElementById(id);
}

function $new(info) {
    if (!info)
        return console.warn('No information to create');
    if ('string' == typeof info)
        info = {_:'span', $:info};
    else if(info instanceof Array) {
        info = {
            $: info
        }
    }
    if (!info._)
        info._ = 'div';
    var _ = info._ instanceof Element ? info._ : document.createElement(info._);
    delete info._;
    if ('$' in info) {
        if ('string' == typeof info.$)
            _.innerHTML = info.$;
        else if (info.$.length)
            for (var i = 0; i < info.$.length; i++) {
                var item = info.$[i];
                if (!item)
                    continue;
                if (!(item instanceof Element))
                    item = $new(item);
                _.appendChild(item);
            }
        delete info.$;
    }
    if (info.checked)
        _.setAttribute('checked', 'checked');
    if (info.class instanceof Array)
        info.class = info.class.join(' ');
    for(var key in info) {
        var attr = info[key];
        if (0 == key.indexOf('on'))
            on(_, key.slice(2), attr);
        else if ('$' == key[0])
            _.style.setProperty(key.slice(1), attr);
        else
            _.setAttribute(key, attr);
    }
    if (!info.checked)
        _.removeAttribute('checked');
    return _;
}

function $row(values, keys) {
    var $tr = document.createElement('tr');
    var i, $cell;
    if (keys)
        for(i in keys) {
            $cell = document.createElement('td');
            $cell.innerHTML = values[keys[i]];
            $tr.appendChild($cell)
        }
    else
        for(i in values) {
            $cell = document.createElement('td');
            $cell.innerHTML = values[i];
            $tr.appendChild($cell)
        }
    return $tr;
}

ext(Element, {
    /**
     * Initialize CSS properites for element
     * @param properties
     */
    initStyle: function initStyle(properties) {
        if ('string' == typeof properties)
            properties = properties.split(' ');
        var style = getComputedStyle(this);
        for(var i=0; i<properties.length; i++) {
            var name = properties[i];
            this.style.setProperty(name, style[name]);
        }
    },

    /**
     * Appends children to element
     * @param list - iterable list of elements
     */
    appendAll: function(list) {
        this.detach();
        for(var i in list)
            this.appendChild(list[i]);
        this.attach();
    },

    /**
     * Temporary detaches element from DOM
     */
    detach: function(animate, full) {
        var parent_index = indexOf(this);
        if (parent_index != this.parentNode.childNodes.length - 1)
            this._parent_index = parent_index;
        this._parent = this.parentNode;
        this.remove();
        if (animate && !$$('#busy')) {
            this._busy = $busy;
            if (full)
                this._busy.classList.add('full');
            if ('_parent_index' in this)
                this._parent.insertBefore(this._busy, this._parent.childNodes[this._parent_index]);
            else
                this._parent.appendChild(this._busy);
            this._busy.style.display = 'block';
        }
        return this;
    },

    /**
     * Insert element in the same position that it was detached
     */
    attach: function() {
        if (this.parentNode)
            return console.log(this.describe() + ' is attached');
        if (this._busy) {
            this._parent.removeChild(this._busy);
            this._busy.classList.toggle('full');
            this._busy.style.removeProperty('display');
            document.body.appendChild(this._busy);
            delete this._busy;
        }
        if ('_parent_index' in this)
            this._parent.insertBefore(this, this._parent.childNodes[this._parent_index]);
        else
            this._parent.appendChild(this);
        delete this._parent;
        delete this._parent_index;
    },

    getAncestorByTagName: function(tag) {
        tag = tag.toUpperCase();
        for(var current = this.parentNode || this._parent; ; current = current.parentNode)
            if (tag == current.nodeName)
                return current;
    },

    /**
     * Simulates click
     */
    click: function() {
        this.dispatchEvent(new MouseEvent('click'));
    },

    describe: function() {
        if (this.hasAttribute('id'))
            return this.id;
        var attributes = this.attributes.map(function(attr) {
            return attr.nodeName + '="' + attr.value + '"';
        });
        return '<' + this.nodeName.toLowerCase() + ' ' + attributes.join(' ') + '>';
    },

    /**
     * Computes CSS property and cast it to integer
     * @param name - CSS integer property name
     * @returns {Number}
     */
    getInt: function(name) {
        return parseInt(this.style[name] || getComputedStyle(this)[name]);
    },

    /**
     * Setting CSS property assuming it is measured in pixels if suffix is not set
     * @param {string} name - CSS integer property name
     * @param {Number} value - integer value (without the suffix)
     * @param {string} [suffix]
     */
    setInt: function(name, value, suffix) {
        this.style[name] = Math.round(value) + (suffix || 'px');
    },

    /**
     * Adds integer value to CSS property, equivalent to Model.prototype.inc
     * @param {string} name - CSS integer property name
     * @param {Number} value - value to add
     * @param {string} [suffix]
     */
    addInt: function(name, value, suffix) {
        this.setInt(name, this.getInt(name) + value, suffix);
    },

    /**
     * Computes CSS property and cast it to float
     * @param name - CSS float property name
     * @returns {Number}
     */
    getFloat: function(name) {
        return parseFloat(this.style[name] || getComputedStyle(this)[name]);
    },

    /**
     * Setting CSS property assuming it is measured in pixels if suffix is not set
     * @param {string} name - CSS float property name
     * @param {Number} value - float value (without the suffix)
     * @param {string} [suffix]
     */
    setFloat: function(name, value, suffix) {
        this.style[name] = value + (suffix || 'px');
    },

    /**
     * Adds float value to CSS property, equivalent to Model.prototype.inc
     * @param {string} name - CSS float property name
     * @param {Number} value - value to add
     * @param {string} [suffix]
     */
    addFloat: function(name, value, suffix) {
        this.setFloat(name, this.getFloat(name) + value, suffix);
    }
});

//Computing dark (named) colors for palette and random color generation
if ('colours' in window) {
    var $shit = $$('#shit');
    $shit.remove();
    var $busy = $$('#busy');
    $busy.remove();
    var $designer = $$('.workspace').detach(true, true);
    var darkColors = pair(colours).filter(function (color) {
        return rgb2hsl(color[1])[2] < 80;
    }).toObject();
}

function click(selector, context) {
    var $element = $$(selector, context);
    if ($element)
        $element.click();
    return $element;
}

function submenu(menu, _submenu) {
    function hideOnFocusLost() {
        off('article', hideOnFocusLost);
        _submenu.classList.remove('Visible');
    }

    return function(e) {
        if ('mouseover' == e.type && !click('.Visible', menu))
            return;
        if (_submenu.classList.contains('Visible'))
            hideOnFocusLost();
        else {
            _submenu.classList.add('Visible');
            on('article', hideOnFocusLost);
        }
    };
}

function $svg(info) {
    var doc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (info)
        doc.appendChild(info);
    return doc;
}

function $icon(id) {
    var use = document.createElementNS(svgns, 'use');
    use.setAttributeNS(xlinkns, 'href', 'bag.svg#' + id);
    var icon = $svg(use);
    icon.setAttribute('width', '16');
    icon.setAttribute('height', '16');
    return icon;
}

function $menu($container, items) {
    var hasContainer = !!items;
    if (hasContainer) {
        if ('string' == typeof $container)
            $container = $$($container);
        $container.detach();
    }
    else {
        items = $container;
        $container = $new({class:'menu'});
    }
    for(var name in items) {
        var info = {$:[!hasContainer ? $icon(name) : null, name]};
        var item = items[name];
        if (item) {
            if (item instanceof Function)
                info.onclick = item;
            else if ('string' == typeof item)
                info.onclick = function() {
                    Dialog.open(this.textContent)
                };
            else {
                var $submenu = $menu(item);
                info.onclick = info.onmouseover = submenu($container, $submenu);
                info.$.push($submenu);
            }
        }
        else
            info.class = 'disable';
        $container.appendChild($new(info));
    }
    if (hasContainer)
        $container.attach();
    return $container;
}

var menus = {
        File: {
            New: function() {
                designer.reset();
            },
            Open: 'Open',
            Save: function() {
                if (designer.getConfig('uid'))
                    designer.save();
                else
                    menus.File['Save As']();
            },
            'Save As': function() {
                designer.project.id = prompt('Enter the project name', designer.project.id);
                designer.removeConfig('uid');
                designer.save();
            }
        },
        Insert: {
            Rect: function() {
                designer.createShape('rect', true, true);
            },
            Polyline: function() {
                designer.createShape('polyline', true, true);
            },
            Text: function() {
                designer.createShape('text', true, true);
            },
            Markup: function() {
                designer.createShape('foreignObject', true, true);
            },
            Image: function() {
                designer.createShape('image', true, true);
            }
        },
        View: {
            Grid: Function(),
            Layers: 'Layers',
            Shapes: 'Shapes'
        },
        Help: {
            About: 'About'
        }
    };

if ($$('nav'))
    $menu('nav', menus);
