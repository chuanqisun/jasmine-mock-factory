# Jasmine Mock Factory

[![Build Status](https://api.travis-ci.org/chuanqisun/jasmine-mock-factory.svg?branch=master)](https://travis-ci.org/chuanqisun/jasmine-mock-factory) [![Coverage Status](https://coveralls.io/repos/github/chuanqisun/jasmine-mock-factory/badge.svg?branch=master)](https://coveralls.io/github/chuanqisun/jasmine-mock-factory?branch=master)

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
## Quick reference
```TypeScript
  /* create a mock from a class*/
  const mockInstance1 = MockFactory.create(RealClass);

  /* create a mock from an instance*/
  const mockInstance2 = MockFactory.create(realInstance);

  /* access a function spy */
  const spy1 = mockInstance._spy.functionName._func

  /* access a getter spy */
  const spy2 = mockInstance._spy.propertyName._get

  /* access a setter spy */
  const spy3 = mockInstance._spy.propertyName._set
```

## Prerequisite

This util is built with and for [Jasmine](https://jasmine.github.io/) test framework. Basic understanding of Jasmine is assumed.

This util requires [ES6 Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and only contains `*.ts` files that must be compiled with a [TypeScript](https://www.typescriptlang.org/) compiler.


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

#### From window objects
```TypeScript
/* make sure you have included dom types from the TypeScript library */
const mockWindow  = MockFactory.create(window);
const mockDocument = MockFactory.create(document);
const mockLocation = MockFactory.create(location);
```

### Using a mock
 * `MockFactory.create()` will return an object with the same interface as the real object. You can invoke functions and access properties on this object.
 * In addition, the mock object provides a `_spy` facade, where you can access and config spies on functions and properties.
```TypeScript
  const mockInstance = MockFactory.create(location);
  mockInstance.reload(); // use it as if it were the real window.location
  let temp = mockInstance.search; // use it as if it were the real window.search
  mockInstance.hash = 'myHash'; // use it as if it were the real window.hash
  mockInstance._spy.reload._func; // returns the spy behind location.reload
  mockInstance._spy.search._get; // returns the spy behind the getter for location.search
  mockInstance._spy.hash._set; // returns the spy behind the setter for location.hash
```

#### Invoking functions
 * All functions will have a `jasmine.Spy` as the initial value. The spy cannot be overwritten and returns `undefined` by default.
 * To access protected and private functions, cast the mockInstance `as any` or use bracket notation.
```TypeScript
  mockInstance.publicFunction(42); // the spy behind it is invoked with 42

  (mockInstance as any).privateFunction(42);
  mockInstance['privateFunction'](42); // equivalent
```

#### Spying/stubbing functions
 * You can change return values of functions or assert their calls by accessing them directly or through the `_spy` facade.
 * Access a function spy on `mockInstance._spy.functionName._func`.
 ```TypeScript
   /* stubbing a public function */
   mockInstance._spy.publicFunction._func.and.returnValue(42);
   (mockInstance.publicFunction as jasmine.Spy).and.returnValue(42); // equivalent, but not recommented because it requires casting

   /* stubbing a private function */
   mockInstance._spy.privateFunction._func.and.returnValue(42);
   ((mockInstance as any).privateFunction as jasmine.Spy).and.returnValue(42); // equivalent, but not recommented because it requires casting twice
```

#### Accessing properties
 * All properties have `undefined` as the initial value. The value can be overwritten with anything.
 * You have read and write access to any property, even if they were readonly in the real object.
 * To read or write a protected or private property, cast the mockInstance `as any` or use bracket notation.
 * To write a readonly property, cast the mockInstance `as any`. The bracket notation won't work.
 * By default, modification to the properties will persist, even if a getter or setter exists in the real object.
```TypeScript
  /* persist modification */
  mockInstance.publicProperty = 42;
  let temp = mockInstance.publicProperty; // temp = 42;

  /* access readonly property */
  mockInstance.readonlyProperty = 42; // typescript compiler error
  (mockInstance as any).readonlyProperty = 42; // no problem
  mockInstance['readonlyProperty'] = 42; // typescript compiler error

  /* access private property */
  (mockInstance as any).privateProperty = 'foo';
  mockInstance['privateProperty'] = 'foo'; // equivalent
```

#### Spying/stubbing getters and setters
 * All properties have spies on the getter and setter, even if the getter and setter don't exist in the real object.
 * Access a getter spy on `mockInstance._spy.propertyName._get`.
 * Access a setter spy on `mockInstance._spy.propertyName._set`.
 * NOTE: modification to the properties will not persist after getter or setter spies are customized
 * NOTE: `expect(mockInstance.someProperty).toBe(...)` will trigger `mockInstance._spy.someProperty._get`. Design the sequence of your assertions carefully to avoid shooting yourself in the foot.
```TypeScript
  /* assert getter calls */
  let temp = mockInstance.publicProperty;
  expect(mockInstance._spy.publicProperty._get).toHaveBeenCalled();

  /* assert setter calls on a public property */
  mockInstance.publicProperty = 42;
  expect(mockInstance._spy.publicProperty._set).toHaveBeenCalledWith(42);

  /* customize setter */
  expect(mockInstance.publicProperty).toBe(42); // pass. setter hasn't been customized
  mockInstance._spy.publicProperty._set.and.callFake(() => { /* noop */});
  mockInstance.publicProperty = 100;
  expect(mockInstance.publicProperty).toBe(100); // fail. expect 42 to be 100. setter was customized

  /* assert setter calls on a private property */
  mockInstance['privateProperty'] = 42;
  expect(mockInstance._spy.privateProperty._set).toHaveBeenCalledWith(42);

  /* customize getter */
  expect(mockInstance['privateProperty']).toBe(42); // pass. getter hasn't been customized
  mockInstance._spy.privateProperty._get.and.returnValue(100);
  mockInstance['privateProperty'] = 42;
  expect(mockInstance['privateProperty']).toBe(42); // fail, expect 100 to be 42. getter was customzied
```

## Develope
This project is built with [Angular CLI](https://cli.angular.io/)

### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
