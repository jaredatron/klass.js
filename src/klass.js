/*  Prototype JavaScript framework, version <%= PROTOTYPE_VERSION %>
 *  (c) 2005-2009 Sam Stephenson
 *
 *  Extended by Jared Grippe jared@jaredgrippe.com
 *  http://github.com/deadlyicon/prototype
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

/**
 * == Klass ==
 *
 *   Klass.js is a more feature rich implementation of Ruby like Class inheritance in Javascript. The
 *   main advantage that Klass.js has over Prototype's Ruby like Class implementation is both Class and Instance based inheritance.
 *
 *   Klass.js supports a syntax very similar to Prototype's Class. Compare the following code to the exmaples given in the Prototype documentation:
 *   <http://api.prototypejs.org/language/class.html#addmethods-instance_method>
 *
 *  <h5>Examples:</h5>
 *
 *      var Animal = Klass.create('Animal', {
 *        initialize: function(name, sound) {
 *          this.name  = name;
 *          this.sound = sound;
 *        },
 *      
 *        speak: function() {
 *          alert(this.name + " says: " + this.sound + "!");
 *        }
 *      });
 *      
 *      // creating a class method
 *      Animal.createHuge = function(name, sound){
 *        var huge_animal = this.create(name, sound);
 *        huge_animal.huge = true;
 *        return huge_animal;
 *      };
 *      
 *      // subclassing Animal
 *      var Snake = Klass.create(Animal, {
 *        initialize: function(name) {
 *          arguments.callee.callSuper(this, name, 'hissssssssss');
 *        }
 *      });
 *      
 *      
 *      var ringneck = Snake.createHuge("Ringneck");
 *      ringneck.huge;
 *      //-> true
 *      
 *      
 *      // adding Snake.createHuge and Snake#speak (both with a supercall)
 *      Snake.extend({
 *        createHuge: function(name){
 *          var huge_snake = arguments.callee.callSuper(this, name);
 *          huge_snake.huge_snake = true;
 *          return huge_snake;
 *        },
 *        prototype: {
 *          speak: function() {
 *            arguments.callee.callSuper(this);
 *            alert("You should probably run. He looks really mad.");
 *          }
 *        }
 *      });
 *      
 *      var rattler = Snake.createHuge("Rattler");
 *      rattler.huge;
 *      //-> true
 *      rattler.huge_snake;
 *      //-> true
 *      rattler.speak();
 *      //-> alerts "Ringneck says: hissssssss!"
 *      //-> alerts "You should probably run. He looks really mad."
 *      
 *      // redefining Animal#speak
 *      Animal.include({
 *        speak: function() {
 *          alert(this.name + ' snarls: ' + this.sound + '!');
 *        }
 *      });
 *      
 *      ringneck.speak();
 *      //-> alerts "Ringneck snarls: hissssssss!"
 *      //-> alerts "You should probably run. He looks really mad."
 *      
 *      
 *      // redefining Animal.createHuge
 *      Animal.createHuge = function(name, sound){
 *        var huge_animal = this.create(name, sound);
 *        huge_animal.is_huge = true;
 *        return huge_animal;
 *      };
 *      
 *      var asp = Snake.createHuge("Asp");
 *      asp.huge;
 *      //-> undefined
 *      asp.is_huge;
 *      //-> true
 *      asp.huge_snake;
 *      //-> true
 *
**/

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
    aliasMethod: function aliasMethod(alias_method_name, method_name){
      var _method = this[method_name];
      var alias = function(){ return _method.apply(this, arguments); };
      alias.method_name = method_name;
      this[alias_method_name] = alias;
      return this;
    }
  };

  /** section: Klass
   * class Klass
   *
   *
  **/
  window.Klass = cloneWithInheritance(klass.object);
  _extend(window.Klass, {
    /**
     *  Klass.aliasMethod(alias_name, method_name) -> Klass
     *    - alias_name (String): The name of the new alias
     *    - method_name (String): The name of the method to alias
     *
     *  Aliases a klass method
    **/
    
    klass: Klass,
    klass_name: 'Klass',
    toString: function toObject(){ return "[object "+(this.klass_name||'AnonymousKlass')+"]"; },
    valueOf: function valueOf(){ return this; },
    subklasses: [],

    /**
     *  Klass.include(Object) -> Klass
     *    - Object (Object): The object whose properties will be copied to the `klass`.prototype
     *
     *  Mimics Ruby's Class include
    **/
    include: function include(object){ _extend(this.prototype, object); return this; },

    /**
     *  Klass.extend(Object) -> Klass
     *    - Object (Object): The object whose properties will be copied to the `klass`
     *
     *  If the given object has a prototype property it will not overwrite the klasses 
     *  prototype by rather have its properties copied to it. This allow for objects to
     *  be included that have class and instance properties
     *  
     *  Mimics Ruby's Class extend
    **/
    extend: function extend(object){
      for (var property in object){
        if (property == 'prototype'){
          this.include(object[property]);
        }else{
          this[property] = object[property];
        }
      }
      return this;
    }
  });


  Klass.prototype = cloneWithInheritance(klass.object);
  _extend(Klass.prototype, (function() {
    function toString(){
      return this.klass.prototype === this ?
        Object.prototype.toString(this):
        "[object "+(this.klass.klass_name||'AnonymousKlass')+":instance]";
    }
    
    /**
     *  Klass#aliasMethod(alias_name, method_name) -> Klass
     *    - alias_name (String): The name of the new alias
     *    - method_name (String): The name of the method to alias
     *
     *  Aliases an instance methods
    **/

    /**
     *  Klass#extend(Object) -> Klass
     *    - Object (Object): The object whose properties will be copied to the `klass`
     *
     *  Mimics Ruby's Class extend
    **/
    function extend(object){ return _extend(this, object); }

    /**
     *  Klass#instanceOf(klass) -> Boolean
     *  - klass (Klass): The object to check is this klass instance is an instance of
     *
     *  Mimics Ruby's Class is_a?
    **/
    function instanceOf(_klass){ return Object.instanceOf(_klass, this); }

    return {
      klass:      Klass,
      toString:   toString,
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


  /**
   *  Klass.create([superklass[, klassDefinition]]) -> Klass
   *    - superklass (Klass): an optional klass to extend from
   *    - klassDefinition (Function): an optional Function that defines the Klass being created
   *    - klassDefinition (Object): an optional Object to be extend upon the Klass being created
   *
   *  Klass definitions can be a `Function` or an `Object`
   *
   *  <h5>Function Example:</h5>
   *
   *      window.Human = Klass.create(function(Human, instance){
   *        // this === Human
   *        // Human === window.Human
   *        // instance == Human.prototype
   *
   *        // create a class method
   *        this.isHuman = function isHuman(){
   *          // this === Human
   *          return true;
   *        };
   *
   *        function initialize(name){
   *          // this.klass === Human
   *          this.name = name;
   *        };
   *
   *        function getName(){
   *          return this.name;
   *        };
   *
   *        // Human.prototype is extended with returned object
   *        return {
   *          initialize: initialize,
   *          getName: getName
   *        };
   *      });
   *
   *
   *  <h5>Object Example:</h5>
   *
   *      window.Car = Klass.create({
   *        passengers: [],
   *        initialize: function(){
   *          ...
   *        }
   *      });
   **/
  Klass.create = function create(){
    return (this === Klass) ? createKlass.apply(this, arguments) : createKlassInstance.apply(this, arguments);
  };

  /** section: Klass, alias of: Klass.create
   *  $K([object]) -> Klass
   *
   *  Creates a `Klass`. This is purely a convenience wrapper around the Klass.create
   *  method, it does not do anything other than pass any argument it's given into
   *  the Hash constructor and return the result.
   **/
  $K = function $K(){
    return Klass.create.apply(Klass, arguments);
  };

  // documented in readme
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

  function super_not_found_error(error){
    error.message = "super: no superclass method";
    error.name = "NoSuperError";
    return error;
  }

  /**
   * == Language ==
   * Additions to JavaScript's "standard library" and extensions to
   * built-in JavaScript objects.
  **/

  /** section: Language
   * class Function
   *
   *  Extensions to the built-in `Function` object.
  **/

  /**
   *  Function#getSuper(context) -> Function
   *    - context (Klass | KlassInstance): the klass or klass instance at which to start our super seach, usually (this)
   *
   *  <h5>Function Example:</h5>
   *
   *      var Human = Klass.create({
   *        initialize: function(name){
   *          this.name = name;
   *        }
   *      });
   *
   *      var FakeHuman = Klass.create(Human, {
   *        getName: function(title){
   *          title = 'fake '+title;
   *          var super = arguments.callee.getSuper(this);
   *          if (super)
   *            return super.apply(this,[title]);
   *          else
   *            return this.name+' a '+title;
   *        }
   *      });
   *
   *      var darel = FakeHuman.create('darel');
   *
   *      darel.getName('syborg');
   *      //-> "darel a fake syborg"
   *
   *      klass(Human,{
   *        getName: function(title){
   *          return this.name+' the '+title;
   *        }
   *      });
   *
   *      darel.getName('syborg');
   *      //-> "darel a fake syborg"
   *
   *
  **/
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

  /**
   *  Function#applySuper(context, args) -> ?
   *    - context (Klass | KlassInstance): the klass or klass instance at which to start our super seach, usually (this)
   *    - context (Array): the array of arguments to be passed to
   *
   *  <h5>Function Example:</h5>
   *
   *      var Human = Klass.create({
   *        initialize: function(name){
   *          this.name = name;
   *        },
   *        getName: function(title){
   *          return this.name+' the '+title;
   *        }
   *      });
   *
   *      Human.create('darel').getName('syborg');
   *      //-> "darel the syborg"
   *
   *      var FakeHuman = Klass.create(Human, {
   *        getName: function(title){
   *          title = 'fake '+title;
   *          return arguments.callee.applySuper(this,[title]);
   *        }
   *      });
   *
   *      FakeHuman.create('darel').getName('syborg');
   *      //-> "darel the fake syborg"
  **/
  Function.prototype.applySuper = function applySuper(context, args){
    if (!context) throw new Error('you must pass `this` as the first argument to applySuper');
    if (args && Object.prototype.toString.apply(args) !== "[object Array]" && typeof args.callee !== 'function')
      throw new TypeError('second argument to Function.prototype.applySuper must be an array');
    var super_method = this.getSuper(context);
    if (!super_method) throw noSuperErrorafyError(new Error());
    return super_method.apply(context,args);
  };

  /**
   *  Function#callSuper(context[, arg]) -> ?
   *    - context (Klass | KlassInstance): the klass or klass instance at which to start our super seach, usually (this)
   *    - arg (?): all following arguments are passed to the super method
   *
   *
  **/
  Function.prototype.callSuper = function applySuper(context){
    if (!context) throw new Error('you must pass `this` as the first argument to callSuper');
    var super_method = this.getSuper(context);
    if (!super_method) throw noSuperErrorafyError(new Error());
    // return super_method.apply(context, toArray(Array.prototype.slice.apply(arguments,1));
    return super_method.call.apply(super_method, arguments);
  };

  function noSuperErrorafyError(error){
    error.message = "super: no superclass method";
    error.name = "NoSuperError";
    return error;
  }

})();