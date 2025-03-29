declare global {
    interface Promise<T> {
        __entity_type_workaround?: T;
    }
    interface Object {
        then?: any;
        catch?: any;
        finally?: any;
    }
}
export declare const fixSwaggerCircularDependencies: () => void;
declare const _default: {
    fixSwaggerCircularDependencies: () => void;
};
export default _default;
