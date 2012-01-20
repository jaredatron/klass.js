context = describe;

describe("Klass", function() {

  beforeEach(function() {
    this.addMatchers({
      toBeA: function(expected) {
        return this.actual instanceof expected;
      }
    });
  });

  afterEach(function() {
    if (window.Foo) delete window.Foo;
  });

  it("should exist", function() {
    expect(window.Klass).toBeTruthy();
    expect(Klass).toBeTruthy();
    expect(Klass).toBeA(Function);
  });

  context("when given a name", function() {

    it("should create a global object of that name", function() {
      Klass('Foo')
      expect(Foo).toBeTruthy();
      Klass('Foo.Bar')
      expect(Foo.Bar).toBeTruthy();
    });

    it("should throw a doesn not exist TypeError", function() {
      expect(function(){ Klass('I.Dont.Exist') }).toThrow(new TypeError('I is not defined'));
      I = {};
      expect(function(){ Klass('I.Dont.Exist') }).toThrow(new TypeError('Dont is not defined'));
      I.Dont = {};
      expect(function(){ Klass('I.Dont.Exist') }).not.toThrow();
    });

  });

  context("when given a function as an extension", function() {
    it("should call that function on the new klass prototype", function() {
      var scope;
      Klass('Foo', function(){ scope = this });
      expect(scope).toBe(Foo.prototype);
    });
  });

  context("when given an object as an extension", function() {
    it("should extend the klass prototype the properties of that object", function() {
      Klass('Foo', {a:42});
      expect(Foo.create().a).toBe(42);
    });
  });

  context("when given a superklass", function() {
    beforeEach(function() {
      Klass('Foo');
      Klass('Bar', Foo);
    });
    it("should set superklass as it's superclass", function() {
      expect(Bar.superklass).toBe(Foo);
    });
  });

  describe("#$super", function(){
    it("should should work", function() {
      var A, B, C;
      A = Klass(function() {
        this.concat = function(content){
          return "A:"+content;
        }
      });
      B = Klass(A, function() {
        this.concat = function(content){
          return this.$super('concat', "B:"+content);
        }
      });
      C = Klass(B, function() {
        this.concat = function(content){
          return this.$super('concat', "C:"+content);
        }
      });
      expect(C.create().concat('BOOSH')).toEqual('A:B:C:BOOSH');
    });
    it("should detect argument objects", function() {
      var A, B, C;
      A = Klass(function() {
        this.concat = function(a,b,c){
          return [a,b,c];
        }
      });
      B = Klass(A, function() {
        this.concat = function(a,b,c){
          return this.$super('concat', arguments);
        }
      });
      C = Klass(B, function() {
        this.concat = function(a,b,c){
          return this.$super('concat', a, b, c);
        }
      });
      D = Klass(C, function() {
        this.concat = function(a,b,c){
          return this.$super('concat', [a, b, c]);
        }
      });
      expect(B.create().concat('x','y','z')).toEqual(['x','y','z']);
      expect(C.create().concat('x','y','z')).toEqual(['x','y','z']);
      expect(D.create().concat('x','y','z')).toEqual([['x','y','z'], undefined, undefined]);
    });
  });

  describe("inheritance", function() {
    it("should inherit class and instance properties", function() {
      Klass('A')
      A.aClassProperty = 'aClassProperty';
      A.aClassFunction = function(){};
      A.prototype.anInstanceProperty = 'aClassProperty';
      A.prototype.anInstanceFunction = function(){};
      Klass('B', A);

      expect(B.aClassProperty).toBe(A.aClassProperty);
      expect(B.aClassFunction).toBe(A.aClassFunction);
      expect(B.create().anInstanceProperty).toBe(A.prototype.anInstanceProperty);
      expect(B.create().anInstanceFunction).toBe(A.prototype.anInstanceFunction);
    });
  });

  describe("attr", function() {
    beforeEach(function() {
      Klass('Can');
      Can.attr('sizes');
      Can.prototype.attr('size');
    });
    afterEach(function() {
      delete window.Can;
      expect('sizes' in Can).toBe(true);
    });

  });



});
