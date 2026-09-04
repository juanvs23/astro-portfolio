import { Schema, model, models } from 'mongoose';

export interface SiteInfoDoc {
  name: string;
  tagline_es: string;
  tagline_en: string;
  role: string;
  location: string;
  email: string;
}

const siteInfoSchema = new Schema<SiteInfoDoc>(
  {
    name: { type: String, required: true },
    tagline_es: { type: String, default: '' },
    tagline_en: { type: String, default: '' },
    role: { type: String, default: '' },
    location: { type: String, default: '' },
    email: { type: String, default: '' },
  },
  { timestamps: true },
);

export const SiteInfoModel =
  (models.SiteInfo as ReturnType<typeof model<SiteInfoDoc>>) ??
  model<SiteInfoDoc>('SiteInfo', siteInfoSchema);