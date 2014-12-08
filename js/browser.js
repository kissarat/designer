"use strict";

var Opera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var Firefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var Safari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
// At least Safari 3+: "[object HTMLElementConstructor]"
var Chrome = !!window.chrome && !Opera;              // Chrome 1+
var IE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

var features = {};

var storage = window.localStorage || Object.create(null);
features.localStorage = !!localStorage;
if (!features.localStorage)
    console.error('LocalStorage not found');

features.flash = !!navigator.mimeTypes ['application/x-shockwave-flash'];
if (features.flash) {/*
    var extension = document.createElement('embed');
    extension.setAttribute('src', '/assets/Extension.swf');
    extension.setAttribute('width', '1');
    extension.setAttribute('height', '1');
    extension.onerror = l;
    document.body.appendChild(extension);
    features.extension = extension;
*/}

function setFlashInfo(info) {
    features.flash = info;
    document.body.removeChild(features.extension);
    delete features.extension;
}

if (Firefox) {
    Object.defineProperties(MouseEvent.prototype, {
        offsetX: {get: function() {return this.clientX - this.box.left}},
        offsetY: {get: function() {return this.clientY - this.box.top}},
        movementX: {get: function() {return this.mozMovementX}},
        movementY: {get: function() {return this.mozMovementY}}
    });
}

if (!('requestFullScreen' in Element.prototype)) {
    var p = Element.prototype;
    p.requestFullScreen = p.webkitRequestFullScreen
        || p.mozRequestFullScreen || p.msRequestFullScreen;
}

features.designMode = 'designMode' in document && 'execCommand' in document;
if (!features.designMode)
    console.error('document.designMode does not support, rich text editing is impossible');

function TokenList(element) {
    this.$ = element;
}

TokenList.prototype = {
    add: function (token) {
        if (!this.contains(token))
            this.value += ' ' + token;
    },

    contains: function (token) {
        return this.value.indexOf(token) >= 0;
    },

    remove: function (token) {
        this.value = this.value.replace(token, '').replace(/\s+/, ' ');
    },

    get array() {
        return this.value.split(' ');
    },

    set array(value) {
        return this.value = value.join(' ');
    },

    get value() {
        return this.$.className.baseVal;
    },

    set value(value) {
        this.$.className.baseVal = value;
    }
};

if (!('classList' in SVGElement.prototype)) {
    define(SVGElement, 'classList', {
        get: function() {
            if (!this._classList)
                this._classList = new TokenList(this);
            return this._classList;
        }
    });
}

function RelativeMouseEvent(element, event) {
    var box = element.getBoundingClientRect();
    this.clientX = event.clientX - box.left;
    this.clientY = event.clientY - box.top;
}