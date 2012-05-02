var mu = require('mu2'),
    fs = require('fs'),
    presenter = require('./presenter.js'),
    extend = require('./utils.js').extend,
    version = require('./version.js')
    counter = 0

mu.root = __dirname + '/templates'

var defaults = {
  release: '?.?.?',
  name: '?',
  styles: [__dirname, 'stylesheets', 'light.css'].join('/')
}

function outUndefined (elem) {
  return !!elem
}

var Template = function (options) {
  this.settings = extend(defaults, options || {})
}

Template.version = version

Template.prototype.styles = function () {
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
    library_name: this.settings.name,
    styles: this.styles()
  })

}

module.exports = Template