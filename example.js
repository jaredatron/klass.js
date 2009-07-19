console.log('running examples');

Class(function Animal(){ with(this){

  def(function bark(){
    console.log('bark bark');
  });
  aliasMethod('ruf','bark');
  
  def(function bark3Times(){
    this.bark(); this.bark(); this.bark();
  });
  
  def(function getMyClass(){
    
  })

  self.def(function findByName(){
    console.log('finding by name')
  });

  Class('Rider',{
    setName:function(name){
      console.log('setting name to '+name);
    }
  });


}});


// Class('Frog', superClass, methods, methods)
// // => window.Frog
//
// {
//   extend // add class methods
//   include // add instance methods
//   subclasses
//   superClass
// }
//
// with(Frog){
//   Class('Toy',methods)
//   // => window.Frog.Toy
// }





//
//
//
// Class(function(Rupture){
//   Rupture.define_methods(
//     function alpheBear(){},
//     function mamaDuck(){}
//   )
//   function createFrogClass(){
//     Class('Fro')
//   }
//   var love = 5;
//   with(Rupture){
//     Class('Donkey',{a:def});
//     var ass = 3;
//     def(createFrogClass);
//     // self.def(function thisIsAClassMehod(){});
//   }
//
//   this.defineMethods(
//     function alpheBear(){},
//     function mamaDuck(){}
//   );
//
//   with(this){
//     def()
//   }
//
// });
//
// console.dir(Rupture);
//
// function Module(){
//   Object.define.apply(this,arguments);
// };
//
// new Module(
//   {someMethod: function(){}},
//   function someOtherMethod(){},
//   {version:2.4}
// );
//
