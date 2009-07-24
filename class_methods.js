Class.create = Class.create.wrap(function(){
  var args = $A(arguments),
      $super = args.shift(),
      klass = $super.apply(this, args);

  if (klass.superclass) klass.superclass.addClassMethods();
  return klass;  
});


Class.Methods.addInstanceMethods = function addInstanceMethods(){ Class.Methods.addMethods.apply(this,arguments); };
Class.Methods.addClassMethods = function addClassMethods(source){
  var source = source || this, 
      refresh = this == source, 
      ancestor = this.superclass;
      properties = Object.keys(source);
  
  if (!Object.keys({ toString: true }).length) {
    if (source.toString != Object.prototype.toString)
      properties.push("toString");
    if (source.valueOf != Object.prototype.valueOf)
      properties.push("valueOf");
  }
  
  for (var p = properties.length - 1; p >= 0; p--){
    var property = properties[p], value = source[property];

    if (!refresh && ancestor && Object.isFunction(value) && value.argumentNames().first() == "$super") {
      var method = value;
      value = (function(m) {
        return function() { return ancestor[m].apply(this, arguments); };
      })(property).wrap(method);
      
      value.valueOf = method.valueOf.bind(method);
      value.toString = method.toString.bind(method);
    }
    
    for (var s = this.subclasses.length - 1; s >= 0; s--){
      var subclass = this.subclasses[s];
      if (!(property in subclass) || subclass[property] === this[property])
        subclass[property] = value;
    };

    if (!refresh) this[property] = value;
  };
  
  return this;
};
Class.Methods.include = function include(){ Class.Methods.addMethods.apply(this,arguments); };
Class.Methods.extend = function extend(){ Class.Methods.addClassMethods.apply(this,arguments); };



function TEST(test){
  console.log(eval(test), test);
}

var Animal = Class.create();
Animal.fuck = function fUCK(){};

var Dog = Class.create(Animal)
TEST('Animal.fuck === Dog.fuck');

Animal.addClassMethods({
  create: function create(){},
});
TEST('Animal.create === Dog.create');

Dog.mine = function dogs(){};

Animal.addClassMethods({
  mine: function animals(){},
});
TEST('Animal.mine !== Dog.mine');

Animal.addClassMethods({
  toString: function animalToString(){},
  valueOf: function animalvalueOf(){},
});

TEST('Animal.toString === Dog.toString');
TEST('Animal.valueOf === Dog.valueOf');

Animal.addClassMethods({})




Animal.addClassMethods({ setTwice: function setOnce(){} });
TEST('Animal.setTwice === Dog.setTwice');
Animal.addClassMethods({ setTwice: function setTwice(){} });
TEST('Animal.setTwice === Dog.setTwice');
Dog.addClassMethods({ setTwice: function setThrise(){} });
Animal.addClassMethods({ setTwice: function setFourtimes(){} });
TEST('Animal.setTwice !== Dog.setTwice');





Dog.addClassMethods({ 
  man: function dogMan($super){
    console.log('dog man');
    if ($super) $super();
  } 
});

TEST('Animal.man !== Dog.man');

// Animal.addClassMethods({ 
//   man: function animalMan(){
//     console.log('animal man');
//   } 
// });
// 
// TEST('Animal.man !== Dog.man');