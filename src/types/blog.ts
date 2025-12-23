export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    tags: string | null;
    thumbnail: string | null;
    authorId: number;
    status: number;
    createdAt: string;
    updatedAt: string;
}
