// var SteralBastard = new Klass(function SteralBastard(){});
// 
// 
// var Mamal = new Klass(function Mamal(){ return {
//   initialize: function MamalInitialize(name){
//     this.name = name || 'no name';
//   },
//   speak: function MamalSpeak(){
//     return 'gergle gregle';
//   },
//   getWeight: function getMamalWeight(){
//     return 10;
//   }
// }});
// 
// var Dog = Klass(Mamal, function Dog(){ with(this){
// 
//   def(function speak(){
//     return 'ruff ruff';
//   });
// 
// }});
// var Cat = Klass(Mamal, function Cat(){ with(this){
// 
//   def(function speak(){
//     return 'meow';
//   });
// 
// }});
// 
// 
// var FatDog = new Klass(Dog, function FatDog(){ return {
// 
//   getWeight: function getFatDogWeight($super){
//     return $super() + 15;
//   }
// 
// }});
// 
// 
// var Human = new Klass(Mamal, 'human',[
//   function initialize(){
//     this.isSmiling = false;
//   },
//   function smile(){
//     this.isSmiling = true;
//     return this;
//   },
//   function frown(){
//     this.isSmiling = false;
//     return this;
//   }
// ]);
// 
// 
// // mixin
// var Wild = {
// 
// }