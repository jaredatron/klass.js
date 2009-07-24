Object.cloneWithInheritance = function cloneWithInheritance(source){
  var sourceClass = function(){};
  sourceClass.prototype = source;
  return new sourceClass();
};


Class = function Class(){
  var args = $A(arguments), class = this, superclass;

  if (arguments[0] instanceof Class) superclass = args.shift();
  
  // class.class = Class;
  
  if (superclass){
    function constructor(){};
    constructor.prototype = superclass;
    class = new constructor;
    class.superclass = superclass;
    class.subclasses = [];
    superclass.subclasses.push(class);
  } 

  // consider making instance a function  new Frog.instance =AKA= Frog.create()
  // then here we just do something like 
  //   class.instance = function instance(); 
  //   class.instance.prototype = Object.cloneWithInheritance(class.instance);
  class.instance = Object.cloneWithInheritance(class.instance);
  class.instance.class = class;
  for (var i=0; i < args.length; i++) {
    var methods = args[i];
    if (Object.isFunction(methods)){
      class.className = methods.name ? methods.name.capitalize() : 'anonymous'; //TODO replace capitalize
      methods = methods.bind(class)();
    }
    Object.extend(class.instance,methods);
  };
  return class;
};



Class.prototype = {
  class: Class,
  className: 'Class',
  superclass: null,
  subclasses: [],
  create: function create(){
    function instance(args){
      this.initialize.apply(this,args);
    }
    instance.prototype = this.instance;
    // instance.constructor = instance;
    return new instance(arguments);
  },
  
  instance: {
    initialize: function initialize(){
      console.log('initializing',this,arguments);
    },
    inspect: function(){
      return '<#'+this.class.className+' >';
    },
    
    isA: function(class){
      if (!class || !class.instance) return false;
      function constructor(){};
      constructor.prototype = class.instance;
      return (this instanceof constructor);
    },
  },
  
  extend: function(methods){
    return Object.extend(this, methods);
  },
  
  include: function(methods){
    Object.extend(this.instance, methods);
    return this;
  },

  inspect: function(){
    return '<#Class:'+this.className+'>';
  },
  toString: function toString(){
    return this.inspect();
  },
  
  defineInstanceMethod: function(method){
    this.instance[method.name] = method;
    return this;
  },

};




// tests

function test(evaluation){
  !!eval(evaluation) ? 
    console.info(evaluation)
  : console.warn(evaluation);
}


Frog = new Class(function Frog(){ with(this){
  this.someClassMethod = function someClassMethod(){};
  defineInstanceMethod(function freakout(){});
  return {
    jumps:true
  }
}});

bob = Frog.create();
test('bob.isA(Frog)');

Toad = new Class(function Toad(){});
sam = Toad.create();
test('sam.isA(Toad)');
test('!bob.isA(Toad)');


Frog.instance.leap = function leap(){};
Toad.instance.hop = function hop(){};

test('"leap" in bob');
test('"hop" in sam');
test('!("leap" in sam)');
test('!("hop" in bob)');


HugeFrog = new Class(Frog, function HugeFrog(){
  this.include({
    pounce: function pounce(){},
  });
  
  this.extend({
    find: function find(){},
  })
});

test('HugeFrog.superclass === Frog');
test('"find" in HugeFrog');

alph = HugeFrog.create();
test('alph.isA(HugeFrog)');
test('alph.isA(Frog)');
test('"pounce" in alph');


// mixin
Dies = {
  die: function die(){},
  reserect: function reserect(){},
}

Dog = new Class(function Dog(){
  
  this.include(Dies);
  
  return {
    initialize: function(name){
      console.log('init new Dog',arguments);
      this.name = name;
    },
  }
  
})

test('"die" in Dog.create()');
test('Dog.create("walter").name == "walter"')



