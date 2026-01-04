import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { AboutPageJourney } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch journey section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const journey = await AboutPageJourney.findById(id).lean();

            if (!journey) {
                return NextResponse.json({ error: 'Journey section not found' }, { status: 404 });
            }

            const j = { ...journey } as any;
            if (j.highlights && typeof j.highlights === 'string') {
                try {
                    j.highlights = JSON.parse(j.highlights);
                } catch (e) {
                    j.highlights = [];
                }
            } else {
                j.highlights = j.highlights || [];
            }

            return NextResponse.json(j);
        }

        const journey = await AboutPageJourney.findOne({ is_active: 1 }).lean();

        if (!journey) {
            return NextResponse.json({ error: 'No active journey section found' }, { status: 404 });
        }

        const j = { ...journey } as any;
        if (j.highlights && typeof j.highlights === 'string') {
            try {
                j.highlights = JSON.parse(j.highlights);
            } catch (e) {
                j.highlights = [];
            }
        } else {
            j.highlights = j.highlights || [];
        }

        return NextResponse.json(j);
    } catch (error) {
        console.error('Error fetching journey section:', error);
        return NextResponse.json({ error: 'Failed to fetch journey section' }, { status: 500 });
    }
}

// POST - Create journey section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, paragraph1, paragraph2, thinking_box_title = '', thinking_box_content = '', highlights = [], hero_image = '', hero_image_alt = '', is_active = 1 } = body;

        if (!title || !paragraph1 || !paragraph2) {
            return NextResponse.json({ error: 'Title and paragraphs are required' }, { status: 400 });
        }

        const highlightsStr = Array.isArray(highlights) ? JSON.stringify(highlights) : (typeof highlights === 'string' ? highlights : JSON.stringify([]));

        const newJourney = await AboutPageJourney.create({
            title,
            paragraph1,
            paragraph2,
            thinking_box_title,
            thinking_box_content,
            highlights: highlightsStr,
            hero_image,
            hero_image_alt,
            is_active,
        });

        return NextResponse.json(
            { success: true, message: 'Journey section created successfully', id: newJourney._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating journey section:', error);
        return NextResponse.json({ error: 'Failed to create journey section' }, { status: 500 });
    }
}

// PUT - Update journey section
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, title, paragraph1, paragraph2, thinking_box_title, thinking_box_content, highlights, hero_image, hero_image_alt, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (paragraph1 !== undefined) updateData.paragraph1 = paragraph1;
        if (paragraph2 !== undefined) updateData.paragraph2 = paragraph2;
        if (thinking_box_title !== undefined) updateData.thinking_box_title = thinking_box_title;
        if (thinking_box_content !== undefined) updateData.thinking_box_content = thinking_box_content;
        if (highlights !== undefined) {
            if (Array.isArray(highlights)) updateData.highlights = JSON.stringify(highlights);
            else if (typeof highlights === 'string') updateData.highlights = highlights;
            else updateData.highlights = JSON.stringify(highlights);
        }
        if (hero_image !== undefined) updateData.hero_image = hero_image;
        if (hero_image_alt !== undefined) updateData.hero_image_alt = hero_image_alt;
        if (is_active !== undefined) updateData.is_active = is_active;

        await AboutPageJourney.findByIdAndUpdate(id, updateData, { new: true });
        revalidateTag('about-journey', 'max');
        return NextResponse.json({ success: true, message: 'Journey section updated successfully' });
    } catch (error) {
        console.error('Error updating journey section:', error);
        return NextResponse.json({ error: 'Failed to update journey section' }, { status: 500 });
    }
}

// DELETE - Delete journey section
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await AboutPageJourney.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Journey section deleted successfully' });
    } catch (error) {
        console.error('Error deleting journey section:', error);
        return NextResponse.json({ error: 'Failed to delete journey section' }, { status: 500 });
    }
}
