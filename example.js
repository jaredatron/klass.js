console.log('running examples');

Class(function Animal(){ with(this){

  def(function bark(){

  });

  self.def(function find(){});

  aliasMethod('ruf','bark');

  Class('Rider',{
    setName:function(){

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
