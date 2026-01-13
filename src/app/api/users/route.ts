import { connectDB } from "@/db";
import { User } from "@/db/schema";
import { hashPassword, returnRole } from "@/utils/authHelper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    await connectDB();
    const cookie = request.cookies.get('admin_auth')?.value || '';
    const role = returnRole(cookie);

    if (role !== 'superadmin') {
        return NextResponse.json(
            { error: 'Forbidden: Insufficient permissions' },
            { status: 403 }
        );
    }

    const id = request.nextUrl.searchParams.get('id');
    if (id) {
        try {
            const user = await User.findById(id).select('-password').lean();
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
        const allUsers = await User.find().select('-password').lean();
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
        const cookie = request.cookies.get('admin_auth')?.value || '';
        const role = returnRole(cookie);

        if (role !== 'superadmin') {
            return NextResponse.json(
                { error: 'Forbidden: Insufficient permissions' },
                { status: 403 }
            );
        }

        const { name, email, password, role: userRole, designation, photo, signature } = await request.json();
        if (!name || !email || !password || !userRole) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await User.create({ name, email, password: hashedPassword, role: userRole, designation: designation || '', photo: photo || '', signature: signature || '' });
        const userObj = newUser.toObject();
        delete userObj.password;
        return NextResponse.json(userObj);
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
        const cookie = request.cookies.get('admin_auth')?.value || '';
        const role = returnRole(cookie);

        if (role !== 'superadmin') {
            return NextResponse.json(
                { error: 'Forbidden: Insufficient permissions' },
                { status: 403 }
            );
        }

        const { id, name, email, password, role: userRole, designation, photo, signature } = await request.json();
        if (!id || !name || !email || !userRole) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        const updateData: any = { name, email, role: userRole };
        if (designation !== undefined) {
            updateData.designation = designation;
        }
        if (photo !== undefined) {
            updateData.photo = photo;
        }
        if (signature !== undefined) {
            updateData.signature = signature;
        }
        if (password && password.trim() !== '') {
            const hashedPassword = await hashPassword(password);
            updateData.password = hashedPassword;
        }
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
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
        const cookie = request.cookies.get('admin_auth')?.value || '';
        const role = returnRole(cookie);

        if (role !== 'superadmin') {
            return NextResponse.json(
                { error: 'Forbidden: Insufficient permissions' },
                { status: 403 }
            );
        }

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