var mu = require('mu2'),
    fs = require('fs'),
    counter = 0

mu.root = __dirname + '/templates'

var defaults = {
  release: '?.?.?',
  styles: [__dirname, 'stylesheets', 'light.css'].join('/')
}

var extend = function () {
  return Array.prototype.reduce.call(arguments, function (memo, obj) {

    Object.keys(obj).forEach(function (key) { 
      if (obj[key]) memo[key] = obj[key]
    })

    return memo
  }, {})
}

function presenter (doc) {
  if (doc.ignore || doc.isPrivate) return

  var memberOf = doc.tags.filter(function (doc) {
    return doc.type === 'memberOf'
  })[0]

  var parent = function () {
    if (doc.ctx && doc.ctx.hasOwnProperty('constructor')) {
      return doc.ctx.constructor
    } else if (memberOf && memberOf.parent) {
      return memberOf.parent
    }
  }

  var relatedTag = doc.tags.filter(function (tag) {
    return tag.type
  })[0]

  if (relatedTag) {
    var related = {
      name: relatedTag.local,
      href: relatedTag.local ? relatedTag.local.split('.').pop() : ''
    }
  };

  return {
    id: [counter++, Date.now()].join('-'),
    name: doc.ctx && doc.ctx.name,
    signiture: doc.ctx && doc.ctx.string,
    type: doc.ctx && doc.ctx.type,
    ctx: doc.ctx,
    description: doc.description,
    full_description: doc.description.full.replace(/<br( \/)?>/g, ' '),
    code: doc.code,
    params: doc.tags.filter(function (tag) { return tag.type === 'param' }),
    has_params: !!doc.tags.filter(function (tag) { return tag.type === 'param' }).length,
    tags: doc.tags,
    module: doc.tags.some(function (tag) { return (tag.type === 'module' || tag.type === 'constructor') }),
    parent: parent(),
    related: related,
    has_related: !!related
  }
}

function outUndefined (elem) {
  return !!elem
}

var Template = function (options) {
  this.settings = extend(defaults, options || {})
}

Template.prototype.styles = function () {
  console.log(this.settings)
  return fs.readFileSync(this.settings.styles)
}

Template.prototype.render = function (raw) {
  var docs = raw.map(presenter).filter(outUndefined)

  var modules = docs.filter(function (doc) {
    return doc.module
  })

  modules.forEach(function (module) {
    module.methods = docs.filter(function (doc) {
      return doc.parent === module.name
    })
  })

  return mu.compileAndRender('template.mustache', {
    modules: modules,
    raw: JSON.stringify(modules),
    version: this.settings.release,
    styles: this.styles()
  })

}

module.exports = Template