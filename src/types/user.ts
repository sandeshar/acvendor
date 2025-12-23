export interface User {
    id: number;
    name: string;
    email: string;
    password?: string; // optional when listing
    role: string; // e.g. 'admin' | 'superadmin'
    createdAt: string;
    updatedAt: string;
}
