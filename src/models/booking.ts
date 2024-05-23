import { Schema, model, Document } from 'mongoose';

// Define the interface for the Booking document
interface IBooking extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  message?: string;
  howDidYouHear?: string;
  date: string;
  hours: string;
  status: 'unconfirmed' | 'confirmed' | 'denied';
}

// Create the schema for the Booking model
const BookingSchema = new Schema<IBooking>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  howDidYouHear: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  hours: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['unconfirmed', 'confirmed', 'denied'],
    default: 'unconfirmed',
  },
});

// Create the model for Booking
const Booking = model<IBooking>('Booking', BookingSchema);

export { Booking, IBooking };
