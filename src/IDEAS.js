clear();

(function(block){
  block.doit = function(){ console.log('one'); }
  block();
})(

function Bob(){
  Bob.doit()
})


Klass = function(block){
  klass = {};
  
  Object.extend(block, classModificationMethods)
  
  block.bind(this)()
}



// this could be an awesome way to shorthand arguments.callee for something like Bob.super()
// if it worked in IE
var Bob = Sam = Peter = Love = {};
(function Bob(){ console.log(arguments.callee === Bob);})();
[function Sam(){ console.log(arguments.callee === Sam);}][0]();
(function(block){ block() })(function Peter(){ console.log(arguments.callee === Peter);});
({Love:function Love(){ console.log(arguments.callee === Love);}})['Love']();


