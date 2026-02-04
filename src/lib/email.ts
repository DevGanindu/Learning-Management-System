import nodemailer from "nodemailer";

const smtpOptions = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
};

const transporter = nodemailer.createTransport(smtpOptions);

// Helper to construct the "from" address
const getFromAddress = () => {
    const name = process.env.EMAIL_FROM_NAME || "NextLMS Support";
    const addr = process.env.EMAIL_FROM_ADDR || process.env.SMTP_USER;
    return `"${name}" <${addr}>`;
};

export const sendRegistrationEmail = async (email: string, studentId: string, name: string) => {
    try {
        const mailOptions = {
            from: getFromAddress(),
            to: email,
            subject: "Registration Successful - NextLMS",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #4F46E5;">Welcome to NextLMS!</h1>
                    </div>
                    
                    <p style="color: #333; font-size: 16px;">Dear <strong>${name}</strong>,</p>
                    
                    <p style="color: #555; font-size: 16px; line-height: 1.5;">
                        Congratulations! Your registration for NextLMS has been successfully received. We are excited to have you on board.
                    </p>
                    
                    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0; color: #6B7280; font-size: 14px;">Your Student ID is:</p>
                        <p style="margin: 5px 0 0 0; color: #111827; font-size: 24px; font-weight: bold; letter-spacing: 1px;">${studentId}</p>
                    </div>

                    <p style="color: #555; font-size: 16px; line-height: 1.5;">
                        Please use this Student ID to log in to your account. Note that your account is currently <strong>PENDING APPROVAL</strong> by an administrator. You will be able to access the full features once approved.
                    </p>

                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
                    
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                        This is an automated message, please do not reply directly to this email.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email: ", error);
        return false;
    }
};

// Lightweight test email helper for diagnostics
export const sendTestEmail = async (to: string) => {
    const mailOptions = {
        from: getFromAddress(),
        to,
        subject: "Test Email",
        text: "Hello from NextLMS!",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Test email sent:", info.messageId);
    return true;
};