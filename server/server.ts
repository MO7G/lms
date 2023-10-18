import { app } from "./app";
require("dotenv").config();


// create the server !!
app.listen(process.env.PORT, ()=>{
console.log("server is lestining on " , process.env.PORT);
})