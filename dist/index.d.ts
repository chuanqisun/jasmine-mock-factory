/// <reference types="jasmine" />
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
export declare class MockFactory {
    /**
     * create a mock object that has the identical interface as the class you passed in
     */
    static create<T extends object>(blueprint: Type<T> | T): Mock<T>;
}
export {};
