import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * ESM resolve/load hooks used by the test runner only.
 *
 * 1. Points `@microsoft/pcf-core` at the stub in this folder so the control can
 *    be imported outside of the Power Apps host.
 * 2. Lets the extensionless relative imports used across the project resolve to
 *    their `.ts` files, which is what the bundler does during a real build.
 * 3. Hands `.tsx` sources to Node's TypeScript stripper. The control is written
 *    with `React.createElement` rather than JSX, so the source is valid
 *    TypeScript and strips cleanly.
 */
export async function resolve(specifier, context, nextResolve) {
    if (specifier === "@microsoft/pcf-core") {
        return { url: new URL("./pcfCore.ts", import.meta.url).href, shortCircuit: true };
    }

    const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
    const hasExtension = /\.[cm]?[jt]sx?$/.test(specifier);
    if (isRelative && !hasExtension) {
        try {
            return await nextResolve(`${specifier}.ts`, context);
        } catch (error) {
            // fall through to the default resolution
        }
    }

    return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
    if (url.startsWith("file:") && url.endsWith(".tsx")) {
        const source = await readFile(fileURLToPath(url), "utf8");
        return { format: "module-typescript", source, shortCircuit: true };
    }
    return nextLoad(url, context);
}
