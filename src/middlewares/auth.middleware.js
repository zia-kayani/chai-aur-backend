import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req, _ , next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401, "unauthorized request ")
        }

        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

        if(!user){
            throw new ApiError(401, "invalid access token" )
        }
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        req.user = user;
        next()
    }catch(error){
        throw new ApiError(401, error?.message || "invalid access token")
    }
} )