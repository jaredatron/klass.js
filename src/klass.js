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

  function getFunctionName(method){
    var name = method.name;
    if (!name) method.name = name = method.toString().match(/^[\s\(]*function\s*([^(]*)\(/)[1];
    return name;
  };

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
        if (results.toString != Object.prototype.toString)
          results.push("toString");
        if (results.valueOf != Object.prototype.valueOf)
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
    function bindWrapper() {
      return __method.apply(context, toArray(arguments).concat(args));
    };
    if (!hide){
      bindWrapper.__context = this;
      bindWrapper.__method = __method;
    }
    return bindWrapper;
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

    // TODO move this ability to use blocks as definitions to the extend method
    for (var i=0; i < args.length; i++) {
      var methods = args[i];
      if (methods instanceof Array){
        klass.defineMethod.apply(klass,methods);
      }else{
        if (typeof methods === "function"){
          var klassName;
          if (klassName = getFunctionName(methods)) klass.klassName = capitalize(klassName);
          methods = bind(methods,klass)();
        }
        klass.include(methods);
      }
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
      var name = getFunctionName(method);
      if (!name || name == '') throw new Error('methods must be named');
      var methods = {};
      methods[name] = method;
      onto[how](methods);
      return onto;
    }

   /** defineInstanceMethod(method[, method])
     * - method (Function): the function to be used as the instance method
     *
    **/
    function defineInstanceMethod(method){
      for (var i = arguments.length - 1; i >= 0; i--)
        _defineMethod(this,'include',arguments[i]);
      return this;
    }

    /** defineInstanceMethod(method[, method])
      * - method (Function): the function to be used as the class method
      *
     **/
    function defineClassMethod(method){
      for (var i = arguments.length - 1; i >= 0; i--)
        _defineMethod(this,'extend',arguments[i]);
      return this;
    }

    function _removeMethod(){
      // we need a way to detect if an object paramiter is inherited or not
      // i know that delete wont affect it so maybe we store it, try and delete it
      // if it doesnt change we assume is inherited, otherwise we reset it

      // this could break if someone tried to freeze a paramiter by seting it to its
      // self. that would leave the values identical but prevent a change in the superclass
      // from bubbling up that point

      // !! we have full controll of the method applying process, we could store... hm....

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



    function _findAndCallSuperMethod(methodName, args){
      var superklass, supermethod, isKlass = (this instanceof Klass);
      if (!isKlass && !(this.klass instanceof Klass)) throw new Error('you are are fucked up');

      superklass = isKlass ? this.superklass : this.klass.superklass;
      if (superklass) supermethod = isKlass ? superklass[methodName] :
        superklass.instance.prototype[methodName];

      if (typeof supermethod !== 'function') throw new Error("super: no superclass method '"+methodName+"'");

      return supermethod.apply(this, args);
    }


    // before a method is pushed onto a class object or and instance prototype object it is wrapped by a
    // method that binds it to its property name (or method name) forever. Upon calling setups up a this
    // wrapper setupup the $super method
    function _bindToMethodName(__method, __methodName){
      var __requested_super = (argumentNames(__method)[0] == "$super");
      __wrapper = function classNameBindingWrapper(){
        var __context = this, __super = function(){
          return _findAndCallSuperMethod.apply(__context, [__methodName, arguments]);
        };
        var args = toArray(arguments);
        if (__requested_super) args.unshift(__super);
        __method.$super = __super; // enable arguments.callee.$super() syntax;
        var r = __method.apply(this, args);
        delete __method.$super;
        return r;
      };

      __wrapper.methodName = __methodName;
      __wrapper.__method = __method;

      // disabled for debugging
      __wrapper.valueOf = __method.valueOf.bind(__method);
      __wrapper.toString = __method.toString.bind(__method);
      return __wrapper;
    }

    function _include(source, extend){
      if (typeof source == 'undefined') return this;
      var properties = keys(source);

      for (var i = 0, length = properties.length; i < length; i++) {
        var property = properties[i], value = source[property];

        if (typeof value === 'function' && !value.methodName)
          value = _bindToMethodName(value, property);

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
