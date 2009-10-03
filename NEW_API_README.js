// a klass
{
  prototype: {
    
  }
}




// the base Klass object that all Klasses are extended from
var Klass;

// calling Klass.create creates a new Klass
var Frog = Klass.create({});
// synonymous with new klass

// calling klass extends the given klass
klass(Frog, {});
// => Frog (extended)
// Note: this is synonymous with Object.extend(Frog.prototype, {})

// calling klass without passing it an instance of klass
klass({});
// => throws an error

// calling Klass.create and passing in an instance of Klass
// creates a new Klass that extends from the given klass
var BigFrog = Klass.create(Frog, {});


// klass accepts either Objects or Functions for definition
//  Objects are extend upon the [Klass].prototype object
//  Functions are called in the context of the [klass] object and
//    the returned object is extended onto the instance prototype

var Frog = Klass.create({
  things: [],
  ass: function(){},
  face: function(){}
});

var Frog = Klass.create(function(){
  // this == the frog klass object (Frog)
  
  // returned object is extended upon the
  // class instance prototype object
  return {};
});

// like ruby
Frog.extend({});
Frog.include({});


new Frog();
// => throws an error
Frog.create();
// => [instance of Frog]

Frog.find = function find(){};
BigFrog.find === Frog.find;
// => true

Frog.prototype.jump = function jump(){};
BigFrog.prototype.jump === Frog.prototype.jump;
// => true


Frog.extend({
  killAll: function(){ return 'dead frogs'; }
});
Frog.killAll();
// => 'dead frogs'


var hopper = Frog.create();
Frog.include({
  leap: function(){return 'leeeeep';}
});
hooper.leap();
// => 'leeeeeep'



var Frog = Klass.create(function Frog(){
  this.thing = 'goes on the class';
  this.prototype.then_this = 'goes on the instance';
  return {
    and_this: 'goes on the instance'
  };
})




// IDEAS -----


// my idea with super is like this

function(){
  return arguments.callee.$super(this, arguments);
}

Function.prototype.$super = function $super(instance){
  var method = this, klass = instance.klass;
  
  if (!klass) throw new Error('cannot call super outside of a class context');

  // if this method doesnt have a name
  if (!method.name){
    // loop through all the values in the instance object and find the name of its key
    method.name = $H(instance).find(function(pair){ return methods === pair.value; })[0];
  }
  // traverse this klass's ancestry for methods of the same name

};

// this way if you want to be able to alias methods and have the alias's super call up
// the chain using the original method's name you just need to name your method or
// set the value of method.name

// plus we no longer need to wrap every single method =D



// when defining a new class with a function we can derive the
// class name of the klass by parsing the first argument's name
// JARED: do not get caught up with klass names until super works
var Frog = Klass.create(function(Frog){
  Frog.whatever = function(){};
});



