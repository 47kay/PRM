// BackEnd/@types/dratchio/index.d.ts
declare module 'dratchio' {
    export class DratchioClient {
      constructor(config: any);
      on(event: string, callback: Function): DratchioClient;
      register(): Promise<void>;
      call(options: { to: string, from: string }): Promise<{
        uuid: string;
        answer: () => void;
        hangup: () => void;
      }>;
    }
  }