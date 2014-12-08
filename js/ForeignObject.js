function ForeignObject(element) {
    Rect.call(this, mergeDefaults(element, {
        type:'foreignObject',
        width: 200, height: 100,
        'stroke-width': 2,
        $: '<body xmlns="http://www.w3.org/1999/xhtml">' +
        '<b>Блок</b> із <i title="HyperText Markup Language">HTML</i> розміткою.' +
        '<p>Тут ви можете ввести будь-який HTML контент</p></body>'
    }));
    this.$.style.border = '3px double rgba(177, 180, 180, 0.80)';
}

inherit(ForeignObject, Rect, {
    dblclick: function() {
        var it = this;
        if (features.designMode) {
            var ritex = open('ritex/index.html', 'ritex', "width=480,height=640");
            register(ritex, {
                load: function() {
                    this.document.title = it.id;
                    this.document.querySelector('#visual').innerHTML = it.$.innerHTML;
                },

                unload: function() {
                    it.$.innerHTML = this.document.querySelector('#visual').innerHTML;
                }
            });
        }
        else
            designer.dialog(this.$.innerHTML, function(result) {
                if ('ok' == result) {
                    it.$.innerHTML = this.value;
                }
            });
    }
});

Model.add(ForeignObject, 'foreignObject');
