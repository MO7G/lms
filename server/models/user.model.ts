/*
 * File: user.model.ts
 * Description: This is the user model defining the structure of user documents in the database.
 * Author: hajji
 * Date: 2023-10-20
 * Company: Mo7aMind
 * License: Mo7aMind
 */



import mongoose,{Document,Model,Schema, mongo} from "mongoose";
import bcrypt from "bcryptjs"


// regex pattern for email validation !!!
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Document is a Mongoose Interface to define the structure of the code !!!!
export interface IUser extends Document{
    name:string;
    email:string;
    password:string;
    avatar:{
        pubic_id:string;
        url:string;
    },
    role:string;
    isVerified: boolean;
    courses: Array<{courseId:string}>;
    comparePassword:(password:string)=> Promise<boolean>;
}

// Todo In the future I want to add a Role-based Access Control (RBAC)
// Todo In the future I want to add a bank card for the user who is gong to purchase a course !!
const userSchema: Schema<IUser> = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"]
    },
    email:{
        type:String,
        required: [true,"Please enter your email"],
        validate:{
            validator: function (value:string){
                return emailRegexPattern.test(value);
            },
            message: "Please enter a valid email"
        },
        unique:true,
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minlength:[6,"Password must be at least 6 characters"],
        select:false,  // will be excluded from the query result (passwords are sensitiv)
    },
    avatar:{
        pubilc_id:String,
        url:String
    },
    role:{
        type:String,
        default:"user",
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    courses:[
        {
            courseId:String
        }
    ]
},{timestamps:true});

// Hash Password Before Saving it the database 
// the 'save' means before executing the operation save on a user document!!
userSchema.pre<IUser>('save',async function(next){


    // We check if the password field was modified or not 
    if(!this.isModified('password')){
        next();
    }
    // We created a password or we modified a password so we are hashing the new Password!!
    this.password = await bcrypt.hash(this.password, 10);
    next();
})



// Compare Entered Password With The Hashed Password In The Databaes !!
userSchema.methods.comparePassword =async function(enteredPassword: string): Promise<boolean>{
    return await bcrypt.compare(enteredPassword, this.password);
};


const userModel: Model<IUser> = mongoose.model("User",userSchema);
export default userModel;