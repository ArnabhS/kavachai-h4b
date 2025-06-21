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

export interface Scan {
  id: string
  type: 'web-scraping' | 'smart-contracts' | 'audit-log'
  status: 'active' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  userId?: string
  metadata?: {
    url?: string
    contractAddress?: string
    logSource?: string
  }
  results?: Record<string, unknown>
  error?: string
}

const scanSchema = new Schema<Scan>({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['web-scraping', 'smart-contracts', 'audit-log'] },
  status: { type: String, required: true, enum: ['active', 'completed', 'failed'] },
  startedAt: { type: Date, required: true, default: Date.now },
  completedAt: { type: Date },
  userId: { type: String },
  metadata: {
    url: String,
    contractAddress: String,
    logSource: String
  },
  results: Schema.Types.Mixed,
  error: String
})

export const Scan = mongoose.models.Scan || mongoose.model<Scan>('Scan', scanSchema) 