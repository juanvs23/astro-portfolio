import { Schema, model, models, type Model } from 'mongoose';

export interface SocialLinkDoc {
  name: string;
  href: string;
  icon: string;
  order: number;
  visible: boolean;
}

const socialLinkSchema = new Schema<SocialLinkDoc>(
  {
    name: { type: String, required: true },
    href: { type: String, required: true },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const SocialLinkModel: Model<SocialLinkDoc> =
  (models.SocialLink as Model<SocialLinkDoc> | undefined) ?? model('SocialLink', socialLinkSchema);