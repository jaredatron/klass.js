var SteralBastard = new Klass(function SteralBastard(){});


var Mamal = new Klass(function Mamal(){ return {
  initialize: function initialize(name){
    this.name = name || 'no name';
  },
  speak: function speak(){
    return 'gergle gregle';
  },
  getWeight: function getWeight(){
    return 10;
  }
}});

var Dog = Klass(Mamal, function Dog(){ with(this){
  
  def(function speak(){
    return 'ruff ruff';
  });
  
}});
var Cat = Klass(Mamal, function Cat(){ with(this){
  
  def(function speak(){
    return 'meow';
  });
  
}});


var FatDog = new Klass(Dog, function FatDog(){ return {
  
  getWeight: function($super){
    return $super() + 15;
  }
  
}});

// mixin
var Wild = {
  
}