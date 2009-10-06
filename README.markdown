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

    
    
#### Pretty class editing

    klass(Human,{
      aNewMethod: function(){}
    });
    

    klass(Human,function(){
      this.aNewClassMethod = function(){};
      this.proto
    });
    


#### Class definitions via Function (more ruby like)

    var Human = Klass.create(function(Human, instance){
      // this === Human
      // Human === window.Human
      // instance == Human.prototype
      // Human.klass_name == 'Human' (klass_name is infered by the first argument of the given definition function)

      this.instances = [];

      // create a class method
      this.findByName = function findByName(name){
        // this === Human
        return this.instances.find(function(instance){
          return instance.name == name;
        });
      };

      function initialize(name){
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
        initialize: initialize,
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
  but avoids that extra work and allows you to move Functions around any way you like
    
    var Human; // see above example
    
    var FakeHuman = Klass.create(Human, {
      getName: function(){ 
        return arguments.callee.$super(this)+' the fake human';
      }
    });
    
    FakeHuman.create('Bob').getName();
    //-> "Bob the fake human"
    
    var Robot = Klass.create(FakeHuman, function(Robot, instance){
      // Alias method copies the Robot.prototype.getName function
      // to Robot.prototype.getModelNumber as well as setting
      // Robot.prototype.getModelNumber.method_name to 'getName' so that super
      // knows to crawl up to the corret super method
      Robot.prototype.aliasMethod('getModelNumber', 'getName');
    });
    
    Robot.create('Bender').getModelNumber();
    //-> "Bender the fake human"

#### Extend and Include
  We're also a bit more Ruby like when it comes to mixins.
  
    var FourWheels = {
      wheels: 4,
      
    }
    var Car = 
    
