// Global type augmentation for Vite's import.meta.glob used in server endpoints
interface ImportMeta {
    glob(pattern: string, options?: { eager?: boolean; import?: string }): Record<string, any>;
}
