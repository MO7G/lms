/*
 * File: sendMails
 * Description: This module handles sending emails using Nodemailer and EJS templates.
 * Author: hajji
 * Date: 2023-10-21
 * Company: Mo7aMind
 * License: Mo7aMind
 */


import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path"
import { send } from "process";
require('dotenv').config();


interface Attachment {
    filename: string;
    path: any; // You can define the type of content based on your needs
    cid:any
}

// using Attachmetn interface in case there is more than one attachment !
interface emailOptions {
    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any };
    attachments: Attachment[]; // Use an array to support multiple attachments
}



/**
 * Send an email using Nodemailer and EJS templates.
 *
 * @param {emailOptions} options - Email configuration options.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
const sendMail = async (options: emailOptions): Promise<void> => {

    // Create a Nodemailer transporter with SMTP configuration.
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // SMTP host (e.g., "smtp.example.com")
        port: parseInt(process.env.SMTP_PORT || '587'), // SMTP port (e.g., 587 for TLS)
        service: process.env.SMTP_SERVICE, // SMTP service (e.g., "Gmail" for Gmail)
        auth: {
            user: process.env.SMTP_MAIL, // Your email address
            pass: process.env.SMTP_PASSWORD, // Your email password or app-specific password
        },
    });

    // Extract email options from the input.
    const { email, subject, template, data } = options;

    // Get the path to the email template file.
    const templatePath = path.join(__dirname, '../mails', template);

    // Render the email template using EJS.
    const html: string = await ejs.renderFile(templatePath, data);

    // Configure the email options.
    const mailOptions = {
        from: process.env.SMTP_MAIL, // Sender's email address
        to: email, // Recipient's email address
        subject, // Email subject
        html, // HTML content of the email
    };

    // Send the email using the configured transporter.
    await transporter.sendMail(mailOptions);
}


 export default sendMail;