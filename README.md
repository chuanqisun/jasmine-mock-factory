# Jasmine Mock Factory

[![Build Status](https://api.travis-ci.org/henrysun918/jasmine-mock-factory.svg?branch=master)](https://travis-ci.org/henrysun918/jasmine-mock-factory) [![Coverage Status](https://coveralls.io/repos/github/henrysun918/jasmine-mock-factory/badge.svg?branch=master)](https://coveralls.io/github/henrysun918/jasmine-mock-factory?branch=master)

A Jasmine test util that uses a TypeScript class or an instance of a class to create a mock instance of that class.

## Quick Start

```TypeScript
import { SomeClass } from 'some-library';
import { MockFactory} from 'jasmine-mock-factory';

it('should pass', () => {
    const mockInstance = MockFactory.create(SomeClass);

    /* arrange */
    mockInstance._spy.doSomething._func.and.returnValue('awesome!');

    /* act */
    mockInstance.doSomething();  // returns 'awesome!'

    /* assert */
    expect(mockInstance.doSomething).toHaveBeenCalled();
}
```

## Prerequisite

This util is built with and for [Jasmine](https://jasmine.github.io/) test framework. Basic understanding of Jasmine is assumed.

This util requires [ES6 Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and only contains un-compiled `*.ts` files which must be compiled with a [TypeScript](https://www.typescriptlang.org/) compiler.



## Usage
### Install
```Shell
npm install jasmine-mock-factory --save-dev
```

### Import
Import the library with ES6 Module Syntax:
```TypeScript
import { MockFactory } from 'jasmine-mock-factory'
```

### Creating a mock

#### From a TypeScript class
```TypeScript
class RealClass {
  // This is a typescript class
}

...

const mockInstance = MockFactory.create(RealClass);
```

#### From an instance of a class
```TypeScript
const realInstance: RealInterface = new RealClass();

...

const mockInstance = MockFactory.create(realInstance);
```

#### From window object
```TypeScript
/* make sure you have included dom types from the TypeScript library */
const mockWindow  = MockFactory.create(window);
const mockDocument = MockFactory.create(document);
const mockLocation = MockFactory.create(location);
```

### Using a mock
 * `MockFactory.create()` will return an object with the same interface as the real object. You can invoke methods and access properties on this object.
 * In addition, the mock object provides a `_spy` facade, where you can access and config spies on functions and properties.
```TypeScript
  const mockInstance = MockFactory.create(location);
  mockInstance.reload(); // use it as if it were the real window.location
  mockInstance._spy.reload._func; // returns the spy behind location.reload
  mockInstance._spy.search._get; // returns the spy behind the getter for location.search
```

#### Invoking functions
 * All methods will have a jasmine.Spy as the initial value. The Spy cannot be overwritten and returns `undefined` by default.
 * To access protected and private functions, cast the mockInstance `as any` or using bracket notation.
```TypeScript
  mockInstance.publicMethod(42); // the spy behind it is invoked with 42

  (mockInstance as any).privateMethod(42);
  mockInstance['privateMethod'](42);
```

#### Spying/stubbing functions
 * You can change return values of functions or assert their calls by accessing them directly or throught the `_spy` facade.
 * To access a function spy, call `mockInstance._spy.functionName._func`.
 ```TypeScript
   (mockInstance.publicMethod as jasmine.Spy).and.returnValue(42); // it works, but requires casting
   mockInstance._spy.publicMethod._func.and.returnValue(42); // recommended!

   ((mockInstance as any).privateMethod as jasmine.Spy).and.returnValue(42); // it works, but requires two castings
   mockInstance._spy.privateMethod._func.and.returnValue(42); // recommended!
```

#### Accessing properties
 * All properties have `undefined` as the initial value. The value can be overwritten with anything.
 * You can read and write access to any property, even if they were readonly in the real object.
 * To read or write value on a protected or private properties, cast the mockInstance `as any` or using bracket notation.
 * To write value on a readonly property, cast the mockInstance `as any`. Note that bracket notation won't work.
 * By default, modification to the properties will be preserved, even if a getter or setter was used in the real object.
```TypeScript
  mockInstance.publicProperty = 42;
  let temp = mockInstance.publicProperty; // temp = 42;

  mockInstance.readonlyProperty = 42; // typescript compiler error
  (mockInstance as any).readonlyProperty = 42; // no problem
  mockInstance['readonlyProperty'] = 42; // typescript compiler error

  (mockInstance as any).privateProperty = 'foo';
  mockInstance['privateProperty'] = 'foo'; // equivalent to above
```

#### Spying/stubbing getters and setters
 * All properties have spies on the getter and setter, even if they weren't in the real object.
 * To access a getter spy, call `mockInstance._spy.property._get`.
 * To access a setter spy, call `mockInstance._spy.property._set`.
 * NOTE: modification to the properties will not be preserved after getter or setter spies are customized
 * NOTE: `expect(mockInstance.someProperty).toBe(...)` will trigger `mockInstance._spy.someProperty._get`. Design the sequence of your assertions to avoid stepping on your own foot.
```TypeScript
  let temp = mockInstance.publicProperty;
  expect(mockInstance._spy.publicProperty._get).toHaveBeenCalled();

  mockInstance.publicProperty = 42;
  expect(mockInstance._spy.publicProperty._set).toHaveBeenCalledWith(42);
  expect(mockInstance.publicProperty).toBe(42); // pass
  mockInstance._spy.publicProperty._set.and.callFake(() => { /* noop */});
  mockInstance.publicProperty = 100;
  expect(mockInstance.publicProperty).toBe(100); // fail. setter has been customized

  mockInstance['privateProperty'] = 100;
  expect(mockInstance._spy.privateProperty._set).toHaveBeenCalledWith(100);
  expect(mockInstance['privateProperty']).toBe(100); // pass
  mockInstance._spy.privateProperty._get.and.returnValue(42);
  mockInstance['privateProperty'] = 100;
  expect(mockInstance['privateProperty']).toBe(100); // fail. getter has been customzied
```

## Develope
This project is built with [Angular CLI](https://cli.angular.io/)

### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
