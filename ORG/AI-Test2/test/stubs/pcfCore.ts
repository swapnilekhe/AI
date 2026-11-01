/**
 * Minimal stand-in for `@microsoft/pcf-core` so the control can be exercised
 * outside of the Power Apps host. Only the surface the control actually uses
 * is implemented; this file is test scaffolding and is never bundled.
 */

/** A tiny element factory that mirrors the shape React.createElement returns. */
export const React = {
    createElement(type: any, props: any, ...children: any[]): any {
        const flat: any[] = [];
        const push = (child: any): void => {
            if (child === null || child === undefined || child === false) {
                return;
            }
            if (Array.isArray(child)) {
                child.forEach(push);
            } else {
                flat.push(child);
            }
        };
        children.forEach(push);
        return { type, props: props || {}, children: flat };
    },
    createRef<T>(): { current: T | null } {
        return { current: null };
    }
} as any;

export class ComponentBase<TInput, TOutput> {
    context: any;
    formInfo: any = {};
    formItem: any = null;
    valueChangedCallback: () => void = (): void => undefined;

    constructor(control: any, context: any) {
        this.context = context;
    }

    notifyOutputValueChanged(): void {
        return;
    }
}

/** Type-only in the real package; present so the value import links. */
export const ComponentFramework: any = {};
