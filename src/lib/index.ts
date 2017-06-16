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
    private spyMap: SpyMap = Object.create(null);
    private valueMap: ValueMap = Object.create(null);
    public handler = {
        get: (target: T, propertyName: keyof T, receiver) => {
                // trying to get a property, return value from valueMap.
                if (typeof this.prototype[propertyName] !== 'function') {
                    return this.valueMap[propertyName];
                }

                // trying to get a function, if we haven't created the spy, create one
                if (!this.spyMap[propertyName]) {
                    const spy = jasmine.createSpy(propertyName);
                    this.spyMap[propertyName] = spy;
                }

                return this.spyMap[propertyName];
        },
        // store whatever user wants in the value map
        set: (target, propertyName: keyof T, value, receiver) => {
            if (typeof this.prototype[propertyName] === 'function') {
                throw Error(`Assignment not allowed because ${propertyName} is already a spied function`);
            }

            this.valueMap[propertyName] = value;
            return true;
        },
    };

    constructor(private prototype: T) {}
}

export class MockFactory {
    /**
     * create a mock object that has the identical interface with the class you passed in
     */
    public static create<T extends object>(blueprint: Type<T> | T) {
        let prototype: T;
        if (blueprint['prototype']) {
            prototype = blueprint['prototype'];
        } else {
            prototype = Object.getPrototypeOf(blueprint);
        }

        const mockBase = new DynamicMockBase(prototype);
        return new Proxy<T>(mockBase as any as T, mockBase.handler);
    }
}
