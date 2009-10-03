(function() {

  var emptyFunction = function(){};

  // Helper Methods
  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }
  
  function cloneWithInheritance(source){
    emptyFunction.prototype = source;
    return new emptyFunction();
  };
  
  function inheritorOf(parent,child){
    if (typeof parent !== 'function'){
      emptyFunction.prototype = parent;
      parent = emptyFunction;
    }
    return (child instanceof parent);
  };

  function toArray(iterable) {
    if (!iterable) return [];
    if ('toArray' in Object(iterable)) return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  }
  
  function isKlass(object){
    return inheritorOf(Klass, object);
  }
  
  
  
  
  
  
  
  // Klass ->
  

  
  window.Klass = {
    klass_name: 'Klass',
    toString: function toObject(){ return "[object "+(this.klass_name||'AnonymousKlass')+"]"; },
    valueOf: function valueOf(){ return this; },
    subklasses: []
  };
  Klass.klass = Klass;
  Klass.prototype = {
    klass: Klass,
    toString: function toObject(){
      return this.klass.prototype === this ?
        Object.prototype.toString(this):
        "[object "+this.klass.klass_name+":instance]";
    },
    valueOf: function valueOf(){ return this; }
  };
  
  function klassInstance(){
    if ('initialize' in this) return this.initialize.apply(this,arguments);
  };
  
  function createKlassInstance(){
    klassInstance.prototype = this.prototype;
    return new klassInstance;
  };
  
  function findKlassNameInDefinitions(definitions){
    for (var i=0; i < definitions.length; i++) {
      if (typeof definitions[i] === 'function' && definitions[i].name.length)
        return definitions[i].name
      if (typeof definitions[i] === 'string' && definitions[i].length)
        return definitions[i]
    };
  }
  
  function createKlass(superklass){
    if (this === Klass)
    var defs = toArray(arguments);
    var superklass = isKlass(defs[0]) ? defs.shift() : Klass;
    var _klass = cloneWithInheritance(superklass);
    _klass.superklass = superklass;
    _klass.klass_name = findKlassNameInDefinitions(defs);
    superklass.subklasses.push(_klass);
    _klass.subklasses = [];
    _klass.prototype = cloneWithInheritance(superklass.prototype);
    _klass.prototype.klass = _klass;
    defs.unshift(_klass)
    klass.apply(window,defs);
    return _klass;
  };
  
  Klass.create = function create(){
    return (this === Klass) ? createKlass.apply(this, arguments) : createKlassInstance.apply(this, arguments);
  };
  
  // klass sudo operator
  function klass(_klass){
    if (!isKlass(_klass)) throw new Error('expected instance of Klass');
    var definitions = Array.prototype.slice.apply(arguments, [1]);
    for (var i=0; i < definitions.length; i++) {
      var definition = definitions[i]
      if (typeof definition === 'function') definition = definition.apply(_klass, [_klass, _klass.prototype]) || {};
      if (typeof definition === 'object') extend(_klass.prototype, definition);
    };
  };
  window.klass = klass;
  

  
})();