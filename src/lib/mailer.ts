import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;
let testAccount: nodemailer.TestAccount | null = null;

async function getTransporter() {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("[Raseed Mailer] Ready using Ethereal Test Account.");
    }

    return transporter;
}

export async function sendOtpEmail(email: string, otp: string) {
    const mailer = await getTransporter();

    const info = await mailer.sendMail({
        from: '"Raseed App" <noreply@raseed.com>',
        to: email,
        subject: "Your Raseed Login Code",
        text: `Your Raseed login code is: ${otp}`,
        html: `<b>Your Raseed login code is: <h1>${otp}</h1></b>`,
    });

    console.log(`[Raseed Mailer] Message sent: ${info.messageId}`);
    if (testAccount) {
        console.log(
            `[Raseed Mailer] Preview URL: ${nodemailer.getTestMessageUrl(info)}`
        );
    }
}

export async function sendRetailerVerificationEmail(email: string, verificationUrl: string) {
    const mailer = await getTransporter();

    const info = await mailer.sendMail({
        from: '"Raseed App" <noreply@raseed.com>',
        to: email,
        subject: "Verify your Raseed retailer account",
        text: `Verify your retailer email by opening this link: ${verificationUrl}`,
        html: `
            <div style="margin:0;padding:0;background:#f3f4f6;">
                <div style="max-width:600px;margin:0 auto;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="background:linear-gradient(135deg,#0F4716 0%,#165d1e 100%);padding:28px 32px;">
                            <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#d1fae5;font-weight:700;">Raseed</div>
                            <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">Verify your retailer account</h1>
                        </div>

                        <div style="padding:32px;">
                            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">
                                Thanks for registering your store with Raseed. Confirm your email address to complete setup and create your password.
                            </p>

                            <div style="margin:24px 0 28px;">
                                <a href="${verificationUrl}" style="display:inline-block;background:#0F4716;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:10px;font-size:15px;font-weight:700;">
                                    Verify email
                                </a>
                            </div>

                            <div style="padding:16px 18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#111827;">If the button does not work</p>
                                <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;word-break:break-all;">Copy and paste this link into your browser: <span style="color:#0F4716;">${verificationUrl}</span></p>
                            </div>

                            <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6b7280;">
                                If you did not request this email, you can safely ignore it.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `,
    });

    console.log(`[Raseed Mailer] Verification message sent: ${info.messageId}`);
    if (testAccount) {
        console.log(
            `[Raseed Mailer] Preview URL: ${nodemailer.getTestMessageUrl(info)}`
        );
    }
}
