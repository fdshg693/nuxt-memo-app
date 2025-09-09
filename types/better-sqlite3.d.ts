// Minimal type declaration for better-sqlite3 to satisfy TS where @types not installed.
declare module 'better-sqlite3' {
    class Statement {
        run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
        get(...params: any[]): any;
        all(...params: any[]): any[];
    }
    interface Options { memory?: boolean; readonly?: boolean; fileMustExist?: boolean; timeout?: number }
    class Database {
        constructor(path: string, options?: Options);
        prepare(sql: string): Statement;
        exec(sql: string): void;
        close(): void;
        transaction<T extends (...params: any[]) => any>(fn: T): T;
        pragma(pragma: string, simpleResult?: boolean): any;
    }
    export = Database;
}
