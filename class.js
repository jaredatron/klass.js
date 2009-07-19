Function.prototype.getName = function(){
  return (this.name != "") ?
    this.name :
    this.toString().match(/^[\s\(]*function\s+([^(]*)\(/)[1];
};




(function() {
  
  String.subclasses || (String.subclasses = []);
  
  var ClassName = this.Class.create(String,{
    initialize: function(klass) {
      this.klass = klass;
    },
    valueOf: function(){
      return (this.klass.parent && this.klass.parent !== window) ? [this.klass.parent.className, this.klass.getName()].join('.') : this.klass.getName();
    },
    toString: function(){ return this.valueOf(); },
    inspect: function inspect(){ return '#<ClassName:'+this.toString()+'>'; }
  });
  
  Object.isClass = function isClass(object){
    return (Object.isFunction(object) && object.className instanceof ClassName);
  };
  
  // function stringToObject

  function Class(){
    // preventing inappropriate usage
    if (this != window && !(this instanceof Class) && !Object.isClass(this))
         throw new Error('Class can only be applied to classes or window');
    
    var args = $A(arguments), 
        parent = (this instanceof Class) ? null : this,
        className = (Object.isString(args.first())) ? args.shift() :
                    (Object.isFunction(args.first())) ? args.first().getName() : null;
        
    if (className.include('.')){
      var classNames = className.split('.');
      className = classNames.pop();
      parent = eval(classNames.join('.'));
    }
    
    console.log('parent', parent);
        
    if (!className || className === '' || className[0] != className[0].toUpperCase())
      throw new Error('invalid class name "'+className+'"');
    
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
    console.info('Creating class ', klass.className);
    return klass;
  };
  
  
})();

