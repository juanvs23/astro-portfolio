import { Schema, model, models } from 'mongoose';

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

export const NavLinkModel =
  (models.NavLink as ReturnType<typeof model<NavLinkDoc>>) ??
  model<NavLinkDoc>('NavLink', navLinkSchema);