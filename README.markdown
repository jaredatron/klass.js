#Klass.js

Klass.js is a more feature rich implementation of Ruby like Class inheritance in Javascript. The main advantage that Klass.js has over Prototype's Ruby like Class implementation is both Class and Instance based inheritance.

##Examples
  Klass.js supports a syntax very similar to Prototype's Class. Compare the following code to the exmaples given in the Prototype documentation:
  <http://api.prototypejs.org/language/class.html#addmethods-instance_method>

    var Animal = Klass.create({
      initialize: function(name, sound) {
        this.name  = name;
        this.sound = sound;
      },

      speak: function() {
        alert(this.name + " says: " + this.sound + "!");
      }
    });

    // subclassing Animal
    var Snake = Klass.create(Animal, {
      initialize: function(name) {
        arguments.callee.$super(this,[name, 'hissssssssss']);
      }
    });

    var ringneck = Snake.create("Ringneck");
    ringneck.speak();

    //-> alerts "Ringneck says: hissssssss!"

    // adding Snake#speak (with a supercall)
    Snake.include({
      speak: function() {
        arguments.callee.$super(this);
        alert("You should probably run. He looks really mad.");
      }
    });

    ringneck.speak();
    //-> alerts "Ringneck says: hissssssss!"
    //-> alerts "You should probably run. He looks really mad."

    // redefining Animal#speak
    Animal.include({
      speak: function() {
        alert(this.name + ' snarls: ' + this.sound + '!');
      }
    });

    ringneck.speak();
    //-> alerts "Ringneck snarls: hissssssss!"
    //-> alerts "You should probably run. He looks really mad."

### Now. Where we differ
    
    
#### Class and Instance inheritance

    var LifeForm = Klass.create();

    LifeForm.birth = function(){ return 'born'; };
    LifeForm.prototype.alive = true;

    var Ameba = Klass.create(LifeForm);

    Ameba.birth();
    //-> 'born'

    LifeForm.birth = function(){ return 'waaaa waaaa'; };

    Ameba.birth();
    //-> 'waaaa waaaa'

    var amy = Ameba.create();

    amy.alive;
    //-> true

    LifeForm.prototype.alive = false;

    amy.alive
    //-> false

    amy.klass.birth();
    //-> 'waaaa waaaa'

#### Pretty Class Reopening

    var Puppet = Klass.create();

    klass(Puppet, function(self){
      this.initialize: function(){
        ...
      };

      self.aNewClassMethod = function(){
        ...
      };
    });


    klass(Puppet,{
      aNewInstanceMethod: function(){
        ...
      }
    });

#### klass_name

  In order to provide pretty toString values, making your Firebug experience that much better, we guess the klass_name from
  either a passed in String or the name of the first argument of the first definition function that has one

    var Frog = Klass.create(function(Frog){ ... });
    Frog.klass_name
    //-> 'Frog'

    Klass.create('KittyCat',{...}).klass_name
    //-> 'KittyCat'

#### Class definitions via Function (more ruby like)

    var Human = Klass.create(function(Human, instance){
      // this === Human.prototype
      // Human === window.Human
      // instance == Human.prototype
      // Human.klass_name == 'Human' (klass_name is infered by the first argument of the given definition function)

      Human.instances = [];

      // create a class method
      Human.findByName = function findByName(name){
        // this === Human
        return this.instances.find(function(instance){
          return instance.name == name;
        });
      };

      this.initialize = function(name){
        // this == Human:instance:X
        // this.klass === Human
        this.klass.instances.push(this);
        this.name = name;
      };

      function getName(){
        return this.name;
      };

      // class instance (prototype) is extended with returned object
      return {
        getName: getName
      };
    });

    var pedro = Human.create('Pedro');
    //-> Human:instance

    Human.findByName('Pedro');
    //-> pedro


#### Super
  Prototype's $super works by defining a methods relationship to it's super method
  when it's defined using addMethods. Our $super implementation is a bit more verbose
  but avoids that extra work and allows you to move Functions around any way you like.

    var Human; // see above example

    var FakeHuman = Klass.create(Human, {
      getName: function(){
        return arguments.callee.$super(this)+' the fake human';
      }
    });

    FakeHuman.create('Darel').getName();
    //-> "Darel the fake human"

    FakeHuman.prototype.getTheName = FakeHuman.prototype.getName;

    FakeHuman.create('Mork').getTheName();
    //-> NoSuperError: no superclass method

    // Alias Method to the rescue!
    FakeHuman.prototype.aliasMethod('getTheName', 'getName');

    FakeHuman.create('Mork').getTheName();
    //-> "Mork the fake human"

    // Alias method clones (wraps) the original function and then casts its
    // property name to the original method's property name at the time of
    // the aliasing. Function#getSuper knows look for this so it can find
    // the right super method

#### Extend and Include
  We're also a bit more Ruby like when it comes to mixins.

    var MotorVehicle = {
      drive: function(){ return "driving"; }
    }

    var Drivables = {
      createTruck: function(){ return this.create("truck"); }
    }

    var Car = Klass.create(function(Car){
      this.initialize = function(type){
        this.type = type;
      };
      Car.include(MotorVehicle);
      Car.extend(Drivables);
    });

    Car.create().drive();
    //-> 'driving'

    Car.createTruck();
    //-> [Car:instance type=truck klass=Car]
