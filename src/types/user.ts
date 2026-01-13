export interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    password?: string; // optional when listing
    role: string; // e.g. 'admin' | 'superadmin'
    designation?: string;
    photo?: string;
    signature?: string;
    createdAt: string;
    updatedAt: string;
}
