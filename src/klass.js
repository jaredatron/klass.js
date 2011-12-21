!function(global, undefined) {

  /*
   * Klass(function(){})
   * Klass(Superklass, function(){})
   * Klass('Name', Superklass, function(){})
   * Klass('Name', function(){})
   */
  function Klass(name, superklass, extension) {
    var klass, constructor, classname;

    if (typeof name !== 'string')
      extension = superklass, superklass = name, name = undefined

    if (typeof superklass !== 'undefined' && typeof superklass.superklass === 'undefined')
      extension = superklass, superklass = undefined

    superklass || (superklass = Klass.prototype)


    classname = name ? name.match(/\.?([^\.]*)$/)[1] : 'AnonymousKlass'
    constructor = eval('(function '+classname+'(){})');

    constructor.prototype = superklass;
    klass = new constructor;
    klass.superklass = superklass;

    constructor.prototype = klass.prototype
    klass.prototype = new constructor;
    klass.prototype.__super__ = superklass.prototype;
    klass.prototype.klass = klass;

    if (name){
      klass.name = name;
      eval(name+" = klass");
    }
    klass.prototype.extend(extension);

    return klass;
  };

  global.Klass = Klass;

  var Module = {
    extend: function(extension) {
      if (typeof extension === 'function')
        extension = extension.apply(this);
      if (typeof extension === 'object')
        for (var p in extension) this[p] = extension[p];
      return this;
    },

    $super: function(property, args) {
      var func = this.__super__[property];
      if (typeof func !== 'function') throw "no superklass function `"+property+"`";
      this.__super__ = this.__super__.__super__
      try{
        return func.apply(this, args);
      }finally{
        delete this.__super__;
      }
    }
  }

  Klass.prototype = Object.create(Module);
  Klass.prototype.constructor = Klass;
  Klass.prototype.prototype = Object.create(Module);

  Klass.prototype.extend({
    KLASS_PROTOTYPE: true,
    toString: function() { return this.name; },
    create: function() {
      var instance = Object.create(this.prototype);
      if (typeof instance.initialize === 'function')
        instance.initialize.apply(instance, arguments);
      return instance;
    }
  });

  Klass.prototype.prototype.extend({
    KLASS_PROTOTYPE_PROTOTYPE: true
  });

}(this);



