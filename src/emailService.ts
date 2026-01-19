// src/emailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dayjs from 'dayjs';

// Load environment variables
dotenv.config();

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 15000,     // 15 seconds
} as nodemailer.TransportOptions);

// Determine the base URL based on the environment
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://create-react-app-site-production-d956.up.railway.app'
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
    ? 'https://create-react-app-site-production-d956.up.railway.app'
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error(`Failed to send email to ${to}: ${errorMessage}`);
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
  depositLink?: string,
  date?: string,
  reason: string = ''
): Promise<void> => {
  let subject: string;
  let text: string;

  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  if (status === 'confirmed') {
    subject = `Your Session for ${date} Has Been Confirmed`;
    text = `
We're excited to let you know that your booking for ${date} has been confirmed! 🎉

You can view and add your booking to your calendar here:
${baseUrl}/booking/${bookingId}

**Booking Details:**
  - Booking Date: ${date}
  - Session Status: ${formattedStatus}

If you have any questions, feel free to reach out to us at frombelowstudio@gmail.com.`.trim();

  } else if (status === 'denied') {
    subject = `Your Session for ${date} Has Been Denied`;
    text = `
We're sorry to inform you that your booking request for ${date} has been denied.

You can view the status of the booking here:
${baseUrl}/booking/${bookingId}

**Booking Details:**
  - Requested Booking Date: ${date}
  - Session Status: ${formattedStatus}

${reason ? `**Reason for Denial:**\n${reason}\n\n` : ''}If you have any questions or concerns, please reach out to us at frombelowstudio@gmail.com.`.trim();

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
  originalDate: string,
  originalHours: string,
  newDate: string,
  newHours: string
): Promise<void> => {

  const formattedDate = dayjs(newDate).format('M/DD/YY');


  const subject = `Your Session Has Been Updated from ${originalDate} to ${formattedDate}`;
  const text = `
    Hello ${name},

Your booking has been updated from from ${originalDate} to ${formattedDate}. Here are the new details:

  - New Date: ${formattedDate}
  - New Hours: ${newHours}
  - Original Date: ${originalDate}
  - Original Hours: ${originalHours}

You can view and add your booking to your calendar here:
${baseUrl}/booking/${id}

If you have any questions, feel free to reach out to frombelowstudio@gmail.com.`.trim();

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
 * @param date
 * @returns A Promise resolving the result of the email send operation.
 */

export const sendPaymentStatusEmail = async (
  to: string,
  name: string,
  id: string,
  paymentStatus: string,
  date: string
): Promise<void> => {

  const formattedStatus = paymentStatus
    .split('_') // ['deposit', 'paid']
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // ['Deposit', 'Paid']
    .join(' '); // 'Deposit Paid'

  const subject = `Your Session for ${date} is Confirmed`;
  const text = `
    Hello ${name},

Your payment status for your booking, on ${date}, has been updated and the session is confirmed! 🎉

**Booking Details:**
  - Booking Date: ${date}
  - New Payment Status: ${formattedStatus}

You can view and add your booking to your calendar here:
${baseUrl}/booking/${id}

If you have any questions, feel free to reach out to frombelowstudio@gmail.com.

Best regards,  
From Below Studio`.trim();

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


${clientName} wants to pay using ${paymentMethod} for their session.
${notes ? `Client Notes:\n"${notes}"\n` : ''}  
Review and confirm the session manually in the admin dashboard:

${baseUrl}/booking/${bookingId}

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

export const sendContactEmail = async (
  name: string,
  email: string,
  phoneNumber: string,
  serviceType: string,
  referral: string,
  message: string
): Promise<void> => {
  const subject = `New Contact Form Submission: ${serviceType}`;

  const text = `
Name: ${name}
Email: ${email}
Phone: ${phoneNumber}
Service: ${serviceType}
Referral: ${referral}

Message:
${message}
  `.trim();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // or a dedicated inbox
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Contact email sent successfully");
  } catch (error) {
    console.error("Failed to send contact email:", error);
    throw new Error("Failed to send contact email");
  }
};
