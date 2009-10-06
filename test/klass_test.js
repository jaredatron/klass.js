Test.Unit.Testcase.prototype.assertInheritorOf = function assertInstanceOf(parent, child, message) {
  message = this.buildMessage(message || 'assertInstanceOf', '<?> was not an inheritor of the expected type', child);
  this.assertBlock(message, function() {
    if (typeof parent !== 'function'){
      var emptyFunction = function(){};
      emptyFunction.prototype = parent;
      parent = emptyFunction;
    }
    return (child instanceof parent);
  });
};

new Test.Unit.Runner({

  test_that_klass_create_returns_an_instance_of_klass: function(){
    this.assertInheritorOf(Klass, Klass.create());
  },

  test_that_klass_throws_an_error_when_not_given_an_object_that_extends_from_klass: function(){
    this.assertRaise('Error', function(){
      klass();
    });
    this.assertRaise('Error', function(){
      klass({});
    });
    this.assertRaise('Error', function(){
      klass(function(){});
    });
    this.assertNothingRaised(function(){
      klass(Klass.create());
    });
  },

  test_that_calling_klass_on_a_klass_extends_that_klass: function(){
    var Frog = Klass.create();
    var numbers = [4,5,6];
    klass(Frog,{
      numbers:numbers
    });
    this.assertEqual(numbers, Frog.create().numbers);
  },


  test_that_creating_a_klass_without_inheritance_sets_superklass_Klass: function(){
    this.assertEqual(Klass, Klass.create().superklass);
  },

  test_that_when_klass_name_is_set_toString_reflects_that: function(){
    var Frog = Klass.create();
    Frog.klass_name = 'Frog';
    this.assertEqual("[object Frog]", Frog.toString());
    this.assertEqual("[object Frog:instance]", Frog.create().toString());
    this.assertEqual("[object Object]", Frog.prototype.toString());
  },

  test_that_new_klasses_are_pushed_onto_their_superklasses_subklasses_array: function(){
    var Frog = Klass.create();
    this.assertEqual(Klass.subklasses.last(), Frog);
    var BigFrog = Klass.create(Frog);
    this.assertNotEqual(Klass.subklasses.last(), BigFrog);
    this.assertEqual(Frog.subklasses.last(), BigFrog);
  },

  test_that_infered_klass_names_are_capitolized: function(){
    this.assertEqual('LowerCase', Klass.create('lowerCase').klass_name);
    this.assertEqual('LowerCase', Klass.create(function(lowerCase){}).klass_name);
  },

  test_that_klass_names_defined_with_a_string_do_not_have_invalid_charactors: function(){
    this.assertEqual('LowerCase', Klass.create('lowerCase').klass_name);
    this.assertEqual('LowerCase', Klass.create(function(lowerCase){}).klass_name);
    this.assertEqual(undefined, Klass.create('with spaces').klass_name);
  },

  test_that_creating_a_klass_with_inheritance_sets_superklass_to_the_given_klass: function(){
    var Frog = Klass.create();
    var BigFrog = Klass.create(Frog);
    this.assertEqual(Frog, BigFrog.superklass);
  },

  test_that_when_instantiating_a_klass_instance_its_klass_value_is_set_to_its_parent_klass: function(){
    var Frog = Klass.create();
    this.assertEqual(Frog, Frog.create().klass);
  },

  test_that_Klass_Create_extends_new_klass_with_given_definitions: function(){
    var Frog = Klass.create({lives:'free'},{all:'the time'});
    this.assertEqual('free', Frog.create().lives);
    this.assertEqual('the time', Frog.create().all);
  },

  test_that_klass_definitions_can_be_functions: function(){
    var Frog = Klass.create(function Frog(Frog,Instance){
      this.loves = 'cheese';
      Frog.killAll = function(){return 'dead frogs';};
      Instance.poops = true;
      return {fun:'times'};
    });

    this.assertEqual('cheese', Frog.loves);
    this.assertEqual('dead frogs', Frog.killAll());
    this.assert(Frog.create().poops);
    this.assertEqual('times', Frog.create().fun);
  },

  test_that_klass_name_can_be_set_by_a_string_passed_as_a_definition: function(){
    this.assertEqual('Shoe', Klass.create('Shoe').klass_name);
  },

  test_that_klass_names_are_assumed_by_function_definitions_when_possible: function(){
    var MyKlass = Klass.create(function(Donkey){});
    this.assertEqual('Donkey', MyKlass.klass_name);
  },

  test_that_klass_definition_functions_are_passed_the_klass_and_prototype_objects: function(){
    var the_this, the_klass, the_instance;
    var Building = Klass.create(function(Building, instance){
      the_this = this;
      the_klass = Building;
      the_instance = instance;
    });
    this.assertEqual(the_this, Building);
    this.assertEqual(the_klass, Building);
    this.assertEqual(the_this.prototype, Building.prototype);
    this.assertEqual(the_instance, Building.prototype);
  },

  test_that_modification_to_parent_klass_are_reflected_in_child_klass: function(){
    // class level inheritence
    var Parent = Klass.create('Parent');
    var Child = Klass.create(Parent, 'Child');
    Parent.find_all = 'finding...';
    this.assertEqual('finding...', Child.find_all);

    // instance level inheritence
    var Bruce = Parent.create();
    var Billy = Child.create();
    Parent.prototype.race = 'spanish';
    this.assertEqual('spanish', Billy.race);

    Klass.status = 'free';
    this.assertEqual('free', Parent.status);
    this.assertEqual('free', Child.status);
  },

  test_that_klass_prototype_initialize_gets_run_when_instances_are_created: function(){
    var Car = Klass.create({
      initialize: function(color, size){
        this.color = color;
        this.size = size;
      }
    });
    var red_car = Car.create('red', 15);
    this.assertEqual('red', red_car.color);
    this.assertEqual(15, red_car.size);
  },

  test_that_klass_prototype_initialize_is_passed_arguments_correctly: function(){
    var Car = Klass.create({
      initialize: function(){
        this.init_was_run = 'yep';
      }
    });
    this.assertEqual('yep', Car.create().init_was_run);
  },

  test_that_klass_extend_method_extends_the_klass_object: function(){
    var Table = Klass.create();
    Table.extend({build:'building'});
    this.assertEqual('building', Table.build);
  },
  test_that_klass_include_method_extends_the_klass_prototype_object: function(){
    var Table = Klass.create();
    Table.include({legs:4});
    this.assertEqual(4, Table.create().legs);
  },
  test_that_klass_intance_extend_method_extends_the_klass_object: function(){
    var Table = Klass.create();
    var end_table = Table.create();
    end_table.extend({has_lamp:'oooh yeah'});
    this.assertEqual('oooh yeah', end_table.has_lamp);
  },

  test_that_Klass_instance_isA_works: function(){
    var LifeForm = Klass.create();
    var Animal = Klass.create(LifeForm);
    var Insect = Klass.create(LifeForm);
    var Dog = Klass.create(Animal);
    var Cockroach = Klass.create(Insect);

    this.assert(Dog.create().isA(LifeForm));
    this.assert(Dog.create().isA(Animal));
    this.assert(!Dog.create().isA(Insect));

    this.assert(Cockroach.create().isA(LifeForm));
    this.assert(Cockroach.create().isA(Insect));
    this.assert(!Cockroach.create().isA(Animal));
  },

  test_that_Function_super_throws_error_when_called_out_of_klass_context: function(){
    this.assertRaise('TypeError', function(){
      arguments.callee.$super();
    });
    this.assertRaise('Error', function(){
      arguments.callee.$super({});
    });

    var Dog = Klass.create({
      run: function(){
        return 'running';
      }
    });

    var BigDog = Klass.create(Dog, {
      run: function(){
        return arguments.callee.$super(this)+' fast';
      }
    });

    this.assertNothingRaised(function(){
      BigDog.create().run();
    });
    this.assertEqual('running fast', BigDog.create().run());

    Dog.callAll = function(){ return 24; };
    BigDog.callAll = function(){
      return arguments.callee.$super(this) - 10;
    };

    this.assertNothingRaised(function(){
      BigDog.callAll();
    });
    this.assertEqual(14, BigDog.callAll());

  },

  test_that_super_throws_an_error_when_a_super_method_doesnt_exist: function(){
    var Hero = Klass.create({
      fly: function(){
        return arguments.callee.$super(this);
      }
    });

    this.assertRaise('NoSuperError', function(){
      Hero.create().fly();
    });

    Hero.breed = function(){
      return arguments.callee.$super(this);
    };

    this.assertRaise('NoSuperError', function(){
      Hero.breed();
    });
  },

  // rename this test its not exactly how it works
  test_that_super_traverses_past_a_non_matching_parent_all_the_way_to_klass: function(){

    var GrandChild = Klass.create(Klass.create(Klass.create(Klass.create(Klass.create()))));
    this.assertEqual(Klass, GrandChild.superklass.superklass.superklass.superklass.superklass);
    Klass.pumpIt = function(){ return 'pumping'; };
    this.assertEqual('pumping', GrandChild.pumpIt());

    GrandChild.pumpIt = function(){ return arguments.callee.$super(this)+' it hard core'; };
    this.assertEqual('pumping it hard core', GrandChild.pumpIt());
  },

  test_that_super_takes_arguments_properly: function(){
    var Daddy = Klass.create({
      agePlus: function(n){ return 45 + n;}
    });
    this.assertEqual(55, Daddy.create().agePlus(10));

    var Baby = Klass.create(Daddy, {
      agePlus: function(n){ return arguments.callee.$super(this, [(n - 20)]); }
    });
    this.assertEqual(35, Baby.create().agePlus(10));

    Daddy.update = function(value){ return value+' UPDATED'; };
    Baby.update = function(value){ return arguments.callee.$super(this, [value]); };
    this.assertEqual('TPS Reports UPDATED', Baby.update('TPS Reports'));

  },

  test_that_alias_method_works: function(){

    var Country = Klass.create(function Country(){
      this.count = function(){ return 5; };
      this.aliasMethod('size', 'count');

      this.prototype.war = function(){ return 'waring'; };
      this.prototype.aliasMethod('fight', 'war');
    });
    this.assertEqual(5, Country.count());
    this.assertEqual(5, Country.size());
    this.assertEqual('waring', Country.create().war());
    this.assertEqual('waring', Country.create().fight());
  },

  test_that_aliased_methods_are_not_overwrited_when_the_original_method_is: function(){
    var Container = Klass.create(function(){
      this.find = function(){ return 12; };
    });
    this.assertEqual(12, Container.find());

    var Bucket = Klass.create(Container, function(){
      this.aliasMethod('lookFor', 'find');
      this.find = function(){ return 40; };
    });
    this.assertEqual(12, Bucket.lookFor());
    this.assertEqual(40, Bucket.find());

  },

  test_that_alias_method_calls_the_right_super_method: function(){
    var Animal = Klass.create({
      speak: function(words){ return words; }
    });
    var Dog = Klass.create(Animal, function Dog(){
      this.prototype.speak = function(words){
        return arguments.callee.$super(this, ['WOOF '+words+' WOOF']);
      };
      this.prototype.aliasMethod('bark','speak');
    });
    this.assertEqual('WOOF ball? WOOF', Dog.create().bark('ball?'));
  },

  test_that_get_super_works: function(){
    var Parent = Klass.create(function (Parent){
      Parent.comeHere = function comeHere1(){ return 'coming'; };
      function call1(){ return 'yes?'; }
      return {call:call1};
    });

    var Father = Klass.create(Parent, function (Father){
      Father.comeHere = function comeHere2(){
        var $super = arguments.callee.getSuper(this);
        return 'father is '+$super();
      };
      function call2(){
        var $super = arguments.callee.getSuper(this);
        return $super()+' what?';
      }
      function brandNew(){
        return arguments.callee.getSuper(this).apply(this,arguments);
      };
      return {call:call2, brandNew:brandNew};
    });

    this.assertEqual('father is coming', Father.comeHere());
    this.assertEqual('yes? what?', Father.create().call());
    this.assertRaise('TypeError', function(){
      Father.create().brandNew();
    });
  },

  test_that_get_super_works_for_aliased_methods: function(){
    var Parent = Klass.create(function (Parent){
      Parent.comeHere = function comeHere1(){ return 'coming'; };
      function call1(){ return 'yes?'; }
      return {call:call1};
    });

    var Father = Klass.create(Parent, function (Father){
      Father.comeHere = function comeHere2(){
        var $super = arguments.callee.getSuper(this);
        return 'father is '+$super();
      };
      Father.aliasMethod('getOverHere','comeHere');
      function call2(){
        var $super = arguments.callee.getSuper(this);
        return $super()+' what?';
      }
      function brandNew(){
        return arguments.callee.getSuper(this).apply(this,arguments);
      };
      return {call:call2, brandNew:brandNew};
    });

    klass(Father, function(){ with(this.prototype){
      aliasMethod('getOverHere','comeHere');
      aliasMethod('summon','call');
      aliasMethod('fresh','brandNew');
    }});

    this.assertEqual('father is coming', Father.getOverHere());
    this.assertEqual('yes? what?', Father.create().summon());
    this.assertRaise('TypeError', function(){
      Father.create().fresh();
    });
  }

});
