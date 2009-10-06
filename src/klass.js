(function() {

  var emptyFunction = function(){};

  function _extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  function cloneWithInheritance(source){
    emptyFunction.prototype = source;
    return new emptyFunction();
  };

  function inheritorOf(parent, child){
    if (typeof parent !== 'function'){
      emptyFunction.prototype = parent;
      parent = emptyFunction;
    }
    return (child instanceof parent);
  }; 
  Object.inheritorOf = inheritorOf;
  
  function instanceOf(parent, child){
    if (typeof parent == 'function') return child instanceof parent;
    if (parent == Klass && isKlassInstance(child)) return false;
    if (isKlass(parent)) return inheritorOf(parent.prototype, child);
    return inheritorOf(parent, child);
  };
  Object.instanceOf = instanceOf;

  function isKlass(object){
    return inheritorOf(Klass, object);
  }
  Object.isKlass = isKlass;

  function isKlassInstance(object){
    return (isKlass(object.klass) && inheritorOf(object.klass.prototype, object));
  }
  Object.isKlassInstance = isKlassInstance;

  function getFunctionArgumentNames(method) {
    var names = method.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  klass.object = {
    extend: function extend(object){ return _extend(this, object); },
    aliasMethod: function aliasMethod(alias_method_name, method_name){
      var _method = this[method_name];
      var alias = function(){ return _method.apply(this, arguments); };
      alias.method_name = method_name;
      this[alias_method_name] = alias;
      return this;
    }
  };
  
  window.Klass = cloneWithInheritance(klass.object);
  _extend(window.Klass, {
    klass: Klass,
    klass_name: 'Klass',
    toString: function toObject(){ return "[object "+(this.klass_name||'AnonymousKlass')+"]"; },
    valueOf: function valueOf(){ return this; },
    subklasses: [],
    include: function include(object){ _extend(this.prototype, object); return this; }
  });



  Klass.prototype = cloneWithInheritance(klass.object);
  _extend(Klass.prototype, (function() {
    function toString(){
      return this.klass.prototype === this ?
        Object.prototype.toString(this):
        "[object "+(this.klass.klass_name||'AnonymousKlass')+":instance]";
    }
    
    function valueOf(){ return this; }
     
    function extend(object){ return _extend(this, object); }

    function instanceOf(_klass){ return Object.instanceOf(_klass, this); }

    return {
      klass:      Klass,
      toString:   toString,
      valueOf:    valueOf,
      extend:     extend,
      isA:        instanceOf,
      kindOf:     instanceOf,
      instanceOf: instanceOf
    };
  })());

  function klassInstance(args){
    if ('initialize' in this) return this.initialize.apply(this,args);
  }

  function createKlassInstance(){
    klassInstance.prototype = this.prototype;
    return new klassInstance(arguments);
  }

  var VALID_KLASS_NAME = /^[A-Z]+[a-zA-Z_$]+$/;
  function findKlassNameInDefinitions(definitions){
    for (var i=0; i < definitions.length; i++) {
      var def = definitions[i];
      if (typeof def === 'function')
        var klass_name = getFunctionArgumentNames(def)[0];
      if (typeof def === 'string' && def.length)
        var klass_name = def;
      if (klass_name && klass_name.match(VALID_KLASS_NAME)) return klass_name;
    };
  }

  function createKlass(superklass){
    var defs = Array.prototype.slice.call(arguments);
    var superklass = isKlass(defs[0]) ? defs.shift() : Klass;
    var _klass = cloneWithInheritance(superklass);
    _klass.superklass = superklass;
    _klass.klass_name = findKlassNameInDefinitions(defs);
    superklass.subklasses.push(_klass);
    _klass.subklasses = [];
    _klass.prototype = cloneWithInheritance(superklass.prototype);
    _klass.prototype.klass = _klass;
    defs.unshift(_klass);
    klass.apply(window,defs);
    return _klass;
  }

  Klass.create = function create(){
    return (this === Klass) ? createKlass.apply(this, arguments) : createKlassInstance.apply(this, arguments);
  };

  $K = function $K(){
    return Klass.create.apply(Klass, arguments);
  };

  function klass(_klass){
    if (!isKlass(_klass)) throw new Error('expected instance of Klass');
    var definitions = Array.prototype.slice.apply(arguments, [1]);
    for (var i=0; i < definitions.length; i++) {
      var definition = definitions[i];
      if (typeof definition === 'function') definition = definition.apply(_klass.prototype, [_klass, _klass.prototype]) || {};
      if (typeof definition === 'object') _extend(_klass.prototype, definition);
    };
  };
  window.klass = klass;

  Function.prototype.getSuper = function getSuper(context){
    if (!context) throw new Error('you must pass `this` as the first argument to getSuper');
    var klass_context = isKlass(context) ? true :
                       isKlassInstance(context) ? false : null;
    if (klass_context === null) throw new Error('cannot call super outside of a klass context');

    var method = this, klass = klass_context ? context : context.klass;

    var method_name = method.method_name || (function() {
      for (key in context) if (context[key] === method) return key;
    })();
    if (!method_name) return false;

    var super_method = klass_context ? klass.superklass[method_name] : klass.superklass.prototype[method_name];
    if (!super_method || typeof super_method !== 'function') return false;
    return super_method;
  };

  Function.prototype.$super = function $super(context, args){
    if (!context) throw new Error('you must pass `this` as the first argument to $super');
    if (args && Object.prototype.toString.apply(args) !== "[object Array]")
      throw new TypeError('second argument to Function.prototype.$super must be an array');
    var super_method = this.getSuper(context);
    if (!super_method){
      var error = new Error("super: no superclass method");
      error.name = "NoSuperError";
      throw error;
    }
    return super_method.apply(context,args);
  };


})();