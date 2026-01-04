import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { HomepageTrustLogos } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch trust logos
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const logo = await HomepageTrustLogos.findById(id).lean();

            if (!logo) {
                return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
            }

            return NextResponse.json(logo);
        }

        // Get all active logos ordered by display_order
        const logos = await HomepageTrustLogos.find({ is_active: 1 }).sort({ display_order: 1 }).lean();

        return NextResponse.json(logos);
    } catch (error) {
        console.error('Error fetching trust logos:', error);
        return NextResponse.json({ error: 'Failed to fetch trust logos' }, { status: 500 });
    }
}

// POST - Create trust logo
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { alt_text, logo_url, invert = 0, display_order, is_active = 1 } = body;

        if (!alt_text || !logo_url || display_order === undefined) {
            return NextResponse.json(
                { error: 'alt_text, logo_url, and display_order are required' },
                { status: 400 }
            );
        }

        const result = await HomepageTrustLogos.create({
            alt_text,
            logo_url,
            invert,
            display_order,
            is_active,
        });
        revalidateTag('homepage-trust-logos', 'max');

        return NextResponse.json(
            { success: true, message: 'Trust logo created successfully', id: result._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating trust logo:', error);
        return NextResponse.json({ error: 'Failed to create trust logo' }, { status: 500 });
    }
}

// PUT - Update trust logo
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, alt_text, logo_url, invert, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (alt_text !== undefined) updateData.alt_text = alt_text;
        if (logo_url !== undefined) updateData.logo_url = logo_url;
        if (invert !== undefined) updateData.invert = invert;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await HomepageTrustLogos.findByIdAndUpdate(id, updateData, { new: true });
        revalidateTag('homepage-trust-logos', 'max');

        return NextResponse.json({ success: true, message: 'Trust logo updated successfully' });
    } catch (error) {
        console.error('Error updating trust logo:', error);
        return NextResponse.json({ error: 'Failed to update trust logo' }, { status: 500 });
    }
}

// DELETE - Delete trust logo
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await HomepageTrustLogos.findByIdAndDelete(id);
        revalidateTag('homepage-trust-logos', 'max');

        return NextResponse.json({ success: true, message: 'Trust logo deleted successfully' });
    } catch (error) {
        console.error('Error deleting trust logo:', error);
        return NextResponse.json({ error: 'Failed to delete trust logo' }, { status: 500 });
    }
}
