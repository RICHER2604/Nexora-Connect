const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For production, use a real service like SendGrid, Mailgun, or Gmail App Password
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: process.env.EMAIL_PORT || 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: `Nexora Connect <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
