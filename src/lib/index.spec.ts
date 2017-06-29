// -----------------------------------------------------------------------
// <copyright company='Microsoft Corporation'>
//   Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

import { MockFactory, Mock } from './index';

interface IBaseClass {
    publicProperty1: string;
    publicProperty2: string;
    readonly publicGetterProperty1: string;
    publicSetterProperty1: string;
    publicGetterSetterProperty1: string;
    publicMethod1(arg1: string): number;
}

interface ISubClass extends IBaseClass {
    subPublicMethod1(arg1: string): number;
}

class BaseClass implements IBaseClass {
    public publicProperty1: string;
    protected protectedProperty1: string;
    private privateProperty1: string;

    public publicProperty2 = 'value-a1';
    protected protectedProperty2: 'value-b1'
    private privateProperty2 = 'value-c1';

    public get publicGetterProperty1() { return 'value-d1'; }
    protected get protectedGetterProperty1() { return 'value-f1'; }
    private get privateGetterProperty1() { return 'value-f1'; }

    public set publicSetterProperty1(value: string) { }
    protected set protectedSetterProperty1(value: string) { }
    private set privateSetterProperty1(value: string) { }

    public get publicGetterSetterProperty1() { return 'value-e1'; }
    protected get protectedGetterSetterProperty1() { return 'value-g1'; }
    private get privateGetterSetterProperty1() { return 'value-g1'; }

    public set publicGetterSetterProperty1(value: string) { }
    protected set protectedGetterSetterProperty1(value: string) { }
    private set privateGetterSetterProperty1(value: string) { }

    public publicMethod1(arg1: string): number {
        return 2;
    }

    protected protectedMethod(arg1: string): number {
        return 3;
    }

    private privateMethod(arg1: string): number {
        return 5;
    }
}

class SubClass extends BaseClass implements ISubClass {
    public subPublicMethod1(arg1: string): number {
        return 7;
    }
}

function createMockFromBaseClass(): Mock<BaseClass> {
    return MockFactory.create(BaseClass);
}

function createMockFromSubClass(): Mock<SubClass> {
    return MockFactory.create(SubClass);
}

function createMockFromBaseIntance(): Mock<IBaseClass> {
    const instance = new BaseClass();
    return MockFactory.create(instance);
}

function createMockFromSubInstance(): Mock<ISubClass> {
    const instance = new SubClass();
    return MockFactory.create(instance);
}

function createMockWindow(): Mock<Window> {
    return MockFactory.create(window);
}

function createMockLocation(): Mock<Location> {
    return MockFactory.create(location);
}

function createMockLocalStorage(): Mock<Storage> {
    return MockFactory.create(localStorage);
}

describe('Creating mocks', () => {
    it('should create a mock from a base class', () => {
        expect(() => createMockFromBaseClass()).not.toThrow()
    });

    it('should create a mock from a sub class', () => {
        expect(() => createMockFromSubClass()).not.toThrow()
    });

    it('should create a mock from a base instance', () => {
        expect(() => createMockFromBaseIntance()).not.toThrow()
    });

    it('should create a mock from a sub instance', () => {
        expect(() => createMockFromSubInstance()).not.toThrow()
    });

    it('should create a mock from the window object', () => {
        expect(() => createMockWindow()).not.toThrow()
    });

    it('should create a mock from the location object', () => {
        expect(() => createMockLocation()).not.toThrow()
    });

    it('should create a mock from the localStorage object', () => {
        expect(() => createMockLocalStorage()).not.toThrow()
    });
});

describe('Using mocks', () => {
    let commonInstance: Mock<BaseClass | SubClass | IBaseClass | ISubClass>;

    describe('using a mock created from a base class', () => {

        beforeEach(() => {
            commonInstance = createMockFromBaseClass();
        });

        runCommonSpecs();
    });

    describe('using a mock created from a sub class', () => {

        beforeEach(() => {
            commonInstance = createMockFromSubClass();
        });

        runCommonSpecs();
    });

    describe('using a mock created from an instance of a base class', () => {
        beforeEach(() => {
            commonInstance = createMockFromBaseIntance();
        });

        runCommonSpecs();
    });

    describe('using a mock created from an instance of a sub class', () => {
        beforeEach(() => {
            commonInstance = createMockFromSubInstance();
        });

        runCommonSpecs();
    });

    describe('using a mock created from the window object', () => {
        let mockWindow: Mock<Window>;
        beforeEach(() => {
            mockWindow = MockFactory.create(window);
        });

        it('should mock functions on window', () => {
            expect(mockWindow._spy.open._func).not.toHaveBeenCalled();
            expect(mockWindow.open).not.toHaveBeenCalled();
            mockWindow.open('https://foobar.com');
            expect(mockWindow._spy.open._func).toHaveBeenCalledWith('https://foobar.com');
            expect(mockWindow.open).toHaveBeenCalledWith('https://foobar.com');
        });

        it('should spy getter on window', () => {
            mockWindow._spy.scrollY._get.and.returnValue(42);
            expect(mockWindow.scrollY).toBe(42);
        });

        it('should spy setter on window', () => {
            mockWindow.name = 'foobar';
            expect(mockWindow._spy.name._set).toHaveBeenCalledWith('foobar');
        });
    });

    describe('using a mock created from the location object', () => {
        let mockLocation: Mock<Location>;
        beforeEach(() => {
            mockLocation = MockFactory.create(location);
        });

        it('should mock functions on location', () => {
            expect(mockLocation._spy.replace._func).not.toHaveBeenCalled();
            expect(mockLocation.replace).not.toHaveBeenCalled();
            mockLocation.replace('https://foobar.com');
            expect(mockLocation._spy.replace._func).toHaveBeenCalledWith('https://foobar.com');
            expect(mockLocation.replace).toHaveBeenCalledWith('https://foobar.com');
        });

        it('should spy getter on location', () => {
            mockLocation._spy.origin._get.and.returnValue('https://foobar.com');
            expect(mockLocation.origin).toBe('https://foobar.com');

            mockLocation._spy.search._get.and.returnValue('?param=1');
            expect(mockLocation.search).toBe('?param=1');
        });

        it('should spy setter on location', () => {
            mockLocation.host = 'foobar';
            expect(mockLocation._spy.host._set).toHaveBeenCalledWith('foobar');
        });
    });

    describe('using a mock created from the localStorage object', () => {
        let mockLocalStorage: Mock<Storage>;
        beforeEach(() => {
            mockLocalStorage = MockFactory.create(localStorage);
        });

        it('should mock functions on localStorage', () => {
            expect(mockLocalStorage._spy.getItem._func).not.toHaveBeenCalled();
            expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
            mockLocalStorage.getItem('foobar');
            expect(mockLocalStorage._spy.getItem._func).toHaveBeenCalledWith('foobar');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('foobar');
        });

        it('should spy getter on localStorage', () => {
            mockLocalStorage._spy.length._get.and.returnValue(42);
            expect(mockLocalStorage.length).toBe(42);
        });
    });

    function runCommonSpecs() {
        it('should return undefined for all public properties', () => {
            expect(commonInstance.publicProperty1).toBeUndefined();
            expect(commonInstance.publicProperty2).toBeUndefined();
            expect(commonInstance.publicGetterProperty1).toBeUndefined();
            expect(commonInstance.publicSetterProperty1).toBeUndefined();
            expect(commonInstance.publicGetterSetterProperty1).toBeUndefined();

            expect(commonInstance['publicProperty1']).toBeUndefined();
            expect(commonInstance['publicProperty2']).toBeUndefined();
            expect(commonInstance['publicGetterProperty1']).toBeUndefined();
            expect(commonInstance['publicSetterProperty1']).toBeUndefined();
            expect(commonInstance['publicGetterSetterProperty1']).toBeUndefined();
        });

        it('should return undefined for all protected properties', () => {
            expect((commonInstance as any).protectedProperty1).toBeUndefined();
            expect((commonInstance as any).protectedProperty2).toBeUndefined();
            expect((commonInstance as any).protectedGetterProperty1).toBeUndefined();
            expect((commonInstance as any).protectedSetterProperty1).toBeUndefined();
            expect((commonInstance as any).protectedGetterSetterProperty1).toBeUndefined();

            expect(commonInstance['protectedProperty1']).toBeUndefined();
            expect(commonInstance['protectedProperty2']).toBeUndefined();
            expect(commonInstance['protectedGetterProperty1']).toBeUndefined();
            expect(commonInstance['protectedSetterProperty1']).toBeUndefined();
            expect(commonInstance['protectedGetterSetterProperty1']).toBeUndefined();
        });

        it('should return undefined for all private properties', () => {
            expect((commonInstance as any).privateProperty1).toBeUndefined();
            expect((commonInstance as any).privateProperty2).toBeUndefined();
            expect((commonInstance as any).privateGetterProperty1).toBeUndefined();
            expect((commonInstance as any).privateSetterProperty1).toBeUndefined();
            expect((commonInstance as any).privateGetterSetterProperty1).toBeUndefined();

            expect(commonInstance['privateProperty1']).toBeUndefined();
            expect(commonInstance['privateProperty2']).toBeUndefined();
            expect(commonInstance['privateGetterProperty1']).toBeUndefined();
            expect(commonInstance['privateSetterProperty1']).toBeUndefined();
            expect(commonInstance['privateGetterSetterProperty1']).toBeUndefined();
        });

        it('should return undefined for non-exist properties', () => {
            expect((commonInstance as any).nonExistProperty).toBeUndefined();
            expect(commonInstance['nonExistProperty']).toBeUndefined();
        });

        it('should persist the first modification on properties', () => {
            commonInstance.publicProperty1 = 'new-value';
            expect(commonInstance.publicProperty1).toBe('new-value');

            commonInstance['protectedProperty1'] = 'new-value';
            expect(commonInstance['protectedProperty1']).toBe('new-value');

            commonInstance['privateProperty1'] = 'new-value';
            expect(commonInstance['privateProperty1']).toBe('new-value');

            commonInstance['nonExistProperty'] = 'new-value';
            expect(commonInstance['nonExistProperty']).toBe('new-value');
        });

        it('should persist all modifications on properties', () => {
            commonInstance.publicProperty1 = 'new-value-1';
            commonInstance.publicProperty1 = 'new-value-2';
            expect(commonInstance.publicProperty1).toBe('new-value-2');

            commonInstance['protectedProperty1'] = 'new-value-1';
            commonInstance['protectedProperty1'] = 'new-value-2';
            expect(commonInstance['protectedProperty1']).toBe('new-value-2');

            commonInstance['privateProperty1'] = 'new-value-1';
            commonInstance['privateProperty1'] = 'new-value-2';
            expect(commonInstance['privateProperty1']).toBe('new-value-2');

            commonInstance['nonExistProperty'] = 'new-value-1';
            commonInstance['nonExistProperty'] = 'new-value-2';
            expect(commonInstance['nonExistProperty']).toBe('new-value-2');
        });

        it('should ignore the first direct modification on properties with setters', () => {
            commonInstance.publicSetterProperty1 = 'new-value';
            expect(commonInstance.publicSetterProperty1).toBeUndefined();
            commonInstance.publicGetterSetterProperty1 = 'new-value';
            expect(commonInstance.publicGetterSetterProperty1).toBeUndefined();

            commonInstance['protectedSetterProperty1'] = 'new-value';
            expect(commonInstance['protectedSetterProperty1']).toBeUndefined();
            commonInstance['protectedGetterSetterProperty1'] = 'new-value';
            expect(commonInstance['protectedGetterSetterProperty1']).toBeUndefined();

            commonInstance['privateSetterProperty1'] = 'new-value';
            expect(commonInstance['privateSetterProperty1']).toBeUndefined();
            commonInstance['privateGetterSetterProperty1'] = 'new-value';
            expect(commonInstance['privateGetterSetterProperty1']).toBeUndefined();
        });

        it('should ignore all direct modifications on properties with setters', () => {
            commonInstance.publicSetterProperty1 = 'new-value-1';
            commonInstance.publicSetterProperty1 = 'new-value-2';
            expect(commonInstance.publicSetterProperty1).toBeUndefined();
            commonInstance.publicGetterSetterProperty1 = 'new-value-1';
            commonInstance.publicGetterSetterProperty1 = 'new-value-2';
            expect(commonInstance.publicGetterSetterProperty1).toBeUndefined();

            commonInstance['protectedSetterProperty1'] = 'new-value-1';
            commonInstance['protectedSetterProperty1'] = 'new-value-2';
            expect(commonInstance['protectedSetterProperty1']).toBeUndefined();
            commonInstance['protectedGetterSetterProperty1'] = 'new-value-1';
            commonInstance['protectedGetterSetterProperty1'] = 'new-value-2';
            expect(commonInstance['protectedGetterSetterProperty1']).toBeUndefined();

            commonInstance['privateSetterProperty1'] = 'new-value-1';
            commonInstance['privateSetterProperty1'] = 'new-value-2';
            expect(commonInstance['privateSetterProperty1']).toBeUndefined();
            commonInstance['privateGetterSetterProperty1'] = 'new-value-1';
            commonInstance['privateGetterSetterProperty1'] = 'new-value-2';
            expect(commonInstance['privateGetterSetterProperty1']).toBeUndefined();
        });

        it('should throw for modifications on properties with only getters', () => {
            expect(() => (commonInstance as any).publicGetterProperty1 = 'new-value').toThrow();
            expect(() => (commonInstance as any).protectedGetterProperty1 = 'new-value').toThrow();
            expect(() => (commonInstance as any).privateGetterProperty1 = 'new-value').toThrow();
        });

        it('should spy getters before they are used', () => {
            expect(commonInstance._spy.publicGetterProperty1._get).not.toHaveBeenCalled();
            expect(commonInstance._spy.publicGetterSetterProperty1._get).not.toHaveBeenCalled();

            expect(commonInstance._spy['protectedGetterProperty1']._get).not.toHaveBeenCalled();
            expect(commonInstance._spy['protectedGetterSetterProperty1']._get).not.toHaveBeenCalled();

            expect(commonInstance._spy['privateGetterProperty1']._get).not.toHaveBeenCalled();
            expect(commonInstance._spy['privateGetterSetterProperty1']._get).not.toHaveBeenCalled();
        });

        it('should spy setters before they are used', () => {
            expect(commonInstance._spy.publicSetterProperty1._set).not.toHaveBeenCalled();
            expect(commonInstance._spy.publicGetterSetterProperty1._set).not.toHaveBeenCalled();

            expect(commonInstance._spy['protectedSetterProperty1']._set).not.toHaveBeenCalled();
            expect(commonInstance._spy['protectedGetterSetterProperty1']._set).not.toHaveBeenCalled();

            expect(commonInstance._spy['privateSetterProperty1']._set).not.toHaveBeenCalled();
            expect(commonInstance._spy['privateGetterSetterProperty1']._set).not.toHaveBeenCalled();
        });

        it('should record calls on getters', () => {
            let temp1 = commonInstance.publicGetterProperty1;
            temp1 = commonInstance.publicGetterSetterProperty1;

            expect(commonInstance._spy.publicGetterProperty1._get).toHaveBeenCalled();
            expect(commonInstance._spy.publicGetterSetterProperty1._get).toHaveBeenCalled();

            temp1 = commonInstance.publicGetterProperty1;
            temp1 = commonInstance.publicGetterSetterProperty1;

            expect(commonInstance._spy.publicGetterSetterProperty1._get).toHaveBeenCalledTimes(2);
            expect(commonInstance._spy.publicGetterProperty1._get).toHaveBeenCalledTimes(2);
        });

        it('should record calls on setters', () => {
            commonInstance.publicSetterProperty1 = 'new-value';
            commonInstance.publicGetterSetterProperty1 = 'new-value';
            expect(commonInstance._spy.publicSetterProperty1._set).toHaveBeenCalledWith('new-value');
            expect(commonInstance._spy.publicGetterSetterProperty1._set).toHaveBeenCalledWith('new-value');
            commonInstance.publicSetterProperty1 = 'new-value';
            commonInstance.publicGetterSetterProperty1 = 'new-value';
            expect(commonInstance._spy.publicSetterProperty1._set).toHaveBeenCalledTimes(2);
            expect(commonInstance._spy.publicGetterSetterProperty1._set).toHaveBeenCalledTimes(2);

            commonInstance['protectedSetterProperty1'] = 'new-value';
            commonInstance['protectedGetterSetterProperty1'] = 'new-value';
            expect(commonInstance._spy['protectedSetterProperty1']._set).toHaveBeenCalledWith('new-value');
            expect(commonInstance._spy['protectedGetterSetterProperty1']._set).toHaveBeenCalledWith('new-value');
            commonInstance['protectedSetterProperty1'] = 'new-value';
            commonInstance['protectedGetterSetterProperty1'] = 'new-value';
            expect(commonInstance._spy['protectedSetterProperty1']._set).toHaveBeenCalledTimes(2);
            expect(commonInstance._spy['protectedGetterSetterProperty1']._set).toHaveBeenCalledTimes(2);

            commonInstance['privateSetterProperty1'] = 'new-value';
            commonInstance['privateGetterSetterProperty1'] = 'new-value';
            expect(commonInstance._spy['privateSetterProperty1']._set).toHaveBeenCalledWith('new-value');
            expect(commonInstance._spy['privateGetterSetterProperty1']._set).toHaveBeenCalledWith('new-value');
            commonInstance['privateSetterProperty1'] = 'new-value';
            commonInstance['privateGetterSetterProperty1'] = 'new-value';
            expect(commonInstance._spy['privateSetterProperty1']._set).toHaveBeenCalledTimes(2);
            expect(commonInstance._spy['privateGetterSetterProperty1']._set).toHaveBeenCalledTimes(2);
        });

        it('should modify results from getters before they are used', () => {
            commonInstance._spy.publicGetterProperty1._get.and.returnValue('new-value-1');
            commonInstance._spy.publicGetterSetterProperty1._get.and.returnValue('new-value-1');
            expect(commonInstance.publicGetterProperty1).toBe('new-value-1');
            expect(commonInstance.publicGetterSetterProperty1).toBe('new-value-1');

            commonInstance._spy['protectedGetterProperty1']._get.and.returnValue('new-value-1');
            commonInstance._spy['protectedGetterSetterProperty1']._get.and.returnValue('new-value-1');
            expect(commonInstance['protectedGetterProperty1']).toBe('new-value-1');
            expect(commonInstance['protectedGetterSetterProperty1']).toBe('new-value-1');

            commonInstance._spy['privateGetterProperty1']._get.and.returnValue('new-value-1');
            commonInstance._spy['privateGetterSetterProperty1']._get.and.returnValue('new-value-1');
            expect(commonInstance['privateGetterProperty1']).toBe('new-value-1');
            expect(commonInstance['privateGetterSetterProperty1']).toBe('new-value-1');
        });

        it('should modify results from getters after they are used', () => {
            let temp1 = commonInstance.publicGetterProperty1;
            temp1 = commonInstance.publicGetterSetterProperty1;
            commonInstance._spy.publicGetterProperty1._get.and.returnValue('new-value-1');
            commonInstance._spy.publicGetterSetterProperty1._get.and.returnValue('new-value-1');
            expect(commonInstance.publicGetterProperty1).toBe('new-value-1');
            expect(commonInstance.publicGetterSetterProperty1).toBe('new-value-1');

            temp1 = commonInstance['protectedGetterProperty1'];
            temp1 = commonInstance['protectedGetterSetterProperty1'];
            commonInstance._spy['protectedGetterProperty1']._get.and.returnValue('new-value-1');
            commonInstance._spy['protectedGetterSetterProperty1']._get.and.returnValue('new-value-1');
            expect(commonInstance['protectedGetterProperty1']).toBe('new-value-1');
            expect(commonInstance['protectedGetterSetterProperty1']).toBe('new-value-1');

            temp1 = commonInstance['privateGetterProperty1'];
            temp1 = commonInstance['privateGetterSetterProperty1'];
            commonInstance._spy['privateGetterProperty1']._get.and.returnValue('new-value-1');
            commonInstance._spy['privateGetterSetterProperty1']._get.and.returnValue('new-value-1');
            expect(commonInstance['privateGetterProperty1']).toBe('new-value-1');
            expect(commonInstance['privateGetterSetterProperty1']).toBe('new-value-1');
        });

        it('should re-modify results from getters', () => {
            commonInstance._spy.publicGetterProperty1._get.and.returnValue('new-value-1');
            commonInstance._spy.publicGetterSetterProperty1._get.and.returnValue('new-value-1');
            expect(commonInstance.publicGetterProperty1).toBe('new-value-1');
            expect(commonInstance.publicGetterSetterProperty1).toBe('new-value-1');
            commonInstance._spy.publicGetterProperty1._get.and.returnValue('new-value-2');
            commonInstance._spy.publicGetterSetterProperty1._get.and.returnValue('new-value-2');
            expect(commonInstance.publicGetterProperty1).toBe('new-value-2');
            expect(commonInstance.publicGetterSetterProperty1).toBe('new-value-2');

            commonInstance._spy['protectedGetterProperty1']._get.and.returnValue('new-value-1');
            commonInstance._spy['protectedGetterSetterProperty1']._get.and.returnValue('new-value-1');
            expect(commonInstance['protectedGetterProperty1']).toBe('new-value-1');
            expect(commonInstance['protectedGetterSetterProperty1']).toBe('new-value-1');
            commonInstance._spy['protectedGetterProperty1']._get.and.returnValue('new-value-2');
            commonInstance._spy['protectedGetterSetterProperty1']._get.and.returnValue('new-value-2');
            expect(commonInstance['protectedGetterProperty1']).toBe('new-value-2');
            expect(commonInstance['protectedGetterSetterProperty1']).toBe('new-value-2');

            commonInstance._spy['privateGetterProperty1']._get.and.returnValue('new-value-1');
            commonInstance._spy['privateGetterSetterProperty1']._get.and.returnValue('new-value-1');
            expect(commonInstance['privateGetterProperty1']).toBe('new-value-1');
            expect(commonInstance['privateGetterSetterProperty1']).toBe('new-value-1');
            commonInstance._spy['privateGetterProperty1']._get.and.returnValue('new-value-2');
            commonInstance._spy['privateGetterSetterProperty1']._get.and.returnValue('new-value-2');
            expect(commonInstance['privateGetterProperty1']).toBe('new-value-2');
            expect(commonInstance['privateGetterSetterProperty1']).toBe('new-value-2');
        });

        it('should return spy for all functions', () => {
            expect(commonInstance.publicMethod1).not.toHaveBeenCalled();
            expect(commonInstance.publicMethod1).not.toHaveBeenCalled();
            expect((commonInstance as any).privateMethod).not.toHaveBeenCalled();
            expect((commonInstance as any).privateMethod).not.toHaveBeenCalled();
        });

        it('should register calls on each spy', () => {
            commonInstance.publicMethod1('value-1');
            expect(commonInstance.publicMethod1).toHaveBeenCalledWith('value-1');
            commonInstance.publicMethod1('value-2');
            expect(commonInstance.publicMethod1).toHaveBeenCalledWith('value-2');
            expect(commonInstance.publicMethod1).toHaveBeenCalledTimes(2);

            (commonInstance as any).privateMethod('value-1');
            expect((commonInstance as any).privateMethod).toHaveBeenCalledWith('value-1');
            (commonInstance as any).privateMethod('value-2');
            expect((commonInstance as any).privateMethod).toHaveBeenCalledWith('value-2');
            expect((commonInstance as any).privateMethod).toHaveBeenCalledTimes(2);

            commonInstance.publicGetterSetterProperty1 = 'value-1';
            expect(commonInstance._spy.publicGetterSetterProperty1._set).toHaveBeenCalledWith('value-1');
            commonInstance.publicGetterSetterProperty1 = 'value-2';
            expect(commonInstance._spy.publicGetterSetterProperty1._set).toHaveBeenCalledWith('value-2');
            expect(commonInstance._spy.publicGetterSetterProperty1._set).toHaveBeenCalledTimes(2);

            const whatever1 = commonInstance.publicGetterSetterProperty1;
            expect(commonInstance._spy.publicGetterSetterProperty1._get).toHaveBeenCalled();
            const whatever2 = commonInstance.publicGetterSetterProperty1;
            expect(commonInstance._spy.publicGetterSetterProperty1._get).toHaveBeenCalledTimes(2);
        });

        it('should allow spy setup before its first call', () => {
            (commonInstance.publicMethod1 as jasmine.Spy).and.returnValue(999);
            expect(commonInstance.publicMethod1('whatever')).toBe(999);
            expect(commonInstance.publicMethod1('whatever')).toBe(999);

            ((commonInstance as any).privateMethod as jasmine.Spy).and.returnValue(999);
            expect((commonInstance as any).privateMethod('whatever')).toBe(999);
            expect((commonInstance as any).privateMethod('whatever')).toBe(999);
        });

        it('should allow spy setup after its first call', () => {
            commonInstance.publicMethod1('whatever');

            (commonInstance.publicMethod1 as jasmine.Spy).and.returnValue(111);
            expect(commonInstance.publicMethod1('whatever')).toBe(111);
            (commonInstance.publicMethod1 as jasmine.Spy).and.returnValue(999);
            expect(commonInstance.publicMethod1('whatever')).toBe(999);

            (commonInstance as any).privateMethod('whatever');

            ((commonInstance as any).privateMethod as jasmine.Spy).and.returnValue(111);
            expect((commonInstance as any).privateMethod('whatever')).toBe(111);
            ((commonInstance as any).privateMethod as jasmine.Spy).and.returnValue(999);
            expect((commonInstance as any).privateMethod('whatever')).toBe(999);
        });

        it('should allow spy to be added with non-exist names', () => {
            (commonInstance as any).nonExistMethod = jasmine.createSpy('newSpy');
            (commonInstance as any).nonExistMethod('value-1');
            expect((commonInstance as any).nonExistMethod).toHaveBeenCalledWith('value-1');
        });

        it('should allow spy to be replaced before its first call', () => {
            const newSpy1 = jasmine.createSpy('newSpy')
            expect(() => commonInstance.publicMethod1 = newSpy1).not.toThrowError();
            commonInstance.publicMethod1('value-1');

            expect(newSpy1).toHaveBeenCalledWith('value-1');

            const newSpy2 = jasmine.createSpy('newSpy')
            expect(() => (commonInstance as any).privateMethod = newSpy2).not.toThrowError();
            (commonInstance as any).privateMethod('value-1');

            expect(newSpy2).toHaveBeenCalledWith('value-1');
        });

        it('should allow spy to be replaced after its first call', () => {
            commonInstance.publicMethod1('whatever');
            const newSpy1 = jasmine.createSpy('newSpy')
            expect(() => commonInstance.publicMethod1 = newSpy1).not.toThrowError();
            commonInstance.publicMethod1('value-1');

            expect(newSpy1).toHaveBeenCalledWith('value-1');

            (commonInstance as any).privateMethod('whatever');
            const newSpy2 = jasmine.createSpy('newSpy')
            expect(() => (commonInstance as any).privateMethod = newSpy2).not.toThrowError();
            (commonInstance as any).privateMethod('value-1');

            expect(newSpy2).toHaveBeenCalledWith('value-1');
        });

        it('should throw when _spy facade is modified', () => {
            expect(() => commonInstance._spy = 42 as any).toThrow();
            expect(() => commonInstance._spy.publicGetterSetterProperty1 = {} as any).toThrow();
        });
    }
});
