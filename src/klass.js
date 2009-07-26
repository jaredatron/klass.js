var Klass = (function() {

  function toArray(iterable) {
    if (!iterable) return [];
    if ('toArray' in Object(iterable)) return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  }

  function argumentNames(method) {
    var names = method.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  var keys = (function() {

    function _keys(object) {
      var results = [];
      for (var property in object)
        results.push(property);
      return results;
    }

    function keys(object) {
      var results = _keys(object);

      if (!_keys({ toString: true }).length) {
        if (source.toString != Object.prototype.toString)
          results.push("toString");
        if (source.valueOf != Object.prototype.valueOf)
          results.push("valueOf");
      }

      return results;
    }

    return keys;

  })();

  function capitalize(string){
    return string.charAt(0).toUpperCase() + string.substring(1);
  }

  function bind(__method, context, hide) {
    if (arguments.length < 3 && typeof arguments[1] === 'undefined') return this;
    var args = Array.prototype.slice.call(arguments, 2);
    function bondWrapper() {
      return __method.apply(context, toArray(arguments).concat(args));
    };
    if (!hide) bondWrapper.__boundTo = __method;
    return bondWrapper;
  }


  function cloneWithInheritance(source){
    var sourceKlass = function(){};
    sourceKlass.prototype = source;
    return new sourceKlass();
  };


  function applyNew(constructor, a){
    if (typeof a === 'undefined' || !('length' in a))
      throw new TypeError("first argument to applyNew must be an array");
    var args = '';
    for (var i=0; i < a.length; i++) args += ', a['+i+']';
    return eval('new constructor('+args.slice(2)+');');
  };


  var Klass = function Klass(){
    var args = toArray(arguments), klass = this, superklass;

    if (arguments[0] instanceof Klass) superklass = args.shift();

    if (superklass){
      function constructor(){};
      constructor.prototype = superklass;
      klass = new constructor;
      klass.superklass = superklass;
      superklass.subklasses.push(klass);
    }

    function KlassInstance(){
      if ('initialize' in this) return this.initialize.apply(this,arguments);
    };
    KlassInstance.prototype = cloneWithInheritance(klass.instance.prototype);
    KlassInstance.prototype.klass = klass;
    klass.instance = KlassInstance;
    klass.klassName = 'anonymous';
    klass.subklasses = [];

    // move this ability to use blocks as definitions to the extend method
    for (var i=0; i < args.length; i++) {
      var methods = args[i];
      if (typeof methods === "function"){
        if (methods.name) klass.klassName = capitalize(methods.name);
        methods = bind(methods,klass)();
      }
      klass.include(methods);
    };

    return klass;
  };



  Klass.prototype = (function() {
    function create(){
      return applyNew(this.instance,arguments);
    }

    function inspect(){
      return '<#Klass:'+this.klassName+'>';
    }

    function toString(){
      return this.inspect();
    }

    function _defineMethod(onto, how, method){
      if (!method) return onto;
      if (!method.name || method.name == '') throw new Error('methods must be named');
      var methods = {};
      methods[method.name] = method;
      onto[how](methods);
      return onto;
    }

    function defineInstanceMethod(method){
      return _defineMethod(this,'include',method);
    }

    function defineClassMethod(method){
      return _defineMethod(this,'extend',method);
    }
    
    function _removeMethod(){
      // we need a way to detect if an object paramiter is inherited or not
      // i know that delete wont affect it so maybe we store it, try and delete it
      // if it doesnt change we assume is inherited, otherwise we reset it
      
      // this could break if someone tried to freeze a paramiter by seting it to its
      // self. that would leave the values identical but prevent a change in the superclass
      // from bubbling up that point
      
      // Object.freezeCurrentValues = function freezeCurrentValues(object){
      //   for (var p in object) object[p] = object[p];
      //   return object;
      // };
    }
    
    function removeInstanceMethod(){};
    function removeClassMethod(){};
    
    function alias(to, from){
      this.instance.prototype[to] = this.instance.prototype[from];
      return this;
    }
    
    

    function _getSuper(klass_or_instance){
      if (!klass_or_instance) throw new Error('you must pass `this` to getSuper');
      var superklass, supermethod, methodName = this.__methodName;

      superklass = (klass_or_instance instanceof Klass) ? klass_or_instance.superklass : klass_or_instance.klass.superklass;
      if (superklass) supermethod = (klass_or_instance instanceof Klass) ? superklass[methodName] :
        superklass.instance.prototype[methodName];

      if (typeof supermethod !== 'function') throw new Error("super: no superclass method '"+methodName+"'");

      return supermethod; //.apply(klass_or_instance, arguments);
    }

    function _include(source, extend){
      if (typeof source == 'undefined') return this;
      var properties = keys(source);

      for (var i = 0, length = properties.length; i < length; i++) {
        var property = properties[i], value = source[property];
        if (typeof value === 'function') {

          value.__methodName || (value.__methodName = property); // casting this methods name
          value.getSuper || (value.getSuper = bind(_getSuper, value, true)); // binding getSuper to method

          if (!value.__superWraper && argumentNames(value)[0] == "$super"){
            var __method = value;
            value = function superWrapper(){
              return __method.apply(this, [__method.getSuper(this)].concat(toArray(arguments)));
            };
            value.__superWraperFor = __method;
            value.valueOf = bind(__method.valueOf, __method);
            value.toString = bind(__method.toString, __method);
            value.getSuper = __method.getSuper;
          }
        }
        if (extend)
          this[property] = value;
        else
          this.instance.prototype[property] = value;

      }
      return this;
    }

    function include(source){
      return bind(_include,this)(source, false);
    }

    function extend(source){
      return bind(_include,this)(source, true);
    }

    return {
      klass:                Klass,
      klassName:            null,
      superklass:           null,
      subklasses:           null,
      create:               create,
      inspect:              inspect,
      def:                  defineInstanceMethod,
      defineMethod:         defineInstanceMethod,
      defineInstanceMethod: defineInstanceMethod,
      def_self:             defineClassMethod,
      defineClassMethod:    defineClassMethod,
      include:              include,
      extend:               extend
    };

  })();


  Klass.prototype.instance = function KlassInstance(){};

  Klass.prototype.instance.prototype = {
    inspect: function(){
      return '<#'+this.klass.klassName+' >';
    },
    isA: function(klass){
      if (!(klass instanceof Klass)) return false;
      return (this instanceof klass.instance);
    }
  };
  
  
  return Klass;

})();
