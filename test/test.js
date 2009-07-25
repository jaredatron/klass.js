(function() {

  // tests

  var total = 0, passed = 0, failed = 0;
  function test(evaluation){
    total++;
    if (!!eval(evaluation)){
      passed++;
      //console.info(evaluation);
    }else{
      failed++;
      console.warn(evaluation);
    }
  }

  function showTestResults(){
    console[total == passed ? 'log':'error']('TEST RESULTES: total:'+total+' passed:'+passed+' failed:'+failed);
  };


  var Frog = new Klass(function Frog(){ with(this){
    this.someKlassMethod = function someKlassMethod(){};
    defineMethod(function freakout(){
      return 'freaking the f out';
    });
    return {
      jumps:true
    };
  }});

  test('Frog.superklass === null');
  test('Frog.subklasses instanceof Array');
  test('Frog.subklasses.length === 0');

  var bob = Frog.create();
  test('bob.isA(Frog)');
  test('bob.klass === Frog');
  test('Frog.subklasses.length === 0');
  test('typeof bob.freakout === "function"');
  test('bob.freakout() == "freaking the f out"');

  var Toad = new Klass(function Toad(){});
  var sam = Toad.create();
  test('sam.isA(Toad)');
  test('!bob.isA(Toad)');

  test('Frog.subklasses.length === 0');
  test('Toad.subklasses.length === 0');


  Frog.instance.prototype.leap = function leap(){};
  Toad.instance.prototype.hop = function hop(){};

  test('"leap" in bob');
  test('"hop" in sam');
  test('!("leap" in sam)');
  test('!("hop" in bob)');


  var HugeFrog = new Klass(Frog, function HugeFrog(){
    this.include({
      pounce: function pounce(){},
      freakout: function freakout($super){
        return 'i will not start '+$super();
      }
    });

    this.defineClassMethod(function find(){});
  });

  test('HugeFrog.superklass === Frog');
  test('Frog.subklasses.length === 1');
  test('HugeFrog.subklasses.length === 0');
  test('"find" in HugeFrog');

  var alph = HugeFrog.create();
  test('alph.isA(HugeFrog)');
  test('alph.isA(Frog)');
  test('"pounce" in alph');
  test('alph.freakout() == "i will not start freaking the f out"');


  // mixin
  var Dies = {
    die: function die(){},
    reserect: function reserect(){}
  };

  var Dog = new Klass(function Dog(){
    this.include(Dies);
    return {
      initialize: function(name){
        this.name = name;
      }
    };
  });

  test('"die" in Dog.create()');
  test('Dog.create("walter").name == "walter"');



  var Wolf = new Klass(function Wolf(){
    return {
      initialize: function(name){
        this.name = name;
      }
    };
  });
  var Sheep = new Klass(function Sheep(){
    return {
      initialize: function(){
        return Wolf.create.apply(Wolf, arguments);
      }
    };
  });

  var willber = Sheep.create("willber");

  test('willber.isA(Wolf)');
  test('!(willber.isA(Sheep))');


  var Mamal = new Klass(function Mamal(){ return {
    initialize: function mamalInitialize(){
      console.log('init mamal');
    },
    birth: function mamlBirth(){
      this.alive = true;
      return 'birthing mamal';
    }
  };});

  var m = Mamal.create();
  test('m.birth() == "birthing mamal"');
  test('m.alive === true');


  var Human = new Klass(Mamal, function Human(){
    return {
      birth: function humanBirth($super){
        return $super()+' human';
      }
    };
  });

  var jared = Human.create();
  jared.jared=true;
  test('jared.birth() == "birthing mamal human"');
  test('jared.alive === true');


  jared.alive = false;

  Mamal.instance.prototype.birth = function newMamalBirth(){
    return 'sesarian bloody birthing mamal';
  };

  test('jared.birth() == "sesarian bloody birthing mamal human"');
  test('jared.alive === false');


  jared.klass.include({
    breakMe: function breakMe($super){
      try{
        $super();
      }catch(e){
        if (e.message !== 'super: no superclass method \'breakMe\'') throw e;
      }
    }
  });

  jared.breakMe();








  var Time = new Klass(function Time(){ with(this){
    extend({
      now: function now(){
        return this.create(new Date());
      }
    });
    include({
      initialize: function initialize(date){
        this.date = date || new Date(0);
      }
    });
  };});

  test('Time.now().date.getDate() == new Date().getDate()');
  test('Time.create().date.getDate() == new Date(0).getDate()');

  var Yesturday = new Klass(Time, function Yesturday(){ with(this){
    extend({
      now: function yesturdayNow($super){
        var time = $super();
        time.date.setDate(time.date.getDate() - 1);
        return time;
      }
    });
  };});

  var oneDayAgo = new Date();
  oneDayAgo.setDate(new Date().getDate() - 1);
  test('Yesturday.now().date.getDate() == oneDayAgo.getDate()');



  var Swinger = new Klass(function Swinger(){
    this
      .defineClassMethod(function swing(){ return 'thinks swinging is classy!'; })
      .defineInstanceMethod(function swing(){ return 'is swinging in the instance!'; })
  });

  console.log(Swinger.swing(), Swinger.create().swing());

  test('Swinger.swing() == "thinks swinging is classy!"');
  test('Swinger.create().swing() == "is swinging in the instance!"');


  var Ron = new Klass(Swinger, function Ron(){
    this.defineMethod(function swing($super){ return 'Ron '+$super(); })
    // here we're taking a method that has already been wrapped to get super as
    // and instance method and using it as a class method and testing that is
    // accesses the correct super method
    this.swing = this.instance.prototype.swing;
  });

  console.log(Ron.swing(), Ron.create().swing());

  test('Ron.swing() == "Ron thinks swinging is classy!"');
  test('Ron.create().swing() == "Ron is swinging in the instance!"');


  showTestResults();

})();