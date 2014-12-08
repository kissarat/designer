function Property(element, defaults) {
    if (!(element instanceof Element))
        element = new $new(mergeDefaults(element, defaults));
    this.$container = $new({
        _:'div',
        $: [
            'div',
            element
        ]
    });
    var it = this;
    this.change = function(value) {
        it.$.value = value;
    };
    on(element, 'change', function(e) {
        it.value = e.target.value;
    });
    this.$ = element;
}

function setValue(it, value) {
    it.target.set(it.name, value);
}

function getValue(it) {
    return it.target.get(it.name);
}

inherit(Property, Model, {
    get name() {
        return this.$.name;
    },

    set name(name) {
        this.$.name = name;
        this.$container.childNodes[0].textContent = name;
    },

    get target() {
        return this._target;
    },

    set target(target) {
        this._target = target;
        this.$.value = this.value;
    }
}, {
    value: {
        get: function() {
            return getValue(this);
        },

        set: function(value) {
            setValue(this, value);
        }
    }
});

Property.create = function(options) {
//    if (!options)
//        options = {type: 'text'};
//    if (!options.name)
//        options.name = options.type;
    return new Property.types[options.type](options);
};

Property.types = {
    text: inherit(function Text(options) {
        Property.call(this, options, { _: 'input',
            type: 'text'
        });
    }, Property),

    number: inherit(function Number(options) {
            Property.call(this, options, { _: 'input',
                type: 'number',
                pattern: '^\\d+$'
            });
        },
        Property, {
            get value() {
                return parseInt(getValue(this))
            },
            set value(value) {
                setValue(this, value + this.suffix);
            },

            get suffix() {
                return this.$.suffix;
            }
        }
    ),

    range: inherit(function Range(options) {
            Property.call(this, options, { _: 'input',
                type: 'range',
                min: 0,
                max: 1,
                value: 1,
                step: 0.01
            });
        },
        Property
    ),

    color: inherit(function Color(options) {
            Property.call(this, options, { _: 'input',
                type: 'color'
            })
        },
        Property, {
            get value() {
                var color = getValue(this);
                if (!color)
                    return;
                if ('#' != color[0])
                    color = colours[color];
                return color;
            }
        }),

    select: inherit(function Select(name, options) {
            Property.call(this, options, {_: 'select'});
        },
        Property, {
            set list(obj) {
                this.$.detach();
                this.$.innerHTML = '';
                for(var key in obj) {
                    var option = document.createElement('option');
                    option.value = key;
                    option.innerHTML = obj[key];
                    this.$.appendChild(option);
                }
                this.$.attach();
            },

            get list() {
                return every(this.$, function(option) {
                    this[option.value] = option.innerHTML;
                });
            }
        })
};
