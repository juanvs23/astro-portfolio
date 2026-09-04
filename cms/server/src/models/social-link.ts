import { Schema, model, models } from 'mongoose';

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

export const SocialLinkModel =
  (models.SocialLink as ReturnType<typeof model<SocialLinkDoc>>) ??
  model<SocialLinkDoc>('SocialLink', socialLinkSchema);