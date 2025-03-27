// src/types/nestjs-bull.d.ts
declare module '@nestjs/bull' {
    import { DynamicModule } from '@nestjs/common';

    export function InjectQueue(name: string): ParameterDecorator;
    export function Process(options?: any): MethodDecorator;
    export function Processor(name?: string, options?: any): ClassDecorator;

    export class BullModule {
        static forRoot(options?: any): DynamicModule;
        static registerQueue(...queues: any[]): DynamicModule;
    }

    export interface Queue {
        add(name: string, data: any, options?: any): Promise<any>;
        process(name: string, handler: Function): void;
        getActiveCount(): Promise<number>;
        getWaitingCount(): Promise<number>;
        getCompletedCount(): Promise<number>;
        getFailedCount(): Promise<number>;
    }
}