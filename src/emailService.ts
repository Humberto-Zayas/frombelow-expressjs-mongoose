// src/emailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email with optional booking details.
 * 
 * @param to - The recipient's email address.
 * @param subject - The email subject.
 * @param text - The base email message.
 * @param bookingDetails - Optional booking details to include in the email.
 * 
 * @returns A Promise resolving the result of the email send operation.
 */
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  bookingDetails?: Record<string, any>
): Promise<void> => {
  // Format the email content
  const formattedDetails = bookingDetails
    ? `
      ${text}

      Booking Details:
      ----------------
      Name: ${bookingDetails.name}
      Email: ${bookingDetails.email}
      Phone Number: ${bookingDetails.phoneNumber}
      Message: ${bookingDetails.message}
      How Did You Hear: ${bookingDetails.howDidYouHear}
      Date: ${bookingDetails.date}
      Hours: ${bookingDetails.hours}
    `.trim()
    : text;

  // Email configuration
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: formattedDetails,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error(`Failed to send email to ${to}`);
  }
};
