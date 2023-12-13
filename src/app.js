import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))

app.use(express.json({limit:"16kb"})) //to limitize json data recieved from frontend
app.use(urlencoded({extended:true, limit:true})) //to handle url data and allow nesting of that
app.use(express.static("public"));  //to handle static files on server side like we keep here in public dir
app.use(cookieParser()) //to handle cookies 

export {app}