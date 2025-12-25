import { redirect } from 'next/navigation';

export default async function ProductDetailRedirect({ params }: any) {
    const { slug } = params;
    redirect(`/services/${slug}`);
}
