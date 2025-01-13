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

/**
 * Sends a status update email to the client (confirmed or denied).
 * 
 * @param to - The recipient's email address.
 * @param status - The status of the booking ('confirmed' or 'denied').
 * @param bookingId - The ID of the booking.
 * @param depositLink - Optional link for deposit payment (for confirmed bookings).
 * @returns A Promise resolving the result of the email send operation.
 */
export const sendStatusEmail = async (
  to: string,
  status: string,
  bookingId: string,
  depositLink?: string
): Promise<void> => {
  let subject: string;
  let text: string;

  if (status === 'confirmed') {
    subject = 'Your Booking Has Been Confirmed';
    text = `
      We're excited to let you know that your booking has been confirmed! 🎉
      Booking ID: ${bookingId}

      To secure your booking, please complete your deposit at the following link:
      ${depositLink || 'No deposit link provided.'}

      If you have any questions, feel free to reach out. We look forward to seeing you!
    `.trim();
  } else if (status === 'denied') {
    subject = 'Your Booking Has Been Denied';
    text = `
      We're sorry to inform you that your booking request has been denied.
      Booking ID: ${bookingId}

      If you have any questions or concerns, please don't hesitate to contact us.
    `.trim();
  } else {
    throw new Error('Invalid status. Status should be "confirmed" or "denied".');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Status email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send status email to ${to}:`, error);
    throw new Error(`Failed to send status email to ${to}`);
  }
};
