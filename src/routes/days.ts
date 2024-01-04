import { Router } from 'express';
import { DayModel, IDay } from '../models/day';
import { AvailabilityModel, IAvailability } from '../models/availability';

const router = Router();

router.get('/days', async (req, res) => {
  try {
    const days: IDay[] = await DayModel.find();
    res.json(days);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/blackoutDays', async (req, res) => {
  try {
    const blackoutDays: IDay[] = await DayModel.find({ disabled: true });
    res.json(blackoutDays);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/days/:date', async (req, res) => {
  try {
    const day: IDay | null = await DayModel.findOne({ date: req.params.date });
    if (day) {
      res.json(day);
    } else {
      res.status(404).json({ error: 'Day not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/users', async (req, res) => {
  try {
    // Assuming User is a mongoose model
    // const user = await UserModel.create(req.body);
    // const token = signToken(user);
    // res.json({ token, user });
    res.status(501).json({ error: 'Not implemented' });
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
});

router.post('/days', async (req, res) => {
  try {
    const checkDate: IDay | null = await DayModel.findOne({ date: req.body.date });
    if (!checkDate) {
      const date: IDay = await DayModel.create(req.body);
      res.json(date);
    } else {
      throw new Error('Date already exists');
    }
  } catch (error) {
    res.status(400).json({ error: 'Date already exists' });
  }
});

router.post('/editDay', async (req, res) => {
  try {
    const { date, disabled } = req.body;

    let existingDay: IDay | null = await DayModel.findOne({ date });

    if (!existingDay) {
      existingDay = await DayModel.create({ date, disabled, hours: [] }); // Initialize hours array for a new day
    } else {
      existingDay.disabled = disabled;

      // Remove hours if the day is disabled
      if (disabled) {
        existingDay.hours = [];
      }

      await existingDay.save();
    }

    res.json(existingDay);
  } catch (error) {
    res.status(400).json({ error: 'Error processing request' });
  }
});

router.post('/updateOrCreateDay', async (req, res) => {
  try {
    const { date, selectedHours } = req.body;

    // Check if the day exists
    const existingDay: IDay | null = await DayModel.findOne({ date });

    if (existingDay) {
      // If the day exists, update the hours
      existingDay.hours = selectedHours;

      // Enable the day if it's disabled
      if (existingDay.disabled) {
        existingDay.disabled = false;
      }

      await existingDay.save();
      res.json(existingDay);
    } else {
      // If the day doesn't exist, create a new day with hours and disabled set to false
      const newDay: IDay = await DayModel.create({
        date,
        hours: selectedHours,
        disabled: false,
      });
      res.json(newDay);
    }
  } catch (error) {
    res.status(400).json({ error: 'Error processing request' });
  }
});

router.get('/getMaxDate', async (req, res) => {
  try {
    const availability: IAvailability | null = await AvailabilityModel.findOne();
    if (availability) {
      res.json({ maxDate: availability.maxDate });
    } else {
      res.status(404).json({ error: 'Max date not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error processing request' });
  }
});

router.post('/updateMaxDate', async (req, res) => {
  try {
    const { maxDate } = req.body;

    let availability: IAvailability | null = await AvailabilityModel.findOne();

    if (!availability) {
      availability = await AvailabilityModel.create({ maxDate });
    } else {
      availability.maxDate = maxDate;
      await availability.save();
    }

    res.json(availability);
  } catch (error) {
    res.status(400).json({ error: 'Error processing request' });
  }
});


export default router;
