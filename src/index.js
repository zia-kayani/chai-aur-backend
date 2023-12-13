import dotenv from "dotenv"
import express from "express";
import connectDB from './db/index.js'

const app = express();

dotenv.config({path:'./.env'})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log("app is listening on port "+process.env.PORT);
    });
})
.catch((error)=>{
    console.log('mongodb connection failed'+error)
})



/*
import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "./constants.js";
const app = express();
(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.log("mongoDB connection error" , error);
            throw error;
        })

        app.listen(process.env.PORT || 3000 , ()=>{
            console.log(`app is listening on port ${process.env.PORT}` )
        })
    }catch(err){
        console.log("mongoDB connection failed ", err);
        throw err;
    }
})()

*/