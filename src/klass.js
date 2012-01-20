!function(global, undefined) {

  /*
   * Klass(function(){})
   * Klass(Superklass, function(){})
   * Klass('Name', Superklass, function(){})
   * Klass('Name', function(){})
   */
  function Klass(name, superklass, extension) {
    var klass, constructor, classname, parents, parent = this;

    if (typeof name !== 'string')
      extension = superklass, superklass = name, name = undefined;

    if (typeof superklass !== 'undefined' && typeof superklass.superklass === 'undefined')
      extension = superklass, superklass = undefined;

    try{ klass = eval('this.'+name); }catch(e){};
    if (typeof klass !== 'undefined'){
      // TODO check for superclass mismatch;
    }else{
      superklass || (superklass = Klass.prototype);

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
        parents = name.split('.');
        name = parents.pop();
        while(parents.length > 0){
          parent = parent[parents[0]];
          if (typeof parent === 'undefined') throw new TypeError(parents[0]+' is not defined');
          parents.shift();
        }
        parent[name] = klass;
      }
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
      if (Object.prototype.toString.call(args) !== "[object Arguments]")
        args = Array.prototype.slice.call(arguments, 1);
      this.__super__ = this.__super__.__super__;
      try{
        return func.apply(this, args);
      }finally{
        delete this.__super__;
      }
    },

    keys: function() {
      return Object.keys(this);
    },

    attr: function() {
      var self = this;
      Array.prototype.forEach.call(arguments, function(attribute) {
        self[attribute] = function(value){
          return (arguments.length === 0) ? this['_'+attribute] : this['_'+attribute] = value;
        }
      });
    }
  }

  Klass.prototype = Object.create(Module);
  Klass.prototype.constructor = Klass;
  Klass.prototype.prototype = Object.create(Module);

  Klass.prototype.extend({
    toString: function() { return this.name; },
    create: function() {
      var instance = Object.create(this.prototype);
      if (typeof instance.initialize === 'function')
        instance.initialize.apply(instance, arguments);
      return instance;
    }
  });

}(this);
