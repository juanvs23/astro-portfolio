import { Schema, model, models, type Model } from 'mongoose';

export interface NavLinkDoc {
  label: string;
  href: string;
  order: number;
  visible: boolean;
}

const navLinkSchema = new Schema<NavLinkDoc>(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const NavLinkModel: Model<NavLinkDoc> =
  (models.NavLink as Model<NavLinkDoc> | undefined) ?? model('NavLink', navLinkSchema);