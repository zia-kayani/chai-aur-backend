import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Jwt  from "jsonwebtoken";
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true, //to make more searchable in database
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            index: true, 
            trim: true,
        },
        avatar:{
            type:String, //cloudnary url
            required: true,
        },
        coverImage:{
            type:String, //cloudnary url
        },
        watchHistory:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true, "password is required"]
        },
        refreshToken:{
            type:String
        }
    },
    {
        timestamps:true
    }
)

userSchema.pre("save" ,async function(next){
    if(! this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password , 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    Jwt.sign(
        { //payload
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,  //secret token
        { // expiry token
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    Jwt.sign(
        { //payload
            _id:this._id,         
        },
        process.env.REFRESH_TOKEN_SECRET,  //secret token
        { // expiry token
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)