import { Schema, model, Document } from 'mongoose';

interface IHour extends Document {
  hour: string;
  enabled: boolean;
}

const HourSchema = new Schema({
  hour: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

interface IDay extends Document {
  date: string;
  disabled: boolean;
  hours: IHour[];
}

const DaySchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: true,
  },
  hours: {
    type: [HourSchema],
    required: true,
  },
});

const DayModel = model<IDay>('Day', DaySchema);

export { DayModel, IDay, IHour };
