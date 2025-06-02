// models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export enum USER_CONNECTION_STATUS {
  OFFLINE = "offline",
  ONLINE = "online",
}

// Extend Document to get Mongoose typings with TS
export interface IUser extends Document {
  username: string;
  roomId: string;
  status: USER_CONNECTION_STATUS;
  cursorPosition: number;
  typing: boolean;
  currentFile: string | null;
  socketId: string;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true },
    roomId: { type: String, required: true },
    status: {
      type: String,
      enum: [USER_CONNECTION_STATUS.ONLINE, USER_CONNECTION_STATUS.OFFLINE],
      default: USER_CONNECTION_STATUS.ONLINE,
    },
    cursorPosition: { type: Number, default: 0 },
    typing: { type: Boolean, default: false },
    currentFile: { type: String, default: null },
    socketId: { type: String, required: true },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
