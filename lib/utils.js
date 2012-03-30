var extend = function () {
  return Array.prototype.reduce.call(arguments, function (memo, obj) {

    Object.keys(obj).forEach(function (key) { 
      if (obj[key]) memo[key] = obj[key]
    })

    return memo
  }, {})
}

module.exports = {
  extend: extend
}