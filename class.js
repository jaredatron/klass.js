Object.extend = function extend(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Function.prototype.argumentNames = function argumentNames() {
  var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
    .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
    .replace(/\s+/g, '').split(',');
  return names.length == 1 && !names[0] ? [] : names;
};

Function.prototype.title = function(){
  return (this.name != "") ?
    this.name :
    this.toString().match(/^[\s\(]*function\s+([^(]*)\(/)[1];
};

// Object.define.apply(yourObject, property, [property])
Object.define = function defineMethod(properties){
  if (this == Object) throw new Error('Usage: Object.define.apply(...)');

  for (var i = arguments.length - 1; i >= 0; i--){
    var property = arguments[i];
    console.log(typeof property)
    if (typeof property == 'function'){
      var title = property.title();
      if (!title) throw new Error("function with name required. recieved:\n"+property.toString());
      this[title] = property;
    }else if (typeof property == 'object'){
      Object.extend(this,property);
    }else if (property instanceof Array){
      Object.define.apply(this,property);
    }
  };
};




(function() {

  var CLASS_NAME_DELIMITER = '$$';

  Function.prototype.parent = function parent(){
    if (this.className && this.className.indexOf(CLASS_NAME_DELIMITER) != -1)
      return this.className.replace(/\$\$\w+$/,'').toClass(); //TODO fix hard coding of $$ here
  }
  String.prototype.toClass = function toClass(){
    try{ return eval(this.replace(CLASS_NAME_DELIMITER,'.')); } catch(e){}
  }


  this.Class = function Class(className, methods){
    // preventing inappropriate usage
    if (this instanceof Class) throw new TypeError('Class is not a constructor');
    if (this != window && (typeof this != 'function' || typeof this.className == 'undefined')) throw new Error('Class can only be applied to classes or window');

    console.log(arguments);

    var block;
    if (typeof className == 'function')
      block = className, className = block.title();

    // approving className and discovering fullClassName
    if (!className || className === '') throw new Error('expected function to be named')
    if (className[0] != className[0].toUpperCase()) throw new Error('class names must be capitalized');
    if (className.indexOf('_') != -1) throw new Error('class names may not have a _');
    var fullClassName = (this == window) ? className : (typeof this.className != 'undefined') ? this.className+'$$'+className : false;

    var klass;
    try{ eval('klass = '+fullClassName.replace('$$','.')); }catch(e){}
    if (klass && klass.className == className){
      console.log('reopening class ',fullClassName);
    }else{
      console.info('Creating class ',fullClassName);
      eval('this[className] = function '+fullClassName+'(){ if (this.initialize) return this.initialize.apply(this, arguments); };');
      var klass = this[className];
      klass.className = fullClassName;
      klass.Class = window.Class;
    }
    if (block) new ClassModifier(klass, block);
  }



  function objectModifier(object){
    this.object = object;
  };

  Object.extend(objectModifier.prototype,{
    def: function def(method){
      // if (method != 'private' || method != 'public'); TODO when private/public is built
      var title = method.title();
      if (!title) throw new Error("function without title passed to def\n"+method.toString());
      this.object[title] = method;
    },
    aliasMethod: function(alias,method){
      console.log('aliasing '+alias+' -> '+method);
      eval('this.object[alias] = function '+alias+'(){ this.'+method+'(); }');
    },
    // define_method: ClassDefiner.prototype.def;
    // define_methods: function(){
    //   for (var i = arguments.length - 1; i >= 0; i--){
    //     this.def(arguments[i]);
    //   };
    // };
  });

  function ClassModifier(klass,block){
    this.object = klass.prototype;
    this.self = new objectModifier(klass);
    this.Class = function(){ Class.apply(klass,arguments); };
    // this.self == //something fooful =P // so we can do things like self.def(function methodName(){});
    block.apply(this,[]);
  }
  ClassModifier.prototype = new objectModifier();

})();


