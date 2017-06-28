// -----------------------------------------------------------------------
// <copyright company='Microsoft Corporation'>
//   Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

import { MockFactory, Mock } from './index';

interface IClass1 {
    publicProperty1: string;
    publicProperty2: string;
    readonly gettableProperty1: string;
    getSetProperty1: string;
    settableProperty1: string;
    publicMethod(arg1: string): number;
}

class Class1 implements IClass1 {
    private privateProperty1: string;
    private privateProperty2 = 'value-a1';

    public get gettableProperty1() {
        return 'value-c1';
    }

    public set settableProperty1(value: string) {
        // noop
    }

    public get getSetProperty1() {
        return 'value-d1';
    }

    public set getSetProperty1(value: string) {
        // noop
    }

    public publicMethod(arg1: string): number {
        return 42;
    }

    private privateMethod(arg1: string): number {
        return 123;
    }

    constructor(
        public publicProperty1: string,
        public publicProperty2 = 'value-b1',
    ) {}
}

class Class2 extends Class1 { }

describe('MockFactory', () => {
    let mockInstance: Mock<Class1 | Class2 | IClass1>;

    describe('mocking a class using a typescript class', () => {

        beforeEach(() => {
            mockInstance = MockFactory.create(Class1);
        });

        runSharedSpecs();
    });

    describe('mocking an inherited class using an inherited typescript class', () => {

        beforeEach(() => {
            mockInstance = MockFactory.create(Class2);
        });

        runSharedSpecs();
    });

    describe('mocking an interface using an instance', () => {
        beforeEach(() => {
            const realInstance = new Class1('value-1');
            mockInstance = MockFactory.create(realInstance);
        });

        runSharedSpecs();
    });

    describe('mocking an inherited interface using an inherited instance', () => {
        beforeEach(() => {
            const realInstance = new Class2('value-1');
            mockInstance = MockFactory.create(realInstance);
        });

        runSharedSpecs();
    });

    describe('mocking window object', () => {
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

    describe('mocking location object', () => {
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
        });

        it('should spy setter on location', () => {
            mockLocation.host = 'foobar';
            expect(mockLocation._spy.host._set).toHaveBeenCalledWith('foobar');
        });
    });

    describe('mocking localStorage object', () => {
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

    function runSharedSpecs() {
        it('should return undefined for all properties', () => {
            expect(mockInstance.publicProperty1).toBeUndefined();
            expect(mockInstance.publicProperty2).toBeUndefined();
            expect(mockInstance.gettableProperty1).toBeUndefined();
            expect(mockInstance.getSetProperty1).toBeUndefined();
            expect((mockInstance as any).privateProperty1).toBeUndefined();
            expect((mockInstance as any).privateProperty2).toBeUndefined();
            expect((mockInstance as any).nonExistProperty).toBeUndefined();
        });

        it('should persist modification for all properties', () => {
            mockInstance.publicProperty1 = 'new-value-1';
            expect(mockInstance.publicProperty1).toBe('new-value-1');
            mockInstance.publicProperty1 = 'new-value-2';
            expect(mockInstance.publicProperty1).toBe('new-value-2');
            expect(mockInstance.publicProperty1).toBe('new-value-2');

            mockInstance._spy.gettableProperty1._get.and.returnValue('new-value-1');
            expect(mockInstance.gettableProperty1).toBe('new-value-1');
            mockInstance._spy.gettableProperty1._get.and.returnValue('new-value-2');
            expect(mockInstance.gettableProperty1).toBe('new-value-2');
            expect(mockInstance.gettableProperty1).toBe('new-value-2');

            mockInstance._spy.getSetProperty1._get.and.returnValue('new-value-1');
            expect(mockInstance.getSetProperty1).toBe('new-value-1');
            mockInstance._spy.getSetProperty1._get.and.returnValue('new-value-2');
            expect(mockInstance.getSetProperty1).toBe('new-value-2');
            expect(mockInstance.getSetProperty1).toBe('new-value-2');

            (mockInstance as any).privateProperty1 = 'new-value-1';
            expect((mockInstance as any).privateProperty1).toBe('new-value-1');
            (mockInstance as any).privateProperty1 = 'new-value-2';
            expect((mockInstance as any).privateProperty1).toBe('new-value-2');
            expect((mockInstance as any).privateProperty1).toBe('new-value-2');

            (mockInstance as any).nonExistProperty = 'new-value-1';
            expect((mockInstance as any).nonExistProperty).toBe('new-value-1');
            (mockInstance as any).nonExistProperty = 'new-value-2';
            expect((mockInstance as any).nonExistProperty).toBe('new-value-2');
            expect((mockInstance as any).nonExistProperty).toBe('new-value-2');
        });

        it('should return spy for all functions', () => {
            expect(mockInstance.publicMethod).not.toHaveBeenCalled();
            expect(mockInstance.publicMethod).not.toHaveBeenCalled();
            expect((mockInstance as any).privateMethod).not.toHaveBeenCalled();
            expect((mockInstance as any).privateMethod).not.toHaveBeenCalled();
        });

        it('should register calls on each spy', () => {
            mockInstance.publicMethod('value-1');
            expect(mockInstance.publicMethod).toHaveBeenCalledWith('value-1');
            mockInstance.publicMethod('value-2');
            expect(mockInstance.publicMethod).toHaveBeenCalledWith('value-2');
            expect(mockInstance.publicMethod).toHaveBeenCalledTimes(2);

            (mockInstance as any).privateMethod('value-1');
            expect((mockInstance as any).privateMethod).toHaveBeenCalledWith('value-1');
            (mockInstance as any).privateMethod('value-2');
            expect((mockInstance as any).privateMethod).toHaveBeenCalledWith('value-2');
            expect((mockInstance as any).privateMethod).toHaveBeenCalledTimes(2);

            mockInstance.getSetProperty1 = 'value-1';
            expect(mockInstance._spy.getSetProperty1._set).toHaveBeenCalledWith('value-1');
            mockInstance.getSetProperty1 = 'value-2';
            expect(mockInstance._spy.getSetProperty1._set).toHaveBeenCalledWith('value-2');
            expect(mockInstance._spy.getSetProperty1._set).toHaveBeenCalledTimes(2);

            const whatever1 = mockInstance.getSetProperty1;
            expect(mockInstance._spy.getSetProperty1._get).toHaveBeenCalled();
            const whatever2 = mockInstance.getSetProperty1;
            expect(mockInstance._spy.getSetProperty1._get).toHaveBeenCalledTimes(2);
        });

        it('should allow spy setup before its first call', () => {
            (mockInstance.publicMethod as jasmine.Spy).and.returnValue(999);
            expect(mockInstance.publicMethod('whatever')).toBe(999);
            expect(mockInstance.publicMethod('whatever')).toBe(999);

            ((mockInstance as any).privateMethod as jasmine.Spy).and.returnValue(999);
            expect((mockInstance as any).privateMethod('whatever')).toBe(999);
            expect((mockInstance as any).privateMethod('whatever')).toBe(999);
        });

        it('should allow spy setup after its first call', () => {
            mockInstance.publicMethod('whatever');

            (mockInstance.publicMethod as jasmine.Spy).and.returnValue(111);
            expect(mockInstance.publicMethod('whatever')).toBe(111);
            (mockInstance.publicMethod as jasmine.Spy).and.returnValue(999);
            expect(mockInstance.publicMethod('whatever')).toBe(999);

            (mockInstance as any).privateMethod('whatever');

            ((mockInstance as any).privateMethod as jasmine.Spy).and.returnValue(111);
            expect((mockInstance as any).privateMethod('whatever')).toBe(111);
            ((mockInstance as any).privateMethod as jasmine.Spy).and.returnValue(999);
            expect((mockInstance as any).privateMethod('whatever')).toBe(999);
        });

        it('should allow spy to be added with non-exist names', () => {
            (mockInstance as any).nonExistMethod = jasmine.createSpy('newSpy');
            (mockInstance as any).nonExistMethod('value-1');
            expect((mockInstance as any).nonExistMethod).toHaveBeenCalledWith('value-1');
        });

        it('should allow spy to be replaced before its first call', () => {
            const newSpy1 = jasmine.createSpy('newSpy')
            expect(() => mockInstance.publicMethod = newSpy1).not.toThrowError();
            mockInstance.publicMethod('value-1');

            expect(newSpy1).toHaveBeenCalledWith('value-1');

            const newSpy2 = jasmine.createSpy('newSpy')
            expect(() => (mockInstance as any).privateMethod = newSpy2).not.toThrowError();
            (mockInstance as any).privateMethod('value-1');

            expect(newSpy2).toHaveBeenCalledWith('value-1');
        });

        it('should allow spy to be replaced after its first call', () => {
            mockInstance.publicMethod('whatever');
            const newSpy1 = jasmine.createSpy('newSpy')
            expect(() => mockInstance.publicMethod = newSpy1).not.toThrowError();
            mockInstance.publicMethod('value-1');

            expect(newSpy1).toHaveBeenCalledWith('value-1');

            (mockInstance as any).privateMethod('whatever');
            const newSpy2 = jasmine.createSpy('newSpy')
            expect(() => (mockInstance as any).privateMethod = newSpy2).not.toThrowError();
            (mockInstance as any).privateMethod('value-1');

            expect(newSpy2).toHaveBeenCalledWith('value-1');
        });

        it('should throw when _spy facade is modified', () => {
            expect(() => mockInstance._spy = 42 as any).toThrow();
            expect(() => mockInstance._spy.getSetProperty1 = {} as any).toThrow();
        });
    }
});
