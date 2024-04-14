import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
    courseId: string;
    userId: string;
    paymentInfo: object;
    transactionId?: string;
    additionalNotes?: string;
}

const orderSchema = new Schema<IOrder>({
    courseId: {
        type: String,
       // ref: 'Course', // Assuming you have a Course model
        required: true
    },
    userId: {
        type: String,
      //  ref: 'User', // Assuming you have a User model
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    paymentInfo: {
        type: Object, // Adjust as needed based on your payment information structure
        required: false
    },
    additionalNotes: {
        type: String,
        required: false
    }
},{timestamps:true});

const OrderModel = mongoose.model<IOrder>("Order", orderSchema);
export default OrderModel;
