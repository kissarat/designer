function Picture(element) {
    Rect.call(this, mergeDefaults(element, {
            type: 'image',
            href: '',
            width: 200,
            height: 200,
            onload: this.load.bind(this),
            onerror: this.error.bind(this)
        })
    );
}

inherit(Picture, Rect, {
    load: function(e) {
        //designer.layer.add(this, true);
    },

    error: function(e) {
        var message = 'От халепа! Не вдалось ';
        if ('h' != this.href[0])
            console.error(message + 'вставити малюнок ' + this.href);
        else
            console.error(message + 'завантажити малюнок за посиланням ' + e.target.src);
    },

    get href() {
        return this.$.getAttribute('xlink:href');
    },

    set href(value) {
        this.$.setAttribute('xlink:href', value);
    },

    properties: {
        href: 'text'
    },

    toJSON: function() {
        var json = Rect.prototype.toJSON.call(this);
        json.href = json['xlink:href'];
        delete json['xlink:href'];
        return json;
    }
});

Model.add(Picture, 'image');
