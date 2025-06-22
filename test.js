// test-password-reset.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testPasswordResetEmail() {
    const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        debug: true,
        logger: true
    };

    console.log('SMTP Config:', {
        ...smtpConfig,
        auth: { user: smtpConfig.auth.user, pass: '***hidden***' }
    });

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully');

        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
            to: 'waseemrazakhan0@gmail.com',
            subject: 'Test Password Reset Email',
            html: '<p>This is a test password reset email.</p>'
        });

        console.log('Test email sent:', info.messageId);
    } catch (error) {
        console.error('Email test failed:', error);
    }
}

testPasswordResetEmail();