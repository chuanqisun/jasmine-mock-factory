export declare type Mock<T> = T & SpyFacade<T>;

export interface SpyFacade<T> {
    _getSpy(propertyName: keyof T): SpiedMember;
}

export declare type Spied<T> = {
    [K in keyof T]: SpiedMember;
}

export interface SpiedMember {
    _func: jasmine.Spy;
    _get: jasmine.Spy;
    _set: jasmine.Spy;
}

interface Type<T> extends Function {
    new (...args: any[]): T;
}

interface SpyMap {
    [key: string]: jasmine.Spy;
}

interface ValueMap {
    [key: string]: any;
}

class DynamicMockBase<T extends object> {
    public spyFacade = Object.create(null);
    private stub = Object.create(null);

    private spyMap: SpyMap = Object.create(null);
    private valueMap: ValueMap = Object.create(null);
    public handler = {
        get: (target: T, propertyName: keyof T, receiver) => {

            if (propertyName === '_getSpy') {
                return (propertyNameParam) => this.getSpy(propertyNameParam);
            }

            this.initSpy(propertyName);


            return this.stub[propertyName];
        },
        // store whatever user wants in the value map
        set: (target, propertyName: keyof T, value, receiver) => {

            if (propertyName === '_getSpy') {
                throw Error('Cannot modify _getSpy. It is part of the MockFactory');
            }

            this.initSpy(propertyName);

            this.stub[propertyName] = value;

            return true;
        },
    };

    constructor(private prototype: T) {}

    public getSpy(propertyName: keyof T): SpiedMember {
        this.initSpy(propertyName);

        return this.spyFacade[propertyName];
    }

    private initSpy(propertyName: keyof T): void {
        // create spy if needed
        if (!this.spyFacade[propertyName]) {
            // if target is property
            if (typeof this.prototype[propertyName] !== 'function') {
                // TODO __lookupGetter__ and __lookupSetter will be deprecated but Object.getPropertyDesriptor has not arrived.
                // Consider using polyfill to be future proof
                const hasGetter = !!(this.prototype as any).__lookupGetter__(propertyName); // this will lookup inherited getter/setter
                const hasSetter = !!(this.prototype as any).__lookupSetter__(propertyName);
                let descriptor = Object.getOwnPropertyDescriptor(this.prototype, propertyName); // this will return undefined on inherited getter/setter
                if (!descriptor) {
                    descriptor = {
                        value: undefined,
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    };
                } else {
                    descriptor.value = undefined;
                }

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

                this.spyFacade[propertyName] = {
                    _func: undefined,
                    _value: undefined,
                    _get: hasGetter || (descriptor && descriptor.get) ? spyOnProperty(this.stub, propertyName, 'get') : undefined,
                    _set: hasSetter || (descriptor && descriptor.set) ? spyOnProperty(this.stub, propertyName, 'set') : undefined,
                }
            // if target is function
            } else {
                const spy = jasmine.createSpy(propertyName);
                this.stub[propertyName] = spy;
                this.spyFacade[propertyName] = {
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
     * create a mock object that has the identical interface with the class you passed in
     */
    public static create<T extends object>(blueprint: Type<T> | T): Mock<T> {
        let prototype: T;
        if (blueprint['prototype']) {
            prototype = blueprint['prototype'];
        } else {
            prototype = blueprint as T;
        }

        const mockBase = new DynamicMockBase(prototype);
        const proxy = new Proxy<Mock<T>>(mockBase as any as Mock<T>, mockBase.handler);
        return proxy;
    }
}
