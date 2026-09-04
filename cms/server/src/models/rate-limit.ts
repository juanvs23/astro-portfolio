import { Schema, model, models, type Model } from 'mongoose';

export interface RateLimitDoc {
  /** Composite key: `${email}|${ip}` for login throttling. */
  key: string;
  count: number;
  /** When the window resets. TTL index drops the doc shortly after. */
  resetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const rateLimitSchema = new Schema<RateLimitDoc>(
  {
    key: { type: String, required: true },
    count: { type: Number, default: 0 },
    resetAt: { type: Date, required: true },
  },
  { timestamps: true },
);

rateLimitSchema.index({ key: 1, resetAt: 1 }, { unique: true });
// TTL: window expiry cleans up the counter automatically.
rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitModel: Model<RateLimitDoc> =
  (models.RateLimit as Model<RateLimitDoc> | undefined) ?? model('RateLimit', rateLimitSchema);