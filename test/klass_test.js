Test.Unit.Testcase.prototype.assertIn = function assertIn(param, obj, message){
  message = this.buildMessage(message || 'assertIn', 'object doesn\'t contain key <?>', param);
  this.assertBlock(message, function() { return (param in obj); });
};

Test.Unit.Testcase.prototype.assertNotIn = function assertIn(param, obj, message){
  message = this.buildMessage(message || 'assertIn', 'object does contain key <?>', param);
  this.assertBlock(message, function() { return !(param in obj); });
};


new Test.Unit.Runner({

  test_klass_include_only_adds_one_property_to_global_js_context: function(){
    this.assertEqual(window.preKlassIncludePropertySize, window.postKlassIncludePropertySize, 'global name space polited > 1');
  },

  test_klass_name_is_set_to_anonymous_when_given_nothing: function() {
    this.assertEqual('anonymous', new Klass().klassName);
    this.assertEqual('anonymous', new Klass(function(){}).klassName);
    this.assertEqual('anonymous', new Klass({}).klassName);
  },

  test_klass_name_is_set_from_function_name: function(){
    var myKlass = new Klass(function perdyMouth(){});
    this.assertEqual('PerdyMouth', myKlass.klassName);
  },

  test_klass_with_no_ancestor_has_null_superklass: function(){
    this.assertNull(SteralBastard.superklass);
  },

  test_klass_with_no_children_has_0_subklasses: function(){
    this.assertEqual(0, SteralBastard.subklasses.length);
  },

  test_that_a_klass_instance_dot_klass_is_equal_to_its_klass: function(){
    var carlose_mencia = SteralBastard.create();
    this.assertIdentical(SteralBastard, carlose_mencia.klass);
  },

  test_that_create_calls_initialize: function(){
    var done = false;
    new Klass({
      initialize: function(){ done = true; }
    }).create();

    this.assert(done, 'initialize was not called by create');
  },

  test_that_klass_include_adds_methods_to_the_instance_and_not_the_klass: function(){
    var Truck = new Klass;
    this.assertNotIn('drive',Truck);
    this.assertNotIn('drive',Truck.create());

    Truck.include({drive: function drive(){ return 'driving'; }});
    this.assertNotIn('drive',Truck);
    this.assertIn('drive', Truck.create());

    this.assertEqual('driving', Truck.create().drive());
  },

  test_that_klass_extend_adds_methods_to_the_klass_and_not_the_instance: function(){
    var Boat = new Klass;
    this.assertNotIn('sail',Boat);
    this.assertNotIn('sail',Boat.create());

    Boat.extend({sail: function sail(){ return 'with my flippy floppies'; }});
    this.assertIn('sail',Boat);
    this.assertNotIn('sail', Boat.create());

    this.assertEqual('with my flippy floppies', Boat.sail());
  },

  test_klass_subklasses_contains_all_its_subclasses: function(){
    var Mother = new Klass;
    this.assertEqual(0, Mother.subklasses.length);
    var Son = new Klass(Mother);
    this.assertEqual(1, Mother.subklasses.length);
    this.assertIdentical(Son, Mother.subklasses[0]);
    var Daughter = new Klass(Mother);
    this.assertEqual(2, Mother.subklasses.length);
    this.assertIdentical(Daughter, Mother.subklasses[1]);
  },

  test_subklasses_inherit_methods_of_ancestors: function(){
    var sparky = Dog.create('Sparky');
    this.assertEqual('Sparky', sparky.name);
    var twinkles = Dog.create('Twinkles');
    this.assertEqual('Twinkles', twinkles.name);
  },

  test_sublasses_do_not_inherit_methods_an_acestor_has_deleted: function(){
    var Inocent = new Klass(function CleanSlate(){}),
        victim = Inocent.create(),
        params = Object.keys(victim),
        first_param = params[0], second_param = params[1];

    this.assertIn(first_param, victim);
    this.assertIn(first_param, Inocent.instance.prototype);
    this.assertIdentical(victim[first_param], Inocent.instance.prototype[first_param]);
    delete Inocent.instance.prototype[first_param];
    this.assertNotIn(first_param, victim);
    this.assertNotIn(first_param, Inocent.instance.prototype);

    var CleanSlate = new Klass;
    CleanSlate.instance.prototype = {};
    var empty = CleanSlate.create();
    this.assertHashEqual({}, empty);
  },

  test_that_defineMethod_throws_an_error_when_given_an_unamed_function: function(){
    this.assertRaise('Error',function(){
      new Klass().defineMethod(function(){});
    });
    this.assertRaise('Error',function(){
      new Klass().defineInstanceMethod(function(){});
    });
    this.assertRaise('Error',function(){
      new Klass().defineClassMethod(function(){});
    });
    this.assertRaise('Error',function(){
      new Klass().def(function(){});
    });
  },

  test_that_objects_assigned_to_a_klass_instance_prototype_instantly_populate_to_klass_instances: function(){
    var Dragon = new Klass, puff = Dragon.create(),
        trogdor = Dragon.create(), proto = Dragon.instance.prototype;
    this.assert(!('size' in proto));
    this.assert(!('size' in puff));
    this.assert(!('size' in trogdor));
    proto.size = 'huge';
    this.assertIdentical(proto.size, puff.size);
    this.assertIdentical(proto.size, trogdor.size);
  },

  test_is_a_responds_true_when_given_klass_or_parent_of_klass: function(){
    var fluffy = Cat.create(), poodles = Dog.create();
    this.assert(fluffy.isA(Cat), 'fluffy should be a Cat');
    this.assert(fluffy.isA(Mamal), 'fluffy should be a Mamal');
    this.assert(!fluffy.isA(Dog), 'fluffy should not be a Dog');
    this.assert(poodles.isA(Dog), 'poodles should be a Dog');
    this.assert(poodles.isA(Mamal), 'poodles should be a Mamal');
    this.assert(!poodles.isA(Cat), 'poodles should not be a Cat');
  },

  test_that_methods_can_be_overwriten_with_access_to_super: function(){
    var oboo = Dog.create();
    this.assertEqual(10, oboo.getWeight());
    var laurence = FatDog.create();
    this.assertEqual(25, laurence.getWeight());
  },

  test_that_super_is_only_dynamically_pointed_at_its_ancestrial_counterpart: function(){
    Dog.include({getWeight: function getDogWeight(){ return 50; }});
    var oboo = Dog.create();
    this.assertEqual(50, oboo.getWeight());
    var mittens = Cat.create();
    this.assertEqual(10, mittens.getWeight());
    var laurence = FatDog.create();
    this.assertEqual(65, laurence.getWeight());

    Mamal.defineMethod(function getWeight(){ return 100; });
    var oboo = Dog.create();
    this.assertEqual(50, oboo.getWeight());
    var mittens = Cat.create();
    this.assertEqual(100, mittens.getWeight());
    var laurence = FatDog.create();
    this.assertEqual(65, laurence.getWeight());
  },

  test_that_$super_is_available_via_arguments_callee_$super: function(){
    var test = this,
        Mother = new Klass,
        Son = new Klass(Mother),
        mother_exists = false;

    Mother.defineMethod(function exist(){
      mother_exists = true;
      return 'i execute therefor i am';
    });

    Son.defineMethod(function exist(){
      // test.assertIdentical($super, arguments.callee.getSuper(this))
      return arguments.callee.$super();
    });

    test.assertEqual('i execute therefor i am', Son.create().exist());
    test.assert(mother_exists, 'Mother#exist should have been called');
  },

  test_that_getSuper_raises_when_called_with_no_arguments: function(attribute){

  },


  test_that_methodName_casting_doesnt_affect_original_function: function(){
    var Calc = new Klass([
      function  plusFive(n){ return n + 5; },
      function   plusSix(n){ return n + 6; },
      function plusSeven(n){ return n + 7; },
      function plusEight(n){ return n + 8; }
    ]);

    var c = Calc.create();
    this.assertEqual(10,  c.plusFive(5));
    this.assertEqual(11,   c.plusSix(5));
    this.assertEqual(12, c.plusSeven(5));
    this.assertEqual(13, c.plusEight(5));

    function plusSuperWrapped($super, n){ return $super(n) + 1; };
    function plusSuperUnWrapped(n){ return arguments.callee.$super(n) + 1; };

    var plusSuperWrappedPropertiesLength   = Object.keys(plusSuperWrapped).length,
        plusSuperUnWrappedPropertiesLength = Object.keys(plusSuperUnWrapped).length;

    window.Ti89 = new Klass(Calc, function Transient(){
      return {
        plusFive:  plusSuperWrapped,
        plusSix:   plusSuperWrapped,
        plusSeven: plusSuperUnWrapped,
        plusEight: plusSuperUnWrapped
      };
    });

    var t = Ti89.create();
    this.assertEqual(11,  t.plusFive(5));
    this.assertEqual(12,   t.plusSix(5));
    this.assertEqual(13, t.plusSeven(5));
    this.assertEqual(14, t.plusEight(5));

    this.assertEqual(plusSuperWrappedPropertiesLength, Object.keys(plusSuperWrapped).length);
    this.assertEqual(plusSuperUnWrappedPropertiesLength, Object.keys(plusSuperUnWrapped).length);
  },


  test_that_alias_method_preseves_methos_pointed_to_at_time_of_alias: function(){
    // var Indecisive = new Klass(function Indecisive(){ with(this){
    //
    //   this.isSmiling = false;
    //
    //   def(function smile(){
    //     this.alias
    //   })
    //
    //   return{
    //     isSmiling: false;
    //   }
    //
    // }});
    //

  }

    //
    // Mamal.defineMethod(function getWeight(){
    //   return 5;
    // });
    //
    // var oboo = Dog.create();
    // this.assertEqual(10, oboo.getWeight());
    // var laurence = FatDog.create();
    // this.assertEqual(25, laurence.getWeight());
    //
  // },





});
