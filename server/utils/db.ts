import mongoose, { mongo } from "mongoose"
require('dotenv').config();

const dbUrl:string = process.env.DB_URL || '';
const connectDB =async () => {
    try {
        console.log("i am called here " , dbUrl)
        await mongoose.connect(dbUrl,{connectTimeoutMS: 4000,}).then((data:any)=>{
            console.log(`Database connected with ${data.connection.host}`)
        })
    } catch (error:any){
        console.log('THE ERROR IS THIS ' , error)
        console.log(error.message); 
        setTimeout(connectDB,5000);
    }
}

export default connectDB;   