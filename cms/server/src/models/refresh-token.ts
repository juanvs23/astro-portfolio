import { Schema, model, models, type Model, type Types } from 'mongoose';

export interface RefreshTokenDoc {
  tokenHash: string;
  familyId: string;
  userId: Types.ObjectId;
  /** Set true when a token is rotated (used to issue its replacement). */
  used: boolean;
  /** Set true on logout or when a reused token is detected (revokes family). */
  revoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDoc>(
  {
    tokenHash: { type: String, required: true, unique: true },
    familyId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    used: { type: Boolean, default: false },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// TTL: Mongo drops tokens automatically when expiresAt passes.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel: Model<RefreshTokenDoc> =
  (models.RefreshToken as Model<RefreshTokenDoc> | undefined) ?? model('RefreshToken', refreshTokenSchema);