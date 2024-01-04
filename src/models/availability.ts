import { Schema, model, Document } from 'mongoose';

interface IAvailability extends Document {
  maxDate: string;
}

const AvailabilitySchema = new Schema({
  maxDate: {
    type: String,
    required: true,
  },
});

const AvailabilityModel = model<IAvailability>('Availability', AvailabilitySchema);

export { AvailabilityModel, IAvailability };
