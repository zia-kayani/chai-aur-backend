import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

//########## tokens
const generateAccessAndRefereshTokens = async (userId)=>{
    try{ 
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken, refreshToken}
    }catch(error){
        throw new ApiError(500, "something went wrong while generating access and refresh tokens")
        
    }
}

//###########
const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "chai aur code"
    // })

    const { fullName ,email,username, password } = req.body
    // console.log("email: ", email); 

    if(
        [fullName, email , username , password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400, "all fields are required")
    }
     
    const existedUser =await User.findOne({
        $or:[{email},{username}]
    })
    if(existedUser){
        throw new ApiError(409, "user with this passowrd or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.Length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400, "avatar file is required")

    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        fullName
    })

    const createdUser = await User.findOne(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
} )

//####################
const loginUser = asyncHandler( async(req, res)=>{
    //req.body => data
    // username or email
    //find the user
    // password check
    //access and refresh token
    // cookies send

    const {username ,  email , password} = req.body
    console.log(email)

    if(!username && !email)
    {
        throw new ApiError(400, "username or email is required")
    }
    //here is alternative of above code based on logic
    // if(!(username || email)){
    //    throw new ApiError(400, "username or email is required")
    //}

    const user = await User.findOne({
        $or : [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "user does not exists")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new ApiError(401, "password is incorrect")
   }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options ={
    httpOnly:true,
    secure: false,
   }
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser , accessToken , refreshToken
            },
            "User logged in successfully"
        )
   )
})

const logoutUser = asyncHandler( async(req, res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
           $set: {
            refreshToken: undefined,
           }
        },
        {
            new:true
        }
    )

    const options ={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401 , "umauthorized access")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
        
        const user =await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401 , "invlaid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , "refresh token is expired or used")
        }
    
        const options ={
            httpOnly: true,
            secure:false
        }
    
        const {accessToken , newRefreshToken}=await generateAccessAndRefereshTokens(user._id)
    
        res.status(200)
        .cookie("accessToken", accessToken  ,options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    accessToken , refreshToken:newRefreshToken,
                },
                "access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
});
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}