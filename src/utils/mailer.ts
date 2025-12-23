import nodemailer from 'nodemailer';

interface MailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
        // If SMTP is not configured, fall back to a JSON transport in non-production so
        // development/testing won't crash and emails are logged as JSON for inspection.
        if (process.env.NODE_ENV === 'production') {
            throw new Error('SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.');
        }

        console.warn('SMTP not configured — using JSON transport (emails will be logged, not sent).');
        transporter = nodemailer.createTransport({ jsonTransport: true });
        return transporter;
    }

    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user,
            pass,
        },
    });

    return transporter;
}

export async function sendMail(opts: MailOptions) {
    const from = opts.from || process.env.FROM_EMAIL || `no-reply@${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'contentsolution.np'}`;

    try {
        const t = getTransporter();

        const info = await t.sendMail({
            from,
            to: opts.to,
            subject: opts.subject,
            text: opts.text,
            html: opts.html,
        });

        // If using the JSON transport (dev fallback), log the generated message
        if ((info as any)?.message) {
            console.info('Mailer (dev) output:', info);
        }

        return info;
    } catch (err) {
        // Don't rethrow — log and return a useful object so callers can continue
        console.error('Error in sendMail:', err instanceof Error ? err.message : err);
        return { ok: false, error: err } as any;
    }
}
