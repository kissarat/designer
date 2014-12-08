//var $table = $$('table');
var $heads = $$('thead');
normilize($heads);
var $column_menu = $menu({
    Add: function() {
        $heads.appendChild($new({_:'th'}))
    }
});
if (0 == $heads.childNodes.length)
    $heads.appendChild($column_menu);
