Function.prototype.getName = function(){
  return (this.name != "") ?
    this.name :
    this.toString().match(/^[\s\(]*function\s+([^(]*)\(/)[1];
};




(function() {
  
  function ClassName(klass){ this.klass = klass; };
  ClassName.prototype.valueOf = ClassName.prototype.toString = function (){
    return (this.klass.parent && this.klass.parent !== window) ? [this.klass.parent.className, this.klass.getName()].join('.') : this.klass.getName();
  };
  
  Object.isClass = function isClass(object){
    return (Object.isFunction(object) && object.className instanceof ClassName);
  };
  
  // function stringToObject

  function Class(){
    console.log(arguments);
    var args = $A(arguments), 
        parent = (this instanceof arguments.callee) ? null : this,
        className = Object.isString(args[0]) ? 
                      Object.isFunction(args[1]) ?
                        args.shift()+'.'+args[0].getName()
                      : args.shift() 
                    : Object.isFunction(args[0]) ? 
                      args[0].getName()
                    : '';
    
    className = className.replace('$$','.');
    if (className.include('.')){
      var objectNames = className.split('.');
      className = objectNames.pop();
      if (objectNames.first() != 'this') objectNames.unshift('this');
      var parentName = objectNames.join('.');
      parent = eval(parentName);
      if (!parent) throw new TypeError(objectNames+' is undefined');
    }
    
    if (className === '' || className[0] != className[0].toUpperCase())
      throw new Error('invalid class name "'+className+'"');
      
    if (parent && parent != window && !parent.name){
      console.log(parent);
      throw new TypeError('invalid parent');
    }
    klass = createClass(className,parent);
    
    return klass;
  };
  this.Class = Object.extend(Class, this.Class);
  
  function createClass(className, parent){
    var klass;
    eval('klass  = function '+className+'(){ if (this.initialize) return this.initialize.apply(this, arguments); };');
    klass.klass = Class;
    klass.superclass = Object; // FIX THIS LATER WITH ANCESTRY
    klass.prototype.constructor = klass.prototype.klass = klass;
    klass.parent = parent;
    klass.parents = (klass.parent) ? [parent].concat(parent.parents) : [];
    klass.shortName = className; //there must be a way to get this in ruby
    klass.className = new ClassName(klass);
    if (parent) parent[className] = klass;
    console.log(parent);
    console.info('Creating class ', klass.className);
    return klass;
  };
  
  
})();

