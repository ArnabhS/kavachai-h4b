import mongoose, { Schema, Document, Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { connectDB } from './mongodb';

export interface ApiKeyDoc extends Document {
  userId: string;
  apiKey: string;
  createdAt: Date;
}

const ApiKeySchema = new Schema<ApiKeyDoc>({
  userId: { type: String, required: true, unique: true },
  apiKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ApiKeyModel: Model<ApiKeyDoc> = mongoose.models.ApiKey || mongoose.model<ApiKeyDoc>('ApiKey', ApiKeySchema);

export async function getApiKey(userId: string): Promise<ApiKeyDoc | null> {
  await connectDB();
  return ApiKeyModel.findOne({ userId });
}

export async function createApiKey(userId: string): Promise<ApiKeyDoc> {
  await connectDB();
  const apiKey = randomBytes(24).toString('hex');
  const doc = new ApiKeyModel({ userId, apiKey, createdAt: new Date() });
  await doc.save();
  return doc;
}

export async function regenerateApiKey(userId: string): Promise<ApiKeyDoc> {
  await connectDB();
  const apiKey = randomBytes(24).toString('hex');
  const doc = await ApiKeyModel.findOneAndUpdate(
    { userId },
    { apiKey, createdAt: new Date() },
    { new: true, upsert: true }
  );
  return doc!;
} 