import mongoose, { Document, Model, Schema } from "mongoose";
import { DocCommentTemplateOptions } from "typescript";
import { IUser } from "./user.model";


interface IComment extends Document {
    user: IUser,
    question: string,
    questionReplies: IComment[]
}

interface ICourseRating extends Document {
    currentRating: number,
    totalRating: number,
    totalCount: number
}
interface IReview extends Document {
    user: IUser,
    rating: number,
    comment: string,
    commentReplies: IComment[];
}
interface ILink extends Document {
    title: string;
    url: string;
}

interface ICourseData extends Document {
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail: object;
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: ILink[];
    suggestion: string;
    questions: IComment[];
}

interface ICourse extends Document {
    name: string;
    description?: string;
    price: Number;
    estimatedPrice: number;
    thumbnail: object;
    tags?: string;
    level: string;
    demoUrl: string;
    benefits: { title: string }[];
    prerequisties: { title: string }[];
    reviews: IReview[];
    courseData: ICourseData[];
    ratings?: number;
    purchased?: number;
    totalRating?: number; // New field for total rating
    reviewCount?: number; // New field for review count
    courseRating?: ICourseRating;
}

const reviewsSchema = new Schema<IReview>({
    user: Object,
    rating: {
        type: Number,
        default: 0
    },
    comment: String
})
const linkSchema = new Schema<ILink>({
    title: String,
    url: String
})

const commentSchema = new Schema<IComment>({
    user: Object,
    question: String,
    questionReplies: [Object],
})

const courseDataSchema = new Schema<ICourseData>({
    videoUrl: String,
    title: String,
    videoSection: String,
    description: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema]
})


const courseSchema = new Schema<ICourse>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: false
    },
    estimatedPrice: {
        type: Number,
        required: false,
    },
    tags: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true
    },
    demoUrl: {
        type: String,
        required: true
    },
    benefits: [{ title: String }],
    prerequisties: [{ title: String }],
    reviews: [reviewsSchema],
    courseData: [courseDataSchema],
    courseRating: {
        type: {
            currentRating: { type: Number, default: 0 },
            totalRating: { type: Number, default: 0 },
            totalCount: { type: Number, default: 0 }
        },
        default: { currentRating: 0, totalRating: 0, totalCount: 0 }
    },
    purchased:{
        type: Number,
        required: true,
        default: 0
    }
})


const CourseModel: Model<ICourse> = mongoose.model("Course",courseSchema);
export default CourseModel;



