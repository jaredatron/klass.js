var Klass;
(function() {

  function countWindowSize() {
    var windowProperties = [];
    for (var p in window) windowProperties.push(p);
    return windowProperties.length;
  }
  var originalWindowSize = countWindowSize();



  function toArray(iterable) {
    if (!iterable) return [];
    if ('toArray' in Object(iterable)) return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  }

  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  function argumentNames(method) {
    var names = method.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function wrap(__method, wrapper) {
    return function() {
      return wrapper.apply(this, [bind(__method,this)].concat(toArray(arguments)));
    };
  }

  function keys(object) {
    var results = [];
    for (var property in object)
      results.push(property);
    return results;
  }

  function capitalize(string){
    return string.charAt(0).toUpperCase() + string.substring(1);
  }

  function bind(__method, context) {
    if (arguments.length < 3 && typeof arguments[1] === 'undefined') return this;
    var args = Array.prototype.slice.call(arguments, 2);
    return function() {
      return __method.apply(context, toArray(arguments).concat(args));
    };
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


  Klass = function Klass(){
    var args = toArray(arguments), klass = this, superklass;

    if (arguments[0] instanceof Klass) superklass = args.shift();

    if (superklass){
      function constructor(){};
      constructor.prototype = superklass;
      klass = new constructor;
      klass.superklass = superklass;
      superklass.subklasses.push(klass);
    }

    klass.subklasses = [];

    function KlassInstance(){
      if ('initialize' in this) return this.initialize.apply(this,arguments);
    };
    KlassInstance.prototype = cloneWithInheritance(klass.instance.prototype);
    KlassInstance.prototype.klass = klass;
    klass.instance = KlassInstance;

    for (var i=0; i < args.length; i++) {
      var methods = args[i];
      if (typeof methods === "function"){
        klass.klassName = methods.name ? capitalize(methods.name) : 'anonymous'; //TODO replace capitalize
        methods = bind(methods,klass)();
      }
      klass.defineMethods(methods);
      // extend(klass.instance.prototype,methods);
    };
    console.log('NEW KLASS: ',klass);
    return klass;
  };



  Klass.prototype = {
    klass: Klass,
    klassName:  null,
    superklass: null,
    subklasses: null,
    create: function create(){
      return applyNew(this.instance,arguments);
    },
    include: function(methods){
      extend(this.instance.prototype, methods);
      return this;
    },
    extend: function(methods){
      return extend(this, methods);
    },
    inspect: function(){
      return '<#Klass:'+this.klassName+'>';
    },
    toString: function toString(){
      return this.inspect();
    },
    // defines a meth
    defineInstanceMethod: function defineInstanceMethod(method){
      // BEFORE
      this.instance.prototype[method.name] = method;

      // AFTER
      // var methods = {};
      // methods[method.name] = method;
      // this.defineMethods(methods);
      return this;
    },
    defineMethods: function defineMethods(source) {
      var properties = keys(source);

      if (!keys({ toString: true }).length) {
        if (source.toString != Object.prototype.toString)
          properties.push("toString");
        if (source.valueOf != Object.prototype.valueOf)
          properties.push("valueOf");
      }

      for (var i = 0, length = properties.length; i < length; i++) {
        var property = properties[i], value = source[property];
        if (typeof value === 'function' && argumentNames(value)[0] == "$super") {
          var method = value;
          var super = function super() {
            var superMethod = this.klass.superklass.instance.prototype[property];
            if (!this.klass.superklass || typeof superMethod !== 'function')
              throw new Error("super: no superclass method ‘"+property+"’");
            return superMethod.apply(this, arguments);
          };
          value = wrap(super, method);
          value.valueOf = bind(method.valueOf, method);
          value.toString = bind(method.toString, method);
        }
        this.instance.prototype[property] = value;
      }
      return this;
    }
  };

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









  // tests

  var total = 0, passed = 0, failed = 0;
  function test(evaluation){
    total++;
    if (!!eval(evaluation)){
      passed++;
      //console.info(evaluation);
    }else{
      failed++;
      console.warn(evaluation);
    }
  }

  function testResults(){

    console[total == passed ? 'log':'error']('TEST RESULTES: total:'+total+' passed:'+passed+' failed:'+failed);
  };


  var Frog = new Klass(function Frog(){ with(this){
    this.someKlassMethod = function someKlassMethod(){};
    defineInstanceMethod(function freakout(){});
    return {
      jumps:true
    };
  }});

  test('Frog.superklass === null');
  test('Frog.subklasses instanceof Array');
  test('Frog.subklasses.length === 0');

  var bob = Frog.create();
  test('bob.isA(Frog)');
  test('bob.klass === Frog');
  test('Frog.subklasses.length === 0');

  var Toad = new Klass(function Toad(){});
  var sam = Toad.create();
  test('sam.isA(Toad)');
  test('!bob.isA(Toad)');

  test('Frog.subklasses.length === 0');
  test('Toad.subklasses.length === 0');


  Frog.instance.prototype.leap = function leap(){};
  Toad.instance.prototype.hop = function hop(){};

  test('"leap" in bob');
  test('"hop" in sam');
  test('!("leap" in sam)');
  test('!("hop" in bob)');


  var HugeFrog = new Klass(Frog, function HugeFrog(){
    this.include({
      pounce: function pounce(){}
    });

    this.extend({
      find: function find(){}
    });
  });

  test('HugeFrog.superklass === Frog');
  test('Frog.subklasses.length === 1');
  test('HugeFrog.subklasses.length === 0');
  test('"find" in HugeFrog');

  var alph = HugeFrog.create();
  test('alph.isA(HugeFrog)');
  test('alph.isA(Frog)');
  test('"pounce" in alph');


  // mixin
  var Dies = {
    die: function die(){},
    reserect: function reserect(){}
  };

  var Dog = new Klass(function Dog(){
    this.include(Dies);
    return {
      initialize: function(name){
        this.name = name;
      }
    };
  });

  test('"die" in Dog.create()');
  test('Dog.create("walter").name == "walter"');



  var Wolf = new Klass(function Wolf(){
    return {
      initialize: function(name){
        this.name = name;
      }
    };
  });
  var Sheep = new Klass(function Sheep(){
    return {
      initialize: function(){
        return Wolf.create.apply(Wolf, arguments);
      }
    };
  });

  var willber = Sheep.create("willber");

  test('willber.isA(Wolf)');
  test('!(willber.isA(Sheep))');


  var Mamal = new Klass(function Mamal(){ return {
    initialize: function mamalInitialize(){
      console.log('init mamal');
    },
    birth: function mamlBirth(){
      this.alive = true;
      return 'birthing mamal';
    }
  }});

  var m = Mamal.create();
  test('m.birth() == "birthing mamal"');
  test('m.alive === true');

  var Human = new Klass(Mamal, function Human(){ return {
    birth: function humanBirth($super){
      return $super()+' human';
    }
  }});

  var jared = Human.create();
  jared.jared=true;
  test('jared.birth() == "birthing mamal human"');
  test('jared.alive === true');


  jared.alive = false;

  Mamal.instance.prototype.birth = function newMamalBirth(){
    return 'sesarian bloody birthing mamal';
  }

  test('jared.birth() == "sesarian bloody birthing mamal human"');
  test('jared.alive === false');


  jared.klass.defineMethods({
    breakMe: function breakMe($super){
      try{
        $super();
      }catch(e){
        if (e.message !== 'super: no superclass method ‘breakMe’') throw e;
      }
    }
  });

  jared.breakMe();




  var windowSize = countWindowSize();
  test('originalWindowSize === windowSize');

  testResults();

})();
