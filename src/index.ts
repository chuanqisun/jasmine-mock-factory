export declare type Mock<T> = T & SpyFacade<T>;

export interface SpyFacade<T> {
    _spy: Spied<T> & SpiedAny;
}

export declare type Spied<T> = {
    [K in keyof T]: SpiedMember;
};

export interface SpiedAny {
    [id: string]: SpiedMember;
}

export interface SpiedMember {
    _func: jasmine.Spy;
    _get: jasmine.Spy;
    _set: jasmine.Spy;
}

interface Type<T> extends Function {
    new (...args: any[]): T;
}

class DynamicBase<T extends object> {
    public stubProxy: Mock<T>;
    private stub = Object.create(null);
    private spyProxy: T;
    private spy = Object.create(null);

    // create a spy before it is directly read/written
    private stubProxyHandler = {
        get: (_target: T, propertyName: keyof T, _receiver) => {
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
        set: (_target, propertyName: keyof T, value, _receiver) => {
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
    private spyProxyHanlder = {
        get: (_target: T, propertyName: keyof T, _receiver) => {
            if (typeof propertyName !== 'string') {
                throw Error(`${propertyName.toString()} is a "${typeof propertyName}" named property. Jasmine can only spy "string" so only "string" named properties expose the _spy interface`);
            }

            this.ensureSpy(propertyName);

            return this.spy[propertyName];
        },
        set: (_target, propertyName: keyof T, _value, _receiver) => {
            throw Error(`Cannot change _spy.${propertyName.toString()}, because it is part of the MockFactory`);
        },
    }

    constructor(private prototype: T) {
        this.stubProxy =  new Proxy<Mock<T>>(Object.create(null) as any as Mock<T>, this.stubProxyHandler);
        this.spyProxy = new Proxy(Object.create(null), this.spyProxyHanlder);
    }

    private ensureSpy(propertyName: keyof T & string): void {
        // create spy if needed
        if (!this.spy[propertyName]) {
            try {
                if (typeof this.prototype[propertyName] !== 'function') { // this could throw error on a getter. hence try...catch...
                    // if target is property
                    this.ensureProperty(propertyName);
                } else {
                    // if target is function
                    this.ensureFunction(propertyName);
                }
            } catch (error) {
                /**
                 * assumption: error is thrown only when the property is a getter, because only getters can be invoked.
                 * If the getter reads other properties in the prototype, those properties could be undefined, causing error to be thrown.
                 */
                this.ensureProperty(propertyName);
            }
        }
    }

    private ensureFunction(propertyName: string) {
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

    private ensureProperty(propertyName: string) {
        // we add getters and setters to all properties to make the read and write spy-able
        const descriptor = {
            get: /* istanbul ignore next: Can't reach. spyOnProperty() requires its presence to install spies */ () => {},
            set: /* istanbul ignore next: Can't reach. spyOnProperty() requires its presence to install spies */ (_value) => {},
            enumerable: true,
            configurable: true, // required by spyOnProperty
        };

        Object.defineProperty(this.stub, propertyName, descriptor);

        // by default, let getter spy return whatever setter spy receives
        const getterSpy = spyOnProperty(this.stub, propertyName, 'get').and.callFake(() => this.spy[propertyName]._value);
        const setterSpy = spyOnProperty(this.stub, propertyName, 'set').and.callFake(value => this.spy[propertyName]._value = value);

        this.spy[propertyName] = {
            _value: undefined, // this is not on the public API, because _value will become meaningless once user customizes the spies.
            _get: getterSpy,
            _set: setterSpy,
        }

        Object.defineProperty(this.spy[propertyName], '_func', {
            get: () => { throw Error(`can't get ${propertyName}._func because ${propertyName} is a property. You can config getter/setter spies via ${propertyName}._get and ${propertyName}._set`); },
            set: () => { throw Error(`can't set ${propertyName}._func because ${propertyName} is a property. You can config getter/setter spies via ${propertyName}._get and ${propertyName}._set`); },
        });
    }
}

export class MockFactory {
    /**
     * create a mock object that has the identical interface as the class you passed in
     */
    public static create<T extends object>(blueprint: Type<T> | T): Mock<T> {
        let prototype: T;
        if (blueprint['prototype']) {
            // get the prototype for a TypeScript class
            prototype = blueprint['prototype'];
        } else {
            prototype = blueprint as T;
        }

        const dynamicBase = new DynamicBase(prototype);
        return dynamicBase.stubProxy;
    }
}
