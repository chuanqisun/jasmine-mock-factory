"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DynamicBase {
    constructor(prototype) {
        this.prototype = prototype;
        this.stub = Object.create(null);
        this.spy = Object.create(null);
        // create a spy before it is directly read/written
        this.stubProxyHandler = {
            get: (_target, propertyName, _receiver) => {
                if (propertyName === '_spy') {
                    return this.spyProxy;
                }
                if (typeof propertyName !== 'string') {
                    console.warn(`${propertyName.toString()} is a "${typeof propertyName}" type property. Jasmine can only spy "string" named properties so getting ${propertyName.toString()} will return undefined`);
                    return;
                }
                this.ensureSpy(propertyName);
                return this.stub[propertyName];
            },
            set: (_target, propertyName, value, _receiver) => {
                if (propertyName === '_spy') {
                    throw Error('Cannot modify _spy. It is part of the MockFactory');
                }
                if (typeof propertyName !== 'string') {
                    console.warn(`${propertyName.toString()} is a "${typeof propertyName}" type property. Jasmine can only spy "string" named properties so setting ${propertyName.toString()} will be ignored`);
                    return true;
                }
                if (typeof this.prototype[propertyName] === 'function') {
                    throw Error(`Cannot change ${propertyName} function, because MockFactory has already attached a permanent spy to it`);
                }
                this.ensureSpy(propertyName);
                this.stub[propertyName] = value;
                return true;
            },
        };
        // create a spy before it is read from the spyFacade
        this.spyProxyHanlder = {
            get: (_target, propertyName, _receiver) => {
                if (typeof propertyName !== 'string') {
                    throw Error(`${propertyName.toString()} is a "${typeof propertyName}" named property. Jasmine can only spy "string" so only "string" named properties expose the _spy interface`);
                }
                this.ensureSpy(propertyName);
                return this.spy[propertyName];
            },
            set: (_target, propertyName, _value, _receiver) => {
                throw Error(`Cannot change _spy.${propertyName.toString()}, because it is part of the MockFactory`);
            },
        };
        this.stubProxy = new Proxy(Object.create(null), this.stubProxyHandler);
        this.spyProxy = new Proxy(Object.create(null), this.spyProxyHanlder);
    }
    ensureSpy(propertyName) {
        // create spy if needed
        if (!this.spy[propertyName]) {
            try {
                if (typeof this.prototype[propertyName] !== 'function') { // this could throw error on a getter. hence try...catch...
                    // if target is property
                    this.ensureProperty(propertyName);
                }
                else {
                    // if target is function
                    this.ensureFunction(propertyName);
                }
            }
            catch (error) {
                /**
                 * assumption: error is thrown only when the property is a getter, because only getters can be invoked.
                 * If the getter reads other properties in the prototype, those properties could be undefined, causing error to be thrown.
                 */
                this.ensureProperty(propertyName);
            }
        }
    }
    ensureFunction(propertyName) {
        const spy = jasmine.createSpy(propertyName);
        this.stub[propertyName] = spy;
        this.spy[propertyName] = {
            _func: spy,
            _get: undefined,
            _set: undefined,
        };
        Object.defineProperty(this.spy[propertyName], '_get', {
            get: () => { throw Error(`can't get ${propertyName}._get because ${propertyName} is a function. You can config function spy via ${propertyName}._func`); },
            set: () => { throw Error(`can't set ${propertyName}._get because ${propertyName} is a function. You can config function spy via ${propertyName}._func`); },
        });
        Object.defineProperty(this.spy[propertyName], '_set', {
            get: () => { throw Error(`can't get ${propertyName}._set because ${propertyName} is a function. You can config function spy via ${propertyName}._func`); },
            set: () => { throw Error(`can't set ${propertyName}._set because ${propertyName} is a function. You can config function spy via ${propertyName}._func`); },
        });
    }
    ensureProperty(propertyName) {
        // we add getters and setters to all properties to make the read and write spy-able
        const descriptor = {
            get: /* istanbul ignore next: Can't reach. spyOnProperty() requires its presence to install spies */ () => { },
            set: /* istanbul ignore next: Can't reach. spyOnProperty() requires its presence to install spies */ (_value) => { },
            enumerable: true,
            configurable: true,
        };
        Object.defineProperty(this.stub, propertyName, descriptor);
        // by default, let getter spy return whatever setter spy receives
        const getterSpy = spyOnProperty(this.stub, propertyName, 'get').and.callFake(() => this.spy[propertyName]._value);
        const setterSpy = spyOnProperty(this.stub, propertyName, 'set').and.callFake(value => this.spy[propertyName]._value = value);
        this.spy[propertyName] = {
            _value: undefined,
            _get: getterSpy,
            _set: setterSpy,
        };
        Object.defineProperty(this.spy[propertyName], '_func', {
            get: () => { throw Error(`can't get ${propertyName}._func because ${propertyName} is a property. You can config getter/setter spies via ${propertyName}._get and ${propertyName}._set`); },
            set: () => { throw Error(`can't set ${propertyName}._func because ${propertyName} is a property. You can config getter/setter spies via ${propertyName}._get and ${propertyName}._set`); },
        });
    }
}
class MockFactory {
    /**
     * create a mock object that has the identical interface as the class you passed in
     */
    static create(blueprint) {
        let prototype;
        if (blueprint['prototype']) {
            // get the prototype for a TypeScript class
            prototype = blueprint['prototype'];
        }
        else {
            prototype = blueprint;
        }
        const dynamicBase = new DynamicBase(prototype);
        return dynamicBase.stubProxy;
    }
}
exports.MockFactory = MockFactory;
//# sourceMappingURL=index.js.map