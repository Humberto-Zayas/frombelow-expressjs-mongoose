import { Router, Request, Response } from 'express';
import {
  sendEmail,
  sendStatusEmail,
  sendBookingChangeEmail,
  sendPaymentStatusEmail
} from '../emailService';
import { Booking, IBooking } from '../models/booking';

const router = Router();

router.post('/send-email', async (req: Request, res: Response) => {
  const { to, subject, text } = req.body;
  try {
    await sendEmail(to, subject, text);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Error sending email' });
  }
});

router.post('/send-status-email', async (req: Request, res: Response) => {
  const { to, status, bookingId, depositLink } = req.body;

  try {
    // 1) Fetch the booking from the database
    const booking = await Booking.findById(bookingId).exec();
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // 2) If it's already confirmed, don’t send again
    if (booking.status === 'confirmed') {
      return res
        .status(200)
        .json({ message: 'Booking already confirmed; no email sent.' });
    }

    // 3) Otherwise, send the status email
    await sendStatusEmail(to, status, bookingId, depositLink);
    res.json({
      message: `Status email (${status}) sent successfully to ${to}`
    });

  } catch (error) {
    console.error('Error sending status email:', error);
    res.status(500).send({ message: 'Error sending status email' });
  }
});

router.post('/send-booking-change-email', async (req: Request, res: Response) => {
  const { to, name, id, newDate, newHours } = req.body;
  try {
    await sendBookingChangeEmail(to, name, id, newDate, newHours);
    res.json({ message: `Booking change email sent successfully to ${to}` });
  } catch (error) {
    console.error('Error sending booking change email:', error);
    res.status(500).send({ message: 'Error sending booking change email' });
  }
});

router.post('/send-payment-status-email', async (req: Request, res: Response) => {
  const { to, name, id, paymentStatus } = req.body;
  try {
    await sendPaymentStatusEmail(to, name, id, paymentStatus);
    res.json({ message: `Payment status email sent successfully to ${to}` });
  } catch (error) {
    console.error('Error sending payment status email:', error);
    res.status(500).send({ message: 'Error sending payment status email' });
  }
});

export default router;
