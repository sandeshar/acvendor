import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ContactFormSubmissions } from '@/db/contactPageSchema';
import { StoreSettings } from '@/db/schema';
import { sendMail } from '@/utils/mailer';
import { returnRole } from '@/utils/authHelper';

// GET - Fetch form submissions
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const cookie = request.cookies.get('admin_auth')?.value || '';
        const role = returnRole(cookie);

        if (!role) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const status = searchParams.get('status');

        if (id) {
            const submission = await ContactFormSubmissions.findById(id).lean();

            if (!submission) {
                return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
            }

            return NextResponse.json({ ...submission, id: submission._id.toString() });
        }

        let submissions;

        if (status) {
            submissions = await ContactFormSubmissions.find({ status }).sort({ createdAt: -1 }).lean();
        } else {
            submissions = await ContactFormSubmissions.find().sort({ createdAt: -1 }).lean();
        }

        // Normalize to include an `id` field for client convenience
        const mapped = submissions.map((s: any) => ({ ...s, id: s._id.toString() }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }
}

// POST - Create form submission
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { name, email, phone, subject, service, message, status = 'new' } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
        }

        const result = await ContactFormSubmissions.create({
            name,
            email,
            phone: phone || null,
            subject: subject || null,
            service: service || null,
            message,
            status,
        });

        // Send notification emails (non-blocking): admin + submitter
        (async () => {
            try {
                await connectDB();
                const settings = await StoreSettings.findOne().lean();
                const adminEmail = settings?.contact_email || (process.env.ADMIN_EMAIL || 'admin@contentsolution.np');

                const adminSubject = `New contact form submission from ${name}`;
                const adminHtml = `<p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                    <p><strong>Service:</strong> ${service || 'N/A'}</p>
                    <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br/>')}</p>`;

                await sendMail({ to: adminEmail, subject: adminSubject, html: adminHtml });

                const userSubject = `Thanks for contacting ${process.env.NEXT_PUBLIC_SITE_TITLE || 'Our Team'}`;
                const userHtml = `<p>Hi ${name},</p>
                    <p>Thanks for reaching out. We've received your message and will get back to you shortly.</p>
                    <p><strong>Your message:</strong></p>
                    <p>${message.replace(/\n/g, '<br/>')}</p>
                    <p>— ${process.env.NEXT_PUBLIC_SITE_TITLE || 'The Team'}</p>`;

                await sendMail({ to: email, subject: userSubject, html: userHtml });
            } catch (err) {
                console.error('Error sending contact submission emails:', err);
            }
        })();

        return NextResponse.json(
            { success: true, message: 'Submission created successfully', id: result._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating submission:', error);
        return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
    }
}

// PUT - Update form submission (mainly for status updates)
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const cookie = request.cookies.get('admin_auth')?.value || '';
        const role = returnRole(cookie);

        if (!role) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, status, phone } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (phone !== undefined) updateData.phone = phone;

        await ContactFormSubmissions.findByIdAndUpdate(id, updateData, { new: true });

        return NextResponse.json({ success: true, message: 'Submission updated successfully' });
    } catch (error) {
        console.error('Error updating submission:', error);
        return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
    }
}

// DELETE - Delete form submission
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

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await ContactFormSubmissions.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Submission deleted successfully' });
    } catch (error) {
        console.error('Error deleting submission:', error);
        return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
    }
}
