Object.cloneWithInheritance = function cloneWithInheritance(source){
  var sourceKlass = function(){};
  sourceKlass.prototype = source;
  return new sourceKlass();
};


Function.prototype.applyNew = function applyNew(a){
  if (typeof a === 'undefined' || !('length' in a)) 
    throw new TypeError("first argument to applyNew must be an array");
  var args = '';
  for (var i=0; i < a.length; i++) args += ', a['+i+']';
  return eval('new this('+args.slice(2)+');');
};


Klass = function Klass(){
  var args = $A(arguments), klass = this, superklass;

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
  KlassInstance.prototype = Object.cloneWithInheritance(klass.instance.prototype);
  KlassInstance.prototype.klass = klass;
  klass.instance = KlassInstance;
  
  for (var i=0; i < args.length; i++) {
    var methods = args[i];
    if (Object.isFunction(methods)){
      klass.klassName = methods.name ? methods.name.capitalize() : 'anonymous'; //TODO replace capitalize
      methods = methods.bind(klass)();
    }
    Object.extend(klass.instance.prototype,methods);
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
    return this.instance.applyNew(arguments);
  },
  include: function(methods){
    Object.extend(this.instance.prototype, methods);
    return this;
  },
  extend: function(methods){
    return Object.extend(this, methods);
  },
  inspect: function(){
    return '<#Klass:'+this.klassName+'>';
  },
  toString: function toString(){
    return this.inspect();
  },
  defineInstanceMethod: function(method){
    this.instance.prototype[method.name] = method;
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
(function() {
  var total = 0, passed = 0, failed = 0;
  function test(evaluation){
    total++;
    if (!!eval(evaluation)){
      passed++;
      console.info(evaluation);
    }else{
      failed++;
      console.warn(evaluation);
    }
  }
  
  function testResults(){
    console.log('TEST RESULTES: total:'+total+' passed:'+passed+' failed:'+failed);
  };
  
  window.test = test;
  window.testResults = testResults;
})();


Frog = new Klass(function Frog(){ with(this){
  this.someKlassMethod = function someKlassMethod(){};
  defineInstanceMethod(function freakout(){});
  return {
    jumps:true
  };
}});

test('Frog.superklass === null');
test('Frog.subklasses instanceof Array');
test('Frog.subklasses.length === 0');

bob = Frog.create();
test('bob.isA(Frog)');
test('bob.klass === Frog');
test('Frog.subklasses.length === 0');

Toad = new Klass(function Toad(){});
sam = Toad.create();
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


HugeFrog = new Klass(Frog, function HugeFrog(){
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

alph = HugeFrog.create();
test('alph.isA(HugeFrog)');
test('alph.isA(Frog)');
test('"pounce" in alph');


// mixin
Dies = {
  die: function die(){},
  reserect: function reserect(){}
};

Dog = new Klass(function Dog(){
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
  return{
    initialize: function(name){
      this.name = name;
    }
  }
});
var Sheep = new Klass(function Sheep(){
  return{
    initialize: function(){
      return Wolf.create.apply(Wolf, arguments);
    }
  }
});

var willber = Sheep.create("willber");

test('willber.isA(Wolf)');
test('!(willber.isA(Sheep))');

testResults();