import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
    userId: string;
    title: string;
    message: string;
    status: string;
    type: 'email' | 'sms' | 'push';
    priority: 'low' | 'medium' | 'high';
}

const notificationSchema = new Schema<INotification>({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "unread"
    },
    userId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['email', 'sms', 'push'],
        default: 'push',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'high',
    },
},{timestamps:true});

const NotificationModel = mongoose.model<INotification>("Notification", notificationSchema);
export default NotificationModel;
