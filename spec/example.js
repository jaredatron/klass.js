Klass(function(){

});

Klass('Animal', function(){
  Animal.COLORS = ['red','blue'];
  this.initialize = function(name) {
    this.name = name;
  };
});

Klass('Human', Animal, function(){
  this.initialize = function(firstName, lastName) {
    this.$super('initialize', [firstName]);
    this.lastName = lastName;
  };
});

Klass('Human.Arm', function(){

});

boford = Animal.create('Boford')
megan = Human.create('Megan', 'Gritzfeld');

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
