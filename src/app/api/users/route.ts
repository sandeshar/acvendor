import { connectDB } from "@/db";
import { User } from "@/db/schema";
import { hashPassword } from "@/utils/authHelper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    await connectDB();
    const id = request.nextUrl.searchParams.get('id');
    if (id) {
        try {
            const user = await User.findById(id).lean();
            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(user);
        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to fetch user' },
                { status: 500 }
            );
        }
    }
    try {
        const allUsers = await User.find().lean();
        return NextResponse.json(allUsers);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { name, email, password, role } = await request.json();
        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await User.create({ name, email, password: hashedPassword, role });
        return NextResponse.json(newUser);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const { id, name, email, password, role } = await request.json();
        if (!id || !name || !email || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        const updateData: any = { name, email, role };
        if (password && password.trim() !== '') {
            updateData.password = await hashPassword(password);
        }
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const id = request.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }
        await User.findByIdAndDelete(id);
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}