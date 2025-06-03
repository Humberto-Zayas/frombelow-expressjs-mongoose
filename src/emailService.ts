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

// Determine the base URL based on the environment
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://frombelowstudio.com'
    : 'http://localhost:3000';

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
  bookingDetails?: Record<string, any>,
  isAdmin: boolean = false
): Promise<void> => {
  const baseUrl = process.env.NODE_ENV === 'production'
  ? 'https://frombelowstudio.com'
  : 'http://localhost:3000';

const bookingLink = bookingDetails?._id
  ? `${baseUrl}/booking/${bookingDetails._id}`
  : '';

const formattedDetails = bookingDetails
  ? `
    ${isAdmin
      ? `${bookingDetails.name} has sent a new booking request. Manage it here: ${bookingLink}`
      : text}

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

You can view the status of your booking at the following link:
${depositLink || 'No deposit link provided.'}

If you have any questions, feel free to reach out to us at frombelowstudio@gmail.com.`.trim();

  } else if (status === 'denied') {
    subject = 'Your Booking Has Been Denied';
    text = `
      We're sorry to inform you that your booking request has been denied.
      Booking ID: ${bookingId}

      If you have any questions or concerns, please reach out to us at frombelowstudio@gmail.com.
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

/**
 * Sends an email notification when a booking is updated.
 * 
 * @param to - The recipient's email address.
 * @param name - The name of the client.
 * @param newDate - The updated date of the booking.
 * @param newHours - The updated hours of the booking.
 * @returns A Promise resolving the result of the email send operation.
 */
export const sendBookingChangeEmail = async (
  to: string,
  name: string,
  id: number,
  newDate: string,
  newHours: string
): Promise<void> => {
  const subject = 'Your Booking Has Been Updated';
  const text = `
    Hello ${name},

    Your booking has been updated. Here are the new details:

    New Date: ${newDate}
    New Hours: ${newHours}
    Booking Status: ${process.env.FRONTEND_URL}/booking/${id}

    If you have any questions, feel free to reach out to frombelowstudio@gmail.com.

    Thank you!
  `.trim();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking change email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send booking change email to ${to}:`, error);
    throw new Error(`Failed to send booking change email to ${to}`);
  }
};

/**
 * Sends an email notification when a booking payment status is updated.
 * 
 * @param to - The recipient's email address.
 * @param name - The name of the client.
 * @param id - The booking ID.
 * @param paymentStatus - The updated payment status.
 * @returns A Promise resolving the result of the email send operation.
 */
export const sendPaymentStatusEmail = async (
  to: string,
  name: string,
  id: string,
  paymentStatus: string
): Promise<void> => {
  const subject = 'Payment Status Updated for Your Booking';
  const text = `
    Hello ${name},

    Your payment status for your booking has been updated.

    **Booking Details:**
    - Booking ID: ${id}
    - New Payment Status: ${paymentStatus}

    You can view your booking here:
    ${baseUrl}/booking/${id}

    If you have any questions, feel free to reach out to frombelowstudio@gmail.com.

    Best regards,  
    From Below Studio
  `.trim();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Payment status email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send payment status email to ${to}:`, error);
    throw new Error(`Failed to send payment status email to ${to}`);
  }
};

/**
 * Sends a cash payment notification email to the admin so they can confirm it manually.
 *
 * @param to - Admin email address.
 * @param clientName - Name of the client.
 * @param bookingId - The related booking ID.
 * @param paymentMethod - e.g., 'Cash', 'Cash App', 'Zelle', etc.
 * @param notes - Optional additional info provided by the client.
 */
export const sendAdminCashPaymentNotificationEmail = async (
  to: string,
  clientName: string,
  bookingId: string,
  paymentMethod: string,
  notes?: string
): Promise<void> => {
  const subject = `Manual Payment Confirmation Needed for Booking ${bookingId}`;
  const adminLink = `${baseUrl}/admin?component=bookings`;

  const text = `
Hello Admin,

${clientName} has submitted a manual payment using "${paymentMethod}" for booking ID: ${bookingId}.
${notes ? `Client Notes:\n"${notes}"\n` : ''}  
Please review and confirm the payment manually in the admin dashboard:

${adminLink}

Thanks,  
From Below Studio
`.trim();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Cash payment notification email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send cash payment notification email to ${to}:`, error);
    throw new Error(`Failed to send cash payment notification email to ${to}`);
  }
};
