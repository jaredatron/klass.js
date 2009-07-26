// Eamples: 

Liquid = new Klass('liauid',[
  function flow(){
     return 'flowing';
  }
]);

var water = Liquid.create();
console.log(water.flow());

ViscusLiquid = new Klass(Liquid, function ViscusLiquid(){
  this.def(function flow($super){
    return $super()+' slowly';
  });
})

var ketsup = ViscusLiquid.create();
console.log(water.flow(), ketsup.flow())

ViscusLiquid.include(function ViscusLiquid(){
  this.alias('_flow', 'flow');
  this.def(function flow(){
    return this._flow()+' into slidge';
  });
});

console.log(water.flow(), ketsup.flow())