Object.cloneWithInheritance = function cloneWithInheritance(source){
  var sourceKlass = function(){};
  sourceKlass.prototype = source;
  return new sourceKlass();
};


Klass = function Klass(){
  var args = $A(arguments), klass = this, superklass;

  if (arguments[0] instanceof Klass) superklass = args.shift();
  
  // klass.klass = Klass;
  
  if (superklass){
    function constructor(){};
    constructor.prototype = superklass;
    klass = new constructor;
    klass.superklass = superklass;
    klass.subklasses = [];
    superklass.subklasses.push(klass);
  } 

  // consider making instance a function  new Frog.prototype =AKA= Frog.create()
  // then here we just do something like 
  //   klass.prototype = function instance(); 
  //   klass.prototype.prototype = Object.cloneWithInheritance(klass.prototype);
  klass.prototype = Object.cloneWithInheritance(klass.prototype);
  klass.prototype.klass = klass;
  for (var i=0; i < args.length; i++) {
    var methods = args[i];
    if (Object.isFunction(methods)){
      klass.klassName = methods.name ? methods.name.capitalize() : 'anonymous'; //TODO replace capitalize
      methods = methods.bind(klass)();
    }
    Object.extend(klass.prototype,methods);
  };
  return klass;
};



Klass.prototype = {
  klass: Klass,
  klassName: 'Klass',
  superklass: null,
  subklasses: [],
  create: function create(){
    function instance(args){
      this.initialize.apply(this,args);
    }
    instance.prototype = this.prototype;
    return new instance(arguments);
  },
  
  prototype: {
    initialize: function initialize(){
      console.log('initializing',this,arguments);
    },
    inspect: function(){
      return '<#'+this.klass.klassName+' >';
    },
    
    isA: function(klass){
      if (!klass || !klass.prototype) return false;
      function constructor(){};
      constructor.prototype = klass.prototype;
      return (this instanceof constructor);
    }
  },
  
  extend: function(methods){
    return Object.extend(this, methods);
  },
  
  include: function(methods){
    Object.extend(this.prototype, methods);
    return this;
  },

  inspect: function(){
    return '<#Klass:'+this.klassName+'>';
  },
  toString: function toString(){
    return this.inspect();
  },
  
  defineInstanceMethod: function(method){
    this.prototype[method.name] = method;
    return this;
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

bob = Frog.create();
test('bob.isA(Frog)');

Toad = new Klass(function Toad(){});
sam = Toad.create();
test('sam.isA(Toad)');
test('!bob.isA(Toad)');


Frog.prototype.leap = function leap(){};
Toad.prototype.hop = function hop(){};

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
      console.log('init new Dog',arguments);
      this.name = name;
    }
  };
  
});

test('"die" in Dog.create()');
test('Dog.create("walter").name == "walter"');


testResults();