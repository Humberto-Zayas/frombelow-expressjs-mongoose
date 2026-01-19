import { Router, Request, Response } from 'express';
import { Booking, IBooking } from '../models/booking';
import { DayModel, IDay, IHour } from '../models/day';
import { sendEmail } from '../emailService';
import dayjs from 'dayjs';

// Determine the base URL based on the environment
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://create-react-app-site-production-d956.up.railway.app'
    : 'http://localhost:3000';

const router = Router();

router.post('/bookings', async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, message, howDidYouHear, date, hours } = req.body;

    const checkDate = await DayModel.findOne({ date });
    if (!checkDate) {
      await DayModel.create({ date, disabled: false });
    }

    const booking: IBooking = await Booking.create({
      name,
      email,
      phoneNumber,
      message,
      howDidYouHear,
      date,
      hours,
      status: 'unconfirmed',
    });

    // Format date to M/D/YY
    const formattedDate = dayjs(date).format('M/DD/YY');

    // Construct deposit payment link
    const depositPaymentLink = `${baseUrl}/booking/${booking._id}`;

    // Track email status separately from booking creation
    const emailStatus = { customer: false, admin: false, error: null as string | null };

    // Send customer email - wrapped in separate try-catch
    try {
      await sendEmail(
        email,
        `From Below Studio Booking Confirmation & Deposit Instructions for ${formattedDate}`,
`Hello ${name},

Your booking request for ${formattedDate} has been received and is now pending confirmation.

**Booking Details:**
- Date: ${formattedDate}
- Hours: ${hours}

To secure your booking, please submit a deposit using the following link:
${depositPaymentLink}

If you have any questions or concerns please reach out to frombelowstudio@gmail.com.`);
      emailStatus.customer = true;
    } catch (emailError) {
      const errorMsg = emailError instanceof Error ? emailError.message : 'Unknown email error';
      console.error('Customer email failed:', errorMsg);
      emailStatus.error = errorMsg;
    }

    // Send admin email - wrapped in separate try-catch
    try {
      await sendEmail(
        process.env.ADMIN_EMAIL || 'frombelowstudio@gmail.com',
        `New Booking Request Submitted for ${formattedDate}`,
`${name} has submitted a new booking request on ${formattedDate} for ${hours}.

Manage this booking using the following link:
${depositPaymentLink}

Date: ${formattedDate}
Hours: ${hours}
Email: ${email}
Phone: ${phoneNumber}
Message: ${message}
Heard about us via: ${howDidYouHear}`);
      emailStatus.admin = true;
    } catch (emailError) {
      const errorMsg = emailError instanceof Error ? emailError.message : 'Unknown email error';
      console.error('Admin email failed:', errorMsg);
      if (!emailStatus.error) {
        emailStatus.error = errorMsg;
      }
    }

    // Always return 201 if booking was created successfully
    res.status(201).json({
      booking,
      emailStatus,
      message: emailStatus.customer && emailStatus.admin
        ? 'Booking created and emails sent'
        : 'Booking created but some emails failed to send'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: errorMessage });
  }
});

router.get('/bookings', async (req: Request, res: Response) => {
  try {
    const bookings: IBooking[] = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const booking: IBooking | null = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { paymentStatus, status, paymentMethod } = req.body;

    const updateFields: Partial<IBooking> = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (paymentMethod) updateFields.paymentMethod = paymentMethod;

    const updatedBooking: IBooking | null = await Booking.findByIdAndUpdate(
      bookingId,
      updateFields,
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(updatedBooking);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: errorMessage });
  }
});

router.put('/bookings/datehour/:id', async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { date, hours } = req.body;

    const updatedBooking: IBooking | null = await Booking.findByIdAndUpdate(
      bookingId,
      { date, hours },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(updatedBooking); // <-- Now it returns the full object directly
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: errorMessage });
  }
});

router.delete('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;

    const booking: IBooking | null = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // ❌ Removed all logic that touches DayModel or hours

    await Booking.findByIdAndDelete(bookingId);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
