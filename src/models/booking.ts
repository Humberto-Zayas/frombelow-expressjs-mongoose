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
  paymentStatus: 'deposit paid' | 'paid' | 'unpaid';
  paymentMethod: 'venmo' | 'cashapp' | 'zelle' | 'cash' | 'none';
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
  paymentStatus: {
    type: String,
    enum: ['deposit paid', 'paid', 'unpaid'],
    default: 'unpaid',
  },
  paymentMethod: {
    type: String,
    enum: ['venmo', 'cashapp', 'zelle', 'cash', 'none'],
    default: 'none',
  },
});

// Create the model for Booking
const Booking = model<IBooking>('Booking', BookingSchema);

export { Booking, IBooking };
