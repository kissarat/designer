class Ritex
  constructor: (id)->
    @id = id

  getConfig: (name) ->
    localStorage[@id + '.' + name]
  setConfig: (name, value)->
    localStorage[@id + '.' + name] = value

ritex = new Ritex 'html'
editor = null

actions.code =
  onclick: ()->
    lines = []
    strings = []
    root = $$('#visual')
    if root.firstElementChild == root.lastElementChild
      root = root.firstElementChild
    #          root.innerHTML = root.innerHTML.replace />\s+</g, '><'
    fragment_indent lines, root.childNodes
    for line in lines
      strings.push line[1] #"\t\t\t\t\t\t\t\t\t\t\t\t\t".slice(-line[0]) + line[1]
    value = strings.join('')
    editor = new CodeMirror $$('#code'),
      value: value
      lineNumbers: true
      mode: 'text/html'
      theme: 'cobalt'
      lineWrapping: true
      extraKeys:
        "Ctrl-Space": "autocomplete",
      autoCloseBrackets: true,
      styleActiveLine: true,
      matchBrackets: true
    wrapper = editor.getWrapperElement()
    wrapper.classList.add 'content'
    wrapper.classList.add 'active'

  onload: ()->
    code_style = $$('#code_style')
    code_style.detach()
    for style in code_styles
      option = document.createElement 'option'
      option.setAttribute 'value', style
      option.innerHTML = style.replace /\-/g, ' '
      code_style.appendChild option
    code_style.value = 'cobalt'
    code_style.attach()
    @on code_style, 'change', (e) ->
      link = $$ '#code-style-link'
      window.on link, 'load', () -> editor.setOption 'theme', e.target.value
      link.setAttribute 'href', "../codemirror/theme/#{e.target.value}.css"
    actions.visual.onload()
    actions.code.onclick()

  onunload: ()->
    actions.visual.onclick()
    actions.visual.onunload()

@on '.tabs [data-id]', () ->
  id = @getAttribute 'data-id'
  each '.toolbar', (tb) -> tb.classList.remove 'active'
  $$(".toolbar[data-id=\"#{id}\"]").classList.add 'active'
  each '.content', (tb) -> tb.classList.remove 'active'
  content = $$('#' + id)
  content.classList.add 'active'
  actions[id].onclick()

register window,
  load: ->
    tab = ritex.getConfig('mode') or 'visual'
    actions[tab].onload()

  unload: ->
    actions[$$('.active.content').getAttribute('id')].onunload()

  message: (e)->
    if 'describe' == e.data
      desc = {};
      for key, value of ritex.constructor.prototype
        desc[key] = typeof value
      e.target.postMessage desc, '*'
      desc =
        id: @id,
        members: desc


fragment_indent = (lines, fragment, depth) ->
  for i, child of fragment
    if Node.ELEMENT_NODE == child.nodeType
      element_indent lines, child, depth
    else if Node.TEXT_NODE == child.nodeType
      value = child.textContent
      value = value.replace /[<>"]/g, (s) -> chars_subs[s]
      if i >= 1
        lines[lines.length - 1][1] += value
      else
        lines.push [depth, value]


element_indent = (lines, parent, depth=0) ->
  tagName = parent.nodeName.toLowerCase()
  if tagName in deny_tags
    return
  tagBuilder = ['<' + tagName]
  for attr in parent.attributes
    if attr.nodeName in deny_attrs
      continue
    if tagName in ['a', 'sup'] and 'style' == attr.nodeName
      continue
    value = attr.value
    value = switch attr.nodeName
      when 'style' then filter_style(value)
      else value
    tagBuilder.push attr.nodeName + "=\"#{value}\""
  tag_start = tagBuilder.join(' ') + '>'
  tag_end = '</' + tagName + '>'
  if short_tags.indexOf(tagName) >= 0 and 1 == parent.childNodes.length \
    and Node.TEXT_NODE == parent.childNodes[0].nodeType
      lines.push [depth, tag_start + parent.textContent + tag_end]
  else
    lines.push [depth, tag_start]
    fragment_indent lines, parent.childNodes, depth + 1
    lines.push [depth, tag_end]
  return


filter_style = (string) ->
  style = []
  string = string.split ';'
  for p in string
    p = p.split ':'
    continue if not p[1]
    p[0] = p[0].trim()
    p[1] = p[1].trim()
    units = if p[1] in ['margin', 'padding'] then p[1].split(' ') else [p[1]]
    for i, unit of units
      number = /(\d+\.?\d*)([a-z]+)/.exec unit
      if number
        if '0' == number[0]
          unit = number[0]
        else
          float = parseFloat(number[1])
          float = Math.round(float * 10)/10
          units[i] = float + number[2]
    style.push p[0] + ': ' + units.join ' '
  return style.join '; '
