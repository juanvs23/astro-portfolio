import { Schema, model, models, type Model } from 'mongoose';

export interface SocialLinkDoc {
  platform: string;
  url: string;
  order: number;
  visible: boolean;
}

const socialLinkSchema = new Schema<SocialLinkDoc>(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const SocialLinkModel: Model<SocialLinkDoc> =
  (models.SocialLink as Model<SocialLinkDoc> | undefined) ?? model('SocialLink', socialLinkSchema);