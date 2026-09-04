import { Schema, model, models, type Model } from 'mongoose';

export interface SiteInfoDoc {
  name: string;
  jobTitle: string;
  url: string;
  telephone: string;
  logo: string;
  brandName: string;
  twitterHandle: string;
  sameAs: string[];
}

const siteInfoSchema = new Schema<SiteInfoDoc>(
  {
    name: { type: String, required: true },
    jobTitle: { type: String, default: '' },
    url: { type: String, default: '' },
    telephone: { type: String, default: '' },
    logo: { type: String, default: '' },
    brandName: { type: String, default: '' },
    twitterHandle: { type: String, default: '' },
    sameAs: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const SiteInfoModel: Model<SiteInfoDoc> =
  (models.SiteInfo as Model<SiteInfoDoc> | undefined) ?? model('SiteInfo', siteInfoSchema);