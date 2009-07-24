var anon_class = new Class('AnonymousClass');
Class('Animal');
Class(function Shoe(){});
Class('Animal.Rider',{});
Class(function Animal$$Catcher(){});
Class('Animal',function Brother(){});

bob = {};

(function(){
  Class('Ass');
  // => window.Ass
}).bind(bob)()

Module(function Animals(){ with(this){
  
  Class(function Base(){ with(this){
    def(function run(){
      console.log('i wonder how slow this will end up being');
    })
  }});
  
  Class(Base,function Tiger(){ with(this){

  }});
  
}})

this.Module(function Animals(){
  
  this.Class(function Base(){
    this.attr('loveage');
    this.def(
      function run(){
        console.log('i wonder how slow this will end up being');
      },
      function run(){
        console.log('i wonder how slow this will end up being');
      },
      function run(){
        console.log('i wonder how slow this will end up being');
      }      
    );
  });
  
  this.Class(Base,function Tiger(){

  });
  
})