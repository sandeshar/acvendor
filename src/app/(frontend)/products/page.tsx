import { redirect } from 'next/navigation';

export default function ProductsRedirectPage() {
    // Redirect to Midea listing
    redirect('/midea-ac');
}
