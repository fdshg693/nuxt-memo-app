import sqlDatabases from '@/data/sqlDatabases.json'

/**
 * Database validation service for SQL question generation
 */
export function useDatabaseValidation() {
    
    /**
     * Get all available database table names
     * @returns Array of table names
     */
    function getAvailableTables(): string[] {
        return sqlDatabases.map(db => db.name);
    }

    /**
     * Get columns for a specific table
     * @param tableName - Name of the table
     * @returns Array of column names or empty array if table not found
     */
    function getTableColumns(tableName: string): string[] {
        const table = sqlDatabases.find(db => db.name === tableName);
        return table ? table.columns : [];
    }

    /**
     * Validate if a table exists
     * @param tableName - Name of the table to validate
     * @returns true if table exists, false otherwise
     */
    function validateTable(tableName: string): boolean {
        return sqlDatabases.some(db => db.name === tableName);
    }

    /**
     * Validate if columns exist in a specific table
     * @param tableName - Name of the table
     * @param columns - Array of column names to validate
     * @returns Object with validation result and invalid columns
     */
    function validateTableColumns(tableName: string, columns: string[]): {
        isValid: boolean;
        invalidColumns: string[];
        validColumns: string[];
    } {
        const tableColumns = getTableColumns(tableName);
        const invalidColumns: string[] = [];
        const validColumns: string[] = [];

        columns.forEach(column => {
            if (tableColumns.includes(column)) {
                validColumns.push(column);
            } else {
                invalidColumns.push(column);
            }
        });

        return {
            isValid: invalidColumns.length === 0,
            invalidColumns,
            validColumns
        };
    }

    /**
     * Extract table and column references from SQL query
     * @param sql - SQL query string
     * @returns Object with extracted tables and columns
     */
    function extractSqlReferences(sql: string): {
        tables: string[];
        columns: string[];
    } {
        const tables: string[] = [];
        const columns: string[] = [];

        // Simple regex patterns to extract table and column names
        // This is a basic implementation and may need enhancement for complex queries
        
        // Extract table names from FROM and JOIN clauses
        const tablePattern = /(?:FROM|JOIN)\s+(\w+)/gi;
        let tableMatch;
        while ((tableMatch = tablePattern.exec(sql)) !== null) {
            const tableName = tableMatch[1];
            if (!tables.includes(tableName)) {
                tables.push(tableName);
            }
        }

        // Extract column names from SELECT and WHERE clauses
        const columnPattern = /(?:SELECT|WHERE|ORDER BY|GROUP BY)\s+[\w\s,.*]+/gi;
        let columnMatch;
        while ((columnMatch = columnPattern.exec(sql)) !== null) {
            const clause = columnMatch[0];
            // Extract individual column names (basic implementation)
            const columnMatches = clause.match(/\b(\w+)\b/g);
            if (columnMatches) {
                columnMatches.forEach(col => {
                    // Skip SQL keywords
                    const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'GROUP', 'AS', 'AND', 'OR'];
                    if (!sqlKeywords.includes(col.toUpperCase()) && !columns.includes(col)) {
                        columns.push(col);
                    }
                });
            }
        }

        return { tables, columns };
    }

    /**
     * Validate generated SQL question for table and column existence
     * @param question - Generated question object
     * @returns Validation result with details
     */
    function validateGeneratedQuestion(question: any): {
        isValid: boolean;
        errors: string[];
        suggestions: string[];
    } {
        const errors: string[] = [];
        const suggestions: string[] = [];

        // Validate specified database name
        if (question.DbName && !validateTable(question.DbName)) {
            errors.push(`指定されたテーブル '${question.DbName}' が存在しません。`);
            suggestions.push(`利用可能なテーブル: ${getAvailableTables().join(', ')}`);
        }

        // Validate SQL answer if present
        if (question.answer) {
            const { tables, columns } = extractSqlReferences(question.answer);
            
            // Check if referenced tables exist
            tables.forEach(table => {
                if (!validateTable(table)) {
                    errors.push(`SQLクエリで参照されているテーブル '${table}' が存在しません。`);
                }
            });

            // Check if referenced columns exist in their tables
            tables.forEach(table => {
                if (validateTable(table)) {
                    const tableColumns = getTableColumns(table);
                    const referencedColumns = columns.filter(col => 
                        // Basic check - this could be enhanced to be more precise
                        question.answer.includes(col)
                    );
                    
                    const validation = validateTableColumns(table, referencedColumns);
                    if (!validation.isValid) {
                        errors.push(`テーブル '${table}' に存在しないカラムが参照されています: ${validation.invalidColumns.join(', ')}`);
                        suggestions.push(`テーブル '${table}' の利用可能なカラム: ${tableColumns.join(', ')}`);
                    }
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            suggestions
        };
    }

    /**
     * Get database schema information for AI prompt
     * @param tableName - Optional specific table name
     * @returns Schema information string for AI prompt
     */
    function getDatabaseSchemaForPrompt(tableName?: string): string {
        if (tableName && validateTable(tableName)) {
            const table = sqlDatabases.find(db => db.name === tableName);
            if (table) {
                return `テーブル '${tableName}' のスキーマ:
カラム: ${table.columns.join(', ')}
サンプルデータ: ${JSON.stringify(table.rows.slice(0, 3))}`;
            }
        }

        // Return all available tables
        return `利用可能なテーブルとスキーマ:
${sqlDatabases.map(db => 
    `- ${db.name}: ${db.columns.join(', ')}`
).join('\n')}`;
    }

    return {
        getAvailableTables,
        getTableColumns,
        validateTable,
        validateTableColumns,
        extractSqlReferences,
        validateGeneratedQuestion,
        getDatabaseSchemaForPrompt
    };
}