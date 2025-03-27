import { DataSource, QueryRunner } from 'typeorm';
export declare class TransactionManager {
    private dataSource;
    constructor(dataSource: DataSource);
    run<T>(callback: (queryRunner: QueryRunner) => Promise<T>): Promise<T>;
}
