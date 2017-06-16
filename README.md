# MockFactory

A jasmine test util that uses a TyoeScript class or an instance of a class to create a mock instance of that class.

## Prerequisite

This util requires [ES6 Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and only contains un-compiled `*.ts` files which must be compiled with a [TypeScript](https://www.typescriptlang.org/) compiler.

## Usage
### Install
`npm install mock-factory --save-dev`

### Import
Import the library with ES6 Module Syntax:
```
import { MockFactory } from 'mock-factory'
```

### Creating a mock

#### From a TypeScript class
```
class SomeClass {
  // This is a typescript class
}

...

const mockObject = MockFactory.create(SomeClass);
```

#### From an instance of a class
```
const someInstance: SomeInterface;

...

const mockObject = MockFactory.create(someInstance);
```

### Using a mock
`MockFactory.create()` will return an object with the same interface as the original object. You can invoke methods and get/set properties on this object. 

 * All the public and private methods will have an empty jasmine.Spy as the initial value. 
 * All the public and private properties will have `undefined` as the initial value.

## Develope
This project is built with [Angular CLI](https://cli.angular.io/)

### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
