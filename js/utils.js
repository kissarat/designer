/**
 * Utilites library, like common.js
 */

"use strict";

var svgns = "http://www.w3.org/2000/svg";
var xlinkns = "http://www.w3.org/1999/xlink";

/**
 * Register event listener, jQuery.on analog
 * @param target Element or selector to register
 * @param {string} [name=click]   name of the event
 * @param {function} call event callback
 */
function on(target, name, call) {
    if (!call) {
        call = name;
        name = 'click';
    }
    if ('string' == typeof target) {
        target = document.querySelectorAll(target);
        for (var i = 0; i < target.length; i++)
            target[i].addEventListener(name, call);
    }
    else
        target.addEventListener(name, call);
}

/**
 * Register many event listeners
 * @param {Element|string} target Element or selector to register
 * @param {object} events named events callbacks
 * @see on
 */
function register(target, events) {
    for (var name in events)
        on(target, name, events[name]);
}

function off(target, name, call) {
    if ('string' == typeof target)
        target = $$(target);
    if (!call) {
        call = name;
        name = 'click';
    }
    target.removeEventListener(name, call);
}

/**
 * Removes excess whitespace nodes
 * @param {Element} element
 */
function normilize(element) {
    element.innerHTML = element.innerHTML.replace(/>[\s]*</mg, '><').trim();
}

/**
 * Helper console log function used to investigation goals
 */
function l() {
    console.log.apply(console, arguments);
}

/**
 * Any container iteration, jQuery.each analog
 * @param {Array|Element|NodeList|HTMLCollection} array - any iterable or Element
 * @param {Object} [type] - type of item
 * @param {function} call - callback(item)
 */
function each(array, type, call) {  
    if ('string' == typeof array) {
        array = document.querySelectorAll(array);
        if (!call) {
            call = type;
            type = Element;
        }
    }
    else if (array instanceof Element)
        array = array.childNodes;
    if (call) {
        Array.prototype.forEach.call(array, function (o) {
            if (o instanceof type)
                call(o);
        });
    }
    else
        Array.prototype.forEach.call(array, type);
}

/**
 * Iterator for creating dictionaries
 * @param array iterable or Element
 * @param {Object} [type]  optional type of item
 * @param call  callback(item)
 * @callback call
 * @returns {Object} created object (dictionary)
 */
function every(array, type, call) {
    var result = {};
    if (call)
        call = call.bind(result);
    else
        type = type.bind(result);
    each(array, type, call);
    return result;
}

function forEach(obj, call) {
    for(var key in obj)
        call(obj[key], key);
}

function reverse(obj) {
    var keys = Object.keys(obj);
    if (keys.length <= 1)
        return obj;
    var result = {};
    for(var i=keys.length - 1; i >=0; i--)
        result[keys[i]] = obj[keys[i]];
    return result;
}

function concat(a1, a2, a3) {
    Array.prototype.concat.call(a1, a2, a3);
}

function map(array, call) {
    Array.prototype.map.call(array, call);
}

function filter(array, call) {
    Array.prototype.filter.call(array, call);
}

/**
 * Split object (dictionary) to array with [key, value] elements
 * @param {Object} object  object (dictionary)
 * @returns {Array} array of [key, value]
 */
function pair(object) {
    var result = [];
    for (var key in object)
        result.push([key, object[key]])
    return result;
}

/**
 * Sorts any iterable
 * @param array iterable
 * @param call
 * @returns {Array}
 */
function sort(array, call) {
    array = Array.prototype.slice.call(array);
    array.sort(call);
    return array;
}

/**
 * Detects index of element for any container
 * @param {NodeList|Element} element
 * @param {Element} [parent=element.parentNode]
 * @returns {number}
 */
function indexOf(element, parent) {
    if (!parent)
        parent = element.parentNode;
    if (parent instanceof Element)
        parent = parent.childNodes;
    return Array.prototype.indexOf.call(parent, element);
}

/**
 * Finds key for value in object
 * @param {Object} target
 * @param {*} object
 * @returns {string}
 */
function find(target, value) {
    for (var key in target)
        if (value === target[key])
            return key;
}

/**
 * OOP inheritance helper
 * @param {Object} child
 * @param {Object} parent
 * @param {Object} [proto]
 * @param {Object} [descriptor] - the same as second parameter Object.defineProperties
 * @see Object.defineProperties
 */
function inherit(child, parent, proto, descriptor) {
    if (!child)
        child = function() {
            parent.apply(this, arguments);
        };
    if (!descriptor)
        descriptor = {};
    if ('flags' in descriptor) {
        descriptor.flags.forEach(function(flag) {
            descriptor['is' + flag] = {
                get: function() {
                    return this.$.classList.contains(flag);
                },
                set: function(value) {
                    this.$.classList[value ? 'add' : 'remove'](flag);
                    this.fire(flag, [value, this]);
                }
            }
        });
        delete descriptor.flags;
    }
    descriptor.base = {
        value: parent,
        enumerable: false,
        writable: false
    };
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
    var names = proto ? Object.getOwnPropertyNames(proto) : [];
    for (var i in names) {
        var name = names[i];
        descriptor[name] = Object.getOwnPropertyDescriptor(proto, name);
    }
    Object.defineProperties(child.prototype, descriptor);
    child.descriptor = descriptor;
    return child;
}

/**
 * Merges arguments to single object
 * @param args - array of objects
 * @returns {Object}
 */
function merge(args) {
    if (!(args instanceof Array))
        args = arguments;
    var result = {};
    for (var i = 0; i < args.length; i++) {
        var obj = args[i];
        if (obj)
            for (var name in obj) {
                result[name] = obj[name];
            }
    }
    return result;
}

/**
 * Setting default values to properties if it is not set in target
 * @param {Object} target
 * @param {Object} defaults
 * @param {Object} [except] - properties that must be excluded from result
 * @returns {Object}
 */
function mergeDefaults(target, defaults, except) {
    if (!target)
        target = {};
    if (defaults)
        for (var name in defaults) {
            if (!(name in target))
                target[name] = defaults[name]
        }
    if (except)
        for (var i = 0; i < except.length; i++)
            delete target[except[i]];
    return target;
}

function construct(it, args, defaults) {
    if (!defaults)
        defaults = it.constructor.defaults;
    if (1 == args.length)
        it.extend(args[0]);
    else if (args.length > 1) {
        var keys = Object.keys(defaults);
        if (args.length > keys.length)
            throw 'Too many arguments';
        for (var i = 0; i < keys.length; i++) {
            if (i < args.length)
                it[keys[i]] = args[i];
            else
                it[keys[i]] = defaults[keys[i]];
        }
    }
    else
        throw 'Zero arguments';
}

/**
 * Extends existing objects, duplicate declaration is in common.js
 * @param {Object} target - object to extend, prototype is extends if avaible
 * @param {Object} extension - extension properties
 */
function ext(target, extension) {
    if (target.prototype)
        target = target.prototype;
    for (var key in extension)
        if (!(key in target))
            Object.defineProperty(target, key, {
                value: extension[key],
                enumerable: false
            });
}

/**
 * Creates and initilize object
 * @param {Object} parent
 * @returns {Object}
 */
function instantiate(parent) {
    var child = {};
    if (parent)
        for(var key in parent)
            child[key] = parent[key];
    return child;
}

ext(Object, {
   map: function(call) {
       var result = [];
       if (this.length)
           for (var i = 0; i < this.length; i++)
               result.push(call(this[i]));
       else
           for (var key in this)
               result.push(call(this[key]));
       return result;
   }
});

ext(Array, {
    /**
     * Creates array of items first elements
     * @returns {Array}
     */
    first: function () {
        return this.map(function (item) {
            return item[0];
        })
    },

    /**
     * Creates indexed array
     * @returns {Array} [[0,item1], [1,item2], ... [N,itemN]]
     */
    index: function () {
        return this.map(function (item, i) {
            return [i, item[0]];
        })
    },

    /**
     * Sorts array by index
     * @param {Array} indexes [[0,item1], [1,item2], ... [N,itemN]]
     * @returns {Array}
     */
    order: function (indexes) {
        if (this.length != indexes.length)
            throw "Array length is not equals to indexes length";
        var result = new Array(this.length);
        for (var i = 0; i < this.length; i++)
            result[indexes[i]] = this[i];
        //result[i] = this[indexes[i]];
        return result;
    },

    sortIndexed: function (call) {
        return this.sort(function (a, b) {
            return call(a[1], b[1], a[0]);
        });
    },

    /**
     * Creates object from [key, value] array
     * @returns {Object}
     */
    toObject: function () {
        var object = {};
        this.forEach(function (item) {
            object[item[0]] = item[1];
        });
        return object;
    }
});

/**
 * Gets first element of object
 * @param {Object} object
 * @returns {*}
 */
function first(object) {
    for (var key in object)
        return object[key];
}

/**
 * Repeats n times of call
 * @param n
 * @param call
 * @returns {Array}
 */
function repeat(n, call) {
    var result = [];
    for (var i = 0; i < n; i++)
        result.push(call());
    return result;
}

function mul(n) {
    return function (a) {
        return a * n;
    }
}

/**
 * Generates array of random integers
 * @param {int} [max] - maximum value of integer
 * @param {int} length - length of array and maximum value if max is not set
 * @returns {Array}
 */
function randIntArray(max, length) {
    if (!length)
        length = max;
    return repeat(length, Math.random).map(mul(max)).map(Math.floor);
}

/**
 * Comparing properties of object
 * @param a
 * @param b
 * @returns {boolean}
 */
function equals(a, b) {
    for (var i in a)
        if (a[i] != b[i])
            return false;
    return true;
}

/**
 * checks if object is empty
 * @param object
 * @returns {boolean}
 */
function empty(object) {
    return !!first(object);
}

/**
 * Counts number of properties in object
 * @param object
 * @returns {Number}
 */
function count(object) {
    return Object.keys(object).length;
}

/**
 * Breaks array to pieces of fixed size
 * @param array
 * @param size - size of piece
 * @returns {Array}
 */
function cut(array, size) {
    size++;
    var result = [];
    var piece = [];
    for (var i = 1; i < array.length; i++) {
        if (i % size)
            piece.push(array[i]);
        else {
            result.push(piece);
            piece = [];
        }
    }
    return result;
}

/**
 * Swaps items [a, b] to [b, a] of array
 * @param {Array} list
 */
function swap(list) {
    for (var i = 0; i < list.length; i++) {
        var temp = list[i][0];
        list[i][0] = list[i][1];
        list[i][1] = temp;
    }
}


function tellme(me) {
    return me;
}

function define(object, name, options) {
    Object.defineProperty(object.prototype, name, options);
}

/**
 * Generates random number from [min, max] interval
 * @param min
 * @param max
 * @returns {number}
 */
function rand(min, max) {
    return Math.round(min + Math.random()*(max - min));
}

/**
 * Gets function that return random key of dictionary
 * @param {Object} dict
 * @returns {Function}
 */
function randDict(dict) {
    var keys = Object.keys(dict);
    return function () {
        return keys[Math.floor(Math.random() * keys.length)];
    }
}

/**
 * Translates RGB color scheme to HSL
 * @param {string} c - color in RGB, for example 'AABBBCC'
 * @returns {Array} - [hue, saturation, lightness]
 */
function rgb2hsl(c) {
    var r = parseInt(c.slice(0, 2), 16) / 255,
        g = parseInt(c.slice(2, 4), 16) / 255,
        b = parseInt(c.slice(4, 6), 16) / 255,
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        l = (max + min) / 2;
    var h, s;

    if (max == min)
        h = s = 0; // achromatic
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

/**
 * Translates color format (decimal) "rgb(aaa, bbb, ccc)" to (hex) "AABBCC"
 * @param color
 * @returns {string}
 */
function rgb2hex(color) {
    color = /(\d+), (\d+), (\d+)/.exec(color);
    return(parseInt(color[1]) * 0xFFFF +
        +parseInt(color[2]) * 0xFF + +parseInt(color[3])).toString(16);
}

/**
 * Sorts color by saturation
 * @param list
 * @returns {Array}
 */
function sortColors(list) {
    var indexes = list
        .first()
        .map(rgb2hsl)
        .index()
        .sort(function (a, b) {
            return a[1][0] - b[1][0];
        })
//        .sortIndexed(function(a, b) {
//            var d = a[2] - b[2];
//            return d > 30 ? d : 0;
//        })
        .first();
    return list.order(indexes);
}

/**
 * Helper function for event investigation
 * @param element
 * @param {Array|string} events - array or category of events
 * @param {boolean} prevent - preventDefault
 */
function spy(element, events, prevent) {
    switch (events) {
        case 'mouse':
            events = ["mousedown", "mouseenter",
                "mouseleave", "mousemove", "mouseout", "mouseover",
                "mouseup", "mousewheel"];
            break;
        case 'drag':
            events = ["drag", "dragdrop", "dragend",
                "dragenter", "dragexit", "draggesture",
                "dragleave", "dragover", "dragstart", "drop"];
            break;
        case 'focus':
            events = ["blur", "change", "DOMFocusIn",
                "DOMFocusOut", "focus", "focusin", "focusout"];
            break;
        case 'text':
            events = ["compositionend", "compositionstart",
                "compositionupdate", "copy", "cut", "paste",
                "select", "text"];
            break;
    }
    var event;
    while (event = events.pop())
        try {
            on(element, event, function (e) {
                l(e.type, e);
                if (prevent)
                    e.preventDefault();
            });
        }
        catch (e) {
            console.error(e);
        }
}

function join(array) {
    return Array.prototype.join.call(array, ' ');
}

/**
 * Translate text user language
 * @param {string} text
 * @returns {string}
 */
function t(text) {
    var translation = uk[text];
    return translation || text;
}

/**
 * Loads the script
 * @param {url} src
 * @param {function} call
 * @returns {HTMLScriptElement}
 */
function loadScript(src, call) {
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.onload = call;
    document.body.appendChild(script);
    return script;
}
