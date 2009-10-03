Test.Unit.Testcase.prototype.assertIn = function assertIn(param, obj, message){
  message = this.buildMessage(message || 'assertIn', 'object doesn\'t contain key <?>', param);
  this.assertBlock(message, function() { return (param in obj); });
};

Test.Unit.Testcase.prototype.assertNotIn = function assertIn(param, obj, message){
  message = this.buildMessage(message || 'assertIn', 'object does contain key <?>', param);
  this.assertBlock(message, function() { return !(param in obj); });
};

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

Test.Unit.Testcase.prototype.assertNotInheritorOf = function assertInstanceOf(parent, child, message) {
  message = this.buildMessage(message || 'assertInstanceOf', '<?> was an inheritor of the expected type', child);
  this.assertBlock(message, function() {
    if (typeof parent !== 'function'){
      var emptyFunction = function(){};
      emptyFunction.prototype = parent;
      parent = emptyFunction;
    }
    return !(child instanceof parent);
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
  
  test_that_klassname_can_be_set_by_a_string_passed_as_a_definition: function(){
    this.assertEqual('Shoe', Klass.create('Shoe').klass_name);
  },
  
  test_that_klassnames_are_assumed_by_function_definitions_when_possible: function(){
    var MyKlass = Klass.create(function Frog(){});
    this.assertEqual('Frog', MyKlass.klass_name);
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
  
  stupid_commas:function(){}
});
