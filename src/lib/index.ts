export declare type Mock<T> = T & SpyFacade<T>;

export interface SpyFacade<T> {
    _spy: Spied<T> & SpiedAny;
}

export declare type Spied<T> = {
    [K in keyof T]: SpiedMember;
}

export interface SpiedAny {
    [id: string]: SpiedMember
}

export interface SpiedMember {
    _func?: jasmine.Spy;
    _get?: jasmine.Spy;
    _set?: jasmine.Spy;
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
        get: (target: T, propertyName: keyof T, receiver) => {
            if (propertyName === '_spy') {
                return this.spyProxy;
            }

            this.ensureSpy(propertyName);

            return this.stub[propertyName];
        },
        set: (target, propertyName: keyof T, value, receiver) => {
            if (propertyName === '_spy') {
                throw Error('Cannot modify _spy. It is part of the MockFactory');
            }

            if (typeof this.prototype[propertyName] === 'function') {
                throw Error(`Cannot change ${propertyName} function, because MockFactory has already attached a permanent spy to it`)
            }

            this.ensureSpy(propertyName);

            this.stub[propertyName] = value;

            return true;
        },
    };

    // create a spy before it is read from the spyFacade
    private spyProxyHanlder = {
        get: (target: T, propertyName: keyof T, receiver) => {
            this.ensureSpy(propertyName);

            return this.spy[propertyName];
        },
        set: (target, propertyName: keyof T, value, receiver) => {
            throw Error(`Cannot change _spy.${propertyName}, because it is part of the MockFactory`);
        },
    }

    constructor(private prototype: T) {
        this.stubProxy =  new Proxy<Mock<T>>(Object.create(null) as any as Mock<T>, this.stubProxyHandler);
        this.spyProxy = new Proxy(Object.create(null), this.spyProxyHanlder);
    }

    private ensureSpy(propertyName: keyof T): void {
        // create spy if needed
        if (!this.spy[propertyName]) {
            // if target is property
            if (typeof this.prototype[propertyName] !== 'function') {
                // we add getters and setters to all properties to make the read and write spy-able
                const descriptor = {
                    get: /* istanbul ignore next: Can't reach. spyOnProperty() requires its presence to install spies */ () => {},
                    set: /* istanbul ignore next: Can't reach. spyOnProperty() requires its presence to install spies */ (value) => {},
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
                    set: () => { throw Error(`can't set ${propertyName}._func because ${propertyName} is a property. You can config getter/setter spies via ${propertyName}._get and ${propertyName}._set`); }
                });

            // if target is function
            } else {
                const spy = jasmine.createSpy(propertyName);
                this.stub[propertyName] = spy;
                this.spy[propertyName] = {
                    _func: spy,
                    _get: undefined,
                    _set: undefined,
                };

                Object.defineProperty(this.spy[propertyName], '_get', {
                    get: () => { throw Error(`can't get ${propertyName}._get because ${propertyName} is a function. You can config function spy via ${propertyName}._func`); },
                    set: () => { throw Error(`can't set ${propertyName}._get because ${propertyName} is a function. You can config function spy via ${propertyName}._func`); }
                });

                Object.defineProperty(this.spy[propertyName], '_set', {
                    get: () => { throw Error(`can't get ${propertyName}._set because ${propertyName} is a function. You can config function spy via ${propertyName}._func`); },
                    set: () => { throw Error(`can't set ${propertyName}._set because ${propertyName} is a function. You can config function spy via ${propertyName}._func`); }
                });
            }
        }
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
