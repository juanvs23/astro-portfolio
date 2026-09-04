import { Schema, model, models, type Model } from 'mongoose';

export type UserRole = 'admin' | 'user';

export interface UserDoc {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user', required: true },
  },
  { timestamps: true },
);

export const UserModel: Model<UserDoc> =
  (models.User as Model<UserDoc> | undefined) ?? model('User', userSchema);