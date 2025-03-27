// src/types/ua-parser-js.d.ts
declare module 'ua-parser-js' {
    export interface IResult {
        ua: string;
        browser: {
            name?: string;
            version?: string;
        };
        engine: {
            name?: string;
            version?: string;
        };
        os: {
            name?: string;
            version?: string;
        };
        device: {
            model?: string;
            type?: string;
            vendor?: string;
        };
        cpu: {
            architecture?: string;
        };
    }

    // Export the class as named export
    export class UAParser {
        constructor(uastring?: string, extensions?: any);
        getResult(): IResult;
        getUA(): string;
        setUA(uastring: string): UAParser;
    }
}