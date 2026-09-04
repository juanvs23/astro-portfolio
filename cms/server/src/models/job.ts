import { Schema, model, models, type Model } from 'mongoose';

export interface JobDoc {
  title_es: string;
  title_en: string;
  company_es: string;
  company_en: string;
  start: string;
  /** Empty string means "current role". */
  end: string;
  description_es: string;
  description_en: string;
  order: number;
  visible: boolean;
}

const jobSchema = new Schema<JobDoc>(
  {
    title_es: { type: String, required: true },
    title_en: { type: String, required: true },
    company_es: { type: String, required: true },
    company_en: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, default: '' },
    description_es: { type: String, default: '' },
    description_en: { type: String, default: '' },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const JobModel: Model<JobDoc> =
  (models.Job as Model<JobDoc> | undefined) ?? model('Job', jobSchema);