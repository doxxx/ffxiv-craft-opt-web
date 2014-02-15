var yagal_creator = (function() {
  function Creator() {
  }

  Creator.prototype.create = function(name, base, attrs) {
    var ctor = function() {
      var obj = base.apply(this, arguments);

      obj = typeof obj === 'object' ? obj : this;

      if (attrs !== undefined) {
        for (var attr in attrs) {
          var x = attrs[attr];
          if (typeof x === 'function') {
            /* jshint -W055 */
            x = new x();
          }
          obj[attr] = x;
        }
      }

      return obj;
    };

    ctor.prototype = Object.create(base.prototype);
    ctor.prototype.constructor = ctor;

    this[name] = ctor;
  };

  return {
    Creator: Creator
  };
}());
