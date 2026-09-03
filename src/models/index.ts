import mongoose, { Schema, model, models, Types } from "mongoose";

/* ---------- User ---------- */
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: "customer" | "provider" | "admin";
  emailConfirmed: boolean;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ["customer", "provider", "admin"], required: true },
  emailConfirmed: { type: Boolean, default: false },
});

/* ---------- State ---------- */
export interface IState {
  _id: Types.ObjectId;
  code: string;
  name: string;
  minHourlyWage: number;
}

const StateSchema = new Schema<IState>({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  minHourlyWage: { type: Number, required: true },
});

/* ---------- Neighborhood ---------- */
export interface INeighborhood {
  _id: Types.ObjectId;
  name: string;
  city: string;
  stateCode: string;
  zip: string;
  fee: number;
}

const NeighborhoodSchema = new Schema<INeighborhood>({
  name: { type: String, required: true },
  city: { type: String, required: true },
  stateCode: { type: String, required: true, uppercase: true },
  zip: { type: String, required: true },
  fee: { type: Number, default: 0 },
});

/* ---------- Customer ---------- */
export interface ICustomer {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  neighborhood: Types.ObjectId;
  streetAddress: string;
  city: string;
  zip: string;
  status: "pending" | "active";
}

const CustomerSchema = new Schema<ICustomer>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  neighborhood: { type: Schema.Types.ObjectId, ref: "Neighborhood", required: true, index: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  status: { type: String, enum: ["pending", "active"], default: "pending" },
});

/* ---------- Provider ---------- */
export { SERVICE_TYPES, type ServiceType } from "@/lib/constants";

export interface IRate {
  serviceType: string;
  rate: number;
}

export interface IProvider {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  neighborhood: Types.ObjectId;
  streetAddress: string;
  city: string;
  zip: string;
  birthday: string; // YYYY-MM-DD
  bio: string;
  phone: string;
  startDate: string; // YYYY-MM-DD
  status: "pending" | "active";
  rates: IRate[];
}

const ProviderSchema = new Schema<IProvider>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  neighborhood: { type: Schema.Types.ObjectId, ref: "Neighborhood", required: true, index: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  birthday: { type: String, required: true },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  startDate: { type: String, required: true },
  status: { type: String, enum: ["pending", "active"], default: "pending" },
  rates: [{ serviceType: String, rate: Number }],
});

/* ---------- Availability (provider schedule) ---------- */
export interface IAvailability {
  _id: Types.ObjectId;
  provider: Types.ObjectId;
  kind: "recurring" | "oneTime" | "exclusion";
  weekday?: number; // 0 (Sun) – 6 (Sat), recurring only
  repeats?: "weekly" | "biweekly";
  startDate?: string; // recurring range, YYYY-MM-DD
  endDate?: string;
  date?: string; // oneTime / exclusion, YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string;
}

const AvailabilitySchema = new Schema<IAvailability>({
  provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
  kind: { type: String, enum: ["recurring", "oneTime", "exclusion"], required: true },
  weekday: Number,
  repeats: { type: String, enum: ["weekly", "biweekly"] },
  startDate: String,
  endDate: String,
  date: String,
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

/* ---------- Booking (service request) ---------- */
export interface IBooking {
  _id: Types.ObjectId;
  customer: Types.ObjectId;
  provider: Types.ObjectId;
  neighborhood: Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  status: "pending" | "accepted" | "denied" | "cancelled";
  serviceCategory: string; // e.g. "1 Kid"
}

const BookingSchema = new Schema<IBooking>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
    neighborhood: { type: Schema.Types.ObjectId, ref: "Neighborhood", required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "denied", "cancelled"], default: "pending" },
    serviceCategory: { type: String, default: "1 Kid" },
  },
  { timestamps: true },
);

/* ---------- Info request (neighborhood request) ---------- */
export interface IInfoRequest {
  _id: Types.ObjectId;
  email: string;
  neighborhoodName: string;
  city: string;
  zip: string;
  stateCode: string;
  comments: string;
  status: "pending" | "processed";
}

const InfoRequestSchema = new Schema<IInfoRequest>(
  {
    email: { type: String, required: true },
    neighborhoodName: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    stateCode: { type: String, required: true, uppercase: true },
    comments: { type: String, default: "" },
    status: { type: String, enum: ["pending", "processed"], default: "pending" },
  },
  { timestamps: true },
);

/* ---------- Contact message ---------- */
export interface IContactMessage {
  _id: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: String,
    email: String,
    subject: String,
    message: String,
  },
  { timestamps: true },
);

const m = models as Record<string, mongoose.Model<unknown>>;
export const User = (m.User as mongoose.Model<IUser>) ?? model<IUser>("User", UserSchema);
export const State = (m.State as mongoose.Model<IState>) ?? model<IState>("State", StateSchema);
export const Neighborhood =
  (m.Neighborhood as mongoose.Model<INeighborhood>) ?? model<INeighborhood>("Neighborhood", NeighborhoodSchema);
export const Customer =
  (m.Customer as mongoose.Model<ICustomer>) ?? model<ICustomer>("Customer", CustomerSchema);
export const Provider =
  (m.Provider as mongoose.Model<IProvider>) ?? model<IProvider>("Provider", ProviderSchema);
export const Availability =
  (m.Availability as mongoose.Model<IAvailability>) ?? model<IAvailability>("Availability", AvailabilitySchema);
export const Booking = (m.Booking as mongoose.Model<IBooking>) ?? model<IBooking>("Booking", BookingSchema);
export const InfoRequest =
  (m.InfoRequest as mongoose.Model<IInfoRequest>) ?? model<IInfoRequest>("InfoRequest", InfoRequestSchema);
export const ContactMessage =
  (m.ContactMessage as mongoose.Model<IContactMessage>) ??
  model<IContactMessage>("ContactMessage", ContactMessageSchema);
