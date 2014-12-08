register(window, {
    keydown: function(e) {
        if (e.keyCode <= 20)
            return;
        var keyCode = (e.ctrlKey && CTRL) | (e.altKey && ALT) | (e.shiftKey && SHIFT);
        act('key', keyCode | e.keyCode);
    },

    unload: function() {
        actions.fire('visual');
    }
});

register(document, {
    DOMContentLoaded: function () {
        populateFontList()
    }
});

function act(action, propertyValue) {
    if ('object' == typeof propertyValue)
        propertyValue = null;
    if ('string' == typeof action) {
        if (propertyValue) {
            var property = action;
            action = null;
            for (var key in actions) {
                if (actions[key][property] == propertyValue)
                    action = actions[key];
            }
        }
        else
            action = actions[action];
    }
    if (action && action.onclick)
        return action.onclick();
    else if (!propertyValue)
        return document.execCommand(action, true);
}

on('[data-target]', 'change', function(e) {
    if (selection)
        document.execCommand(e.target.dataset.command || e.target.id, true, e.target.value);
    else
        $$(e.target.getAttribute['data-target']).style[e.target.id] =
            e.target.value + (e.target.getAttribute('data-suffix') || '');
});

each('.commands > *', function(command) {
    if (command instanceof HTMLButtonElement)
        on(command, act.bind(actions, command.id));
    command.setAttribute('title', t(command.id));
});

var selection;

on('#visual', 'mouseup', function(e) {
    selection = getSelection();
    if(selection.anchorNode == selection.focusNode) {
        var node = selection.anchorNode;
        if (Node.ELEMENT_NODE != node.nodeType)
            node = node.parentNode;
        var style = getComputedStyle(node);
        var fontFamily = /('([\w ]+)'|(\w+))/.exec(style.fontFamily);
        if (fontFamily) {
            fontFamily = fontFamily[2] || fontFamily[3];
            fontSelect.value = fontFamily;
            if (!fontSelect.value)
                addFont(fontFamily);
        }
        $$('#fontSize').value = parseInt(style.fontSize);
        $$('#foreColor').value = '#' + rgb2hex(style.color);
        $$('#backColor').value = '#' + rgb2hex(style.backgroundColor);
    }
    //if (selection.anchorOffset == selection.focusOffset)
    //    selection = null;
});

var fontSelect = $$('#fontFamily');

function addFont(font) {
    var option = document.createElement('option');
    option.innerHTML = font;
    option.value = font;
    fontSelect.appendChild(option);
}

function populateFontList(allFonts) {
    if (allFonts)
        features.fonts = allFonts;
    fontSelect.detach();
    fontSelect.innerHTML = '';
    for (var i = 0; i < fonts.length; i++)
        addFont(fonts[i]);
    fontSelect.attach();
}

// Microsoft Office key bindings
var actions = {
    bold:           {key: CTRL | KeyCode.B},
    italic:         {key: CTRL | KeyCode.I},
    underline:      {key: CTRL | KeyCode.U},
    justifyCenter:  {key: CTRL | KeyCode.E},
    justifyFull:    {key: CTRL | KeyCode.J},
    justifyRight:   {key: CTRL | KeyCode.R},
    justifyLeft:    {key: CTRL | KeyCode.L},
//    : {key: CTRL | KeyCode.},
//    : {key: CTRL | KeyCode.},
//    : {key: CTRL | KeyCode.},
//    : {key: CTRL | KeyCode.},
//    : {key: CTRL | KeyCode.},
//    : {key: CTRL | KeyCode.},
//    : {key: CTRL | KeyCode.},
    createLink: {
        key: CTRL | KeyCode.K,
        onclick: function() {
        var link = prompt('Важіть адресу посилання');
        if (link)
            document.execCommand('createLink', true, link);
    }},

    visual: {
        onclick: function() {
            if (editor) {
                var code = $$('.CodeMirror');
                $$('#visual').innerHTML = editor.getValue();
            }
        },

        onload: function() {
            //$$('#visual').innerHTML = ritex.getConfig('draft');
        }
    }
};

ext(actions, {
    on: function(name, call) {
        var action = this[name];
        if (!action)
            this[name] = action = {};
        if (!action.listeners)
            action.listeners = [];
        action.listeners.push(call);
    },

    fire: function(name) {
        if (this[name] && this[name].listeners) {
            var listeners = this[name].listeners;
            for (var i = 0; i < listeners.length; i++)
                listeners[i]();
        }
    }
});