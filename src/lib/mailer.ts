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
