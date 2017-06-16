// -----------------------------------------------------------------------
// <copyright company='Microsoft Corporation'>
//   Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

import { MockFactory } from './index';

interface IClass1 {
    publicProperty1: string;
    publicProperty2: string;
    readonly gettableProperty1: string;
    settableProperty1: string;
    publicMethod(arg1: string): number;
}

class Class1 implements IClass1 {
    private privateProperty1: string;
    private privateProperty2 = 'value-a1';
    private settablePropertyInternal = '';

    public get gettableProperty1() {
        return 'value-c1';
    }

    public set settableProperty1(value: string) {
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
    let mockClass1Instance: IClass1;

    describe('mocking a class using a typescript class', () => {

        beforeEach(() => {
            mockClass1Instance = MockFactory.create(Class1);
        });

        runSharedSpecs();
    });

    describe('mocking an inherited class using an inherited typescript class', () => {

        beforeEach(() => {
            mockClass1Instance = MockFactory.create(Class2);
        });

        runSharedSpecs();
    });

    describe('mocking an interface using an instance', () => {
        beforeEach(() => {
            const realInstance = new Class1('value-1');
            mockClass1Instance = MockFactory.create(realInstance);
        });

        runSharedSpecs();
    });

    describe('mocking an inherited interface using an inherited instance', () => {
        beforeEach(() => {
            const realInstance = new Class2('value-1');
            mockClass1Instance = MockFactory.create(realInstance);
        });

        runSharedSpecs();
    });

    function runSharedSpecs() {
        it('should return undefined for all properties', () => {
            expect(mockClass1Instance.publicProperty1).toBeUndefined();
            expect(mockClass1Instance.publicProperty2).toBeUndefined();
            expect(mockClass1Instance.gettableProperty1).toBeUndefined();
            expect((mockClass1Instance as any).privateProperty1).toBeUndefined();
            expect((mockClass1Instance as any).privateProperty2).toBeUndefined();
            expect((mockClass1Instance as any).nonExistProperty).toBeUndefined();
        });

        it('should persist modification for all properties', () => {
            mockClass1Instance.publicProperty1 = 'new-value-1';
            expect(mockClass1Instance.publicProperty1).toBe('new-value-1');
            mockClass1Instance.publicProperty1 = 'new-value-2';
            expect(mockClass1Instance.publicProperty1).toBe('new-value-2');
            expect(mockClass1Instance.publicProperty1).toBe('new-value-2');

            (mockClass1Instance as any).gettableProperty1 = 'new-value-1';
            expect(mockClass1Instance.gettableProperty1).toBe('new-value-1');
            (mockClass1Instance as any).gettableProperty1 = 'new-value-2';
            expect(mockClass1Instance.gettableProperty1).toBe('new-value-2');
            expect(mockClass1Instance.gettableProperty1).toBe('new-value-2');

            (mockClass1Instance as any).privateProperty1 = 'new-value-1';
            expect((mockClass1Instance as any).privateProperty1).toBe('new-value-1');
            (mockClass1Instance as any).privateProperty1 = 'new-value-2';
            expect((mockClass1Instance as any).privateProperty1).toBe('new-value-2');
            expect((mockClass1Instance as any).privateProperty1).toBe('new-value-2');

            (mockClass1Instance as any).nonExistProperty = 'new-value-1';
            expect((mockClass1Instance as any).nonExistProperty).toBe('new-value-1');
            (mockClass1Instance as any).nonExistProperty = 'new-value-2';
            expect((mockClass1Instance as any).nonExistProperty).toBe('new-value-2');
            expect((mockClass1Instance as any).nonExistProperty).toBe('new-value-2');
        });

        it('should return spy for all functions', () => {
            expect(mockClass1Instance.publicMethod).not.toHaveBeenCalled();
            expect(mockClass1Instance.publicMethod).not.toHaveBeenCalled();
            expect((mockClass1Instance as any).privateMethod).not.toHaveBeenCalled();
            expect((mockClass1Instance as any).privateMethod).not.toHaveBeenCalled();
        });

        it('should register calls on each spy', () => {
            mockClass1Instance.publicMethod('value-1');
            expect(mockClass1Instance.publicMethod).toHaveBeenCalledWith('value-1');
            mockClass1Instance.publicMethod('value-2');
            expect(mockClass1Instance.publicMethod).toHaveBeenCalledWith('value-2');
            expect(mockClass1Instance.publicMethod).toHaveBeenCalledTimes(2);

            (mockClass1Instance as any).privateMethod('value-1');
            expect((mockClass1Instance as any).privateMethod).toHaveBeenCalledWith('value-1');
            (mockClass1Instance as any).privateMethod('value-2');
            expect((mockClass1Instance as any).privateMethod).toHaveBeenCalledWith('value-2');
            expect((mockClass1Instance as any).privateMethod).toHaveBeenCalledTimes(2);
        });

        it('should allow spy setup before its first call', () => {
            (mockClass1Instance.publicMethod as jasmine.Spy).and.returnValue(999);
            expect(mockClass1Instance.publicMethod('whatever')).toBe(999);
            expect(mockClass1Instance.publicMethod('whatever')).toBe(999);

            ((mockClass1Instance as any).privateMethod as jasmine.Spy).and.returnValue(999);
            expect((mockClass1Instance as any).privateMethod('whatever')).toBe(999);
            expect((mockClass1Instance as any).privateMethod('whatever')).toBe(999);
        });

        it('should allow spy setup after its first call', () => {
            mockClass1Instance.publicMethod('whatever');

            (mockClass1Instance.publicMethod as jasmine.Spy).and.returnValue(111);
            expect(mockClass1Instance.publicMethod('whatever')).toBe(111);
            (mockClass1Instance.publicMethod as jasmine.Spy).and.returnValue(999);
            expect(mockClass1Instance.publicMethod('whatever')).toBe(999);

            (mockClass1Instance as any).privateMethod('whatever');

            ((mockClass1Instance as any).privateMethod as jasmine.Spy).and.returnValue(111);
            expect((mockClass1Instance as any).privateMethod('whatever')).toBe(111);
            ((mockClass1Instance as any).privateMethod as jasmine.Spy).and.returnValue(999);
            expect((mockClass1Instance as any).privateMethod('whatever')).toBe(999);
        });

        it('should allow spy to be added with non-exist names', () => {
            (mockClass1Instance as any).nonExistMethod = jasmine.createSpy('newSpy');
            (mockClass1Instance as any).nonExistMethod('value-1');
            expect((mockClass1Instance as any).nonExistMethod).toHaveBeenCalledWith('value-1');
        });

        it('should not allow spy to be replaced before its first call', () => {
            expect(() => mockClass1Instance.publicMethod = jasmine.createSpy('newSpy')).toThrowError();
            expect(() => (mockClass1Instance as any).privateMethod = jasmine.createSpy('newSpy')).toThrowError();
        });

        it('should not allow spy to be replaced after its first call', () => {
            mockClass1Instance.publicMethod('whatever');
            expect(() => mockClass1Instance.publicMethod = jasmine.createSpy('newSpy')).toThrowError();

            (mockClass1Instance as any).privateMethod('whatever');
            expect(() => (mockClass1Instance as any).privateMethod = jasmine.createSpy('newSpy')).toThrowError();
        });
    }
});
