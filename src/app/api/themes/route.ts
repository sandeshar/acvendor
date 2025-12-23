import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ success: false, error: 'Themes API removed' }, { status: 410 });
}

export async function POST() {
    return NextResponse.json({ success: false, error: 'Not available' }, { status: 405 });
}

export async function DELETE() {
    return NextResponse.json({ success: false, error: 'Not available' }, { status: 405 });
}

