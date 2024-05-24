import { Router, Request, Response } from 'express';
import { Booking, IBooking } from '../models/booking';
import { DayModel, IDay, IHour } from '../models/day';

const router = Router();

router.post('/bookings', async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, message, howDidYouHear, date, hours } = req.body;

    const checkDate = await DayModel.findOne({ date });
    if (!checkDate) {
      await DayModel.create({ date, disabled: false, hours: [] });
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

    res.json(booking);
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
    const { status } = req.body;

    const updatedBooking: IBooking | null = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
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

    res.json({ message: 'Booking updated successfully', updatedBooking });
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

    if (booking.date && booking.hours) {
      const existingDay: IDay | null = await DayModel.findOne({ date: booking.date });

      if (existingDay) {
        const bookedHourParts = booking.hours.split('/');
        const bookedHourTitle = bookedHourParts[0].trim();

        const matchingHour = existingDay.hours.find(existingHour => existingHour.hour.includes(bookedHourTitle));

        if (matchingHour) {
          matchingHour.enabled = true;
        } else {
          const newHour: IHour = { hour: booking.hours, enabled: true } as IHour;
          existingDay.hours.push(newHour);
        }

        const hourOptions = [
          '2 Hours/$70',
          '4 Hours/$130',
          '8 Hours/$270',
          '10 Hours/$340',
          'Full Day 14+ Hours/$550',
        ];

        existingDay.hours.sort((a, b) => {
          const aIndex = hourOptions.indexOf(a.hour);
          const bIndex = hourOptions.indexOf(b.hour);
          return aIndex - bIndex;
        });

        await existingDay.save();
      }
    }

    await Booking.findByIdAndDelete(bookingId);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
