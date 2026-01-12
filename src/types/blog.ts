export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    tags: string | null;
    thumbnail: string | null;
    authorId: number;
    status: number;
    category_id?: string | null;
    category_name?: string | null;
    category_slug?: string | null;
    createdAt: string;
    updatedAt: string;
}
