export declare type Mock<T> = T & SpyFacade<T>;

export interface SpyFacade<T> {
    _spy: Spied<T>;
}

export declare type Spied<T> = {
    [K in keyof T]: SpiedMember;
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
            throw Error('Cannot modify spies. They are part of the MockFactory');
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
                // TODO __lookupGetter__ and __lookupSetter will be deprecated but Object.getPropertyDesriptor has not arrived.
                // Consider using polyfill to be future proof
                const hasGetter = !!(this.prototype as any).__lookupGetter__(propertyName); // this will lookup inherited getter/setter
                const hasSetter = !!(this.prototype as any).__lookupSetter__(propertyName);
                let descriptor = Object.getOwnPropertyDescriptor(this.prototype, propertyName); // this will return undefined on inherited getter/setter
                descriptor = {
                    value: undefined,
                    writable: true,
                    enumerable: true,
                    configurable: true, // required by spyOnProperty
                };

                if (hasGetter) {
                    descriptor.get = () => {};
                    delete descriptor.value;
                    delete descriptor.writable;
                }

                if (hasSetter) {
                    descriptor.set = (...arg) => {};
                    delete descriptor.value;
                    delete descriptor.writable;
                }

                Object.defineProperty(this.stub, propertyName, descriptor);

                this.spy[propertyName] = {
                    _func: undefined,
                    _get: hasGetter || (descriptor && descriptor.get) ? spyOnProperty(this.stub, propertyName, 'get') : undefined,
                    _set: hasSetter || (descriptor && descriptor.set) ? spyOnProperty(this.stub, propertyName, 'set') : undefined,
                }
            // if target is function
            } else {
                const spy = jasmine.createSpy(propertyName);
                this.stub[propertyName] = spy;
                this.spy[propertyName] = {
                    _func: spy,
                    _get: undefined,
                    _set: undefined,
                };
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
