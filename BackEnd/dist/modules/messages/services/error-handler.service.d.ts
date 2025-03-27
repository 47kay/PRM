export declare class ErrorHandlerService {
    notFound(entity: string, id: string): never;
    badRequest(message: string): never;
    conflict(message: string): never;
}
