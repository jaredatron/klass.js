var TempClass = Klass(function(){

});

Klass('Animal', function(){
  this.klass.COLORS = ['red','blue'];
  this.initialize = function(name) {
    this.name = name;
  };
});

Klass('Human', Animal, function(){
  this.initialize = function(firstName, lastName) {
    this.$super('initialize', firstName);
    this.lastName = lastName;
  };
});

Klass('Human.Arm');

boford = Animal.create('Boford')
megan = Human.create('Megan', 'Gritzfeld');

console.log(TempClass);
console.log(Animal);
console.log(Human);
console.log(Human.Arm);
console.log(boford);
console.log(megan);


Klass('Model', function() {

  Model.extend(function() {

    this.isAClassMethod = function(){};
    this.isAClassProperty = true;

  });

  this.isAnInstanceMethod = function(){};
  this.isAnInstanceProperty = true;

});
