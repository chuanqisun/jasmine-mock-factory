# Jasmine Mock Factory

[![Build Status](https://api.travis-ci.org/henrysun918/jasmine-mock-factory.svg?branch=master)](https://travis-ci.org/henrysun918/jasmine-mock-factory) [![Coverage Status](https://coveralls.io/repos/github/henrysun918/jasmine-mock-factory/badge.svg?branch=master)](https://coveralls.io/github/henrysun918/jasmine-mock-factory?branch=master)

A Jasmine test util that uses a TypeScript class or an instance of a class to create a mock instance of that class.

## Quick Start

```TypeScript
import { SomeClass } from 'some-library';
import { MockFactory} from 'jasmine-mock-factory';

it('should pass', () => {
    const mockInstance = MockFactory.create(SomeClass);
    mockInstance.doSomething.and.returnValue('awesome!');

    mockInstance.doSomething();  // returns 'awesome!'

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

### Using a mock
`MockFactory.create()` will return an object with the same interface as the original object. You can invoke methods and get/set properties on this object. 

 * All the public and private methods will have a jasmine.Spy as the initial value. The Spy cannot be overwritten.
 * All the public and private properties will have `undefined` as the initial value. The value can be overwritten with anything.
 
### Examples
```TypeScript
class RealClass {
  public doSomething(...arg: any[]) { ... }
  public someProperty = 'whatever';
}

const mockInstance = MockFactory.create(RealClass);

// get, set property
expect(mockInstance.someProperty).toBeUndefined();
mockInstance.someProperty = 'hello';
expect(mockInstance.someProperty).toBe('hello');

// use function spy
expect(mockInstance.doSomething).not.toHaveBeenCalled();

(mockInstance.doSomething as jasmine.Spy).and.returnValue('awesome!');

expect(mockInstance.doSomething(42)).toBe('awesome!');
expect(mockInstance.doSomething).toHaveBeenCalledWith(42);
```

## Develope
This project is built with [Angular CLI](https://cli.angular.io/)

### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
