import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "chai aur code"
    // })

    const { fullName ,email,username, password } = req.body
    console.log("email: ", email);

    if(
        [fullName, email , username , password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400, "all fields are required")
    }
    
    const existedUser = User.findOne({
        $or:[{email},{username}]
    })
    if(existedUser){
        throw new ApiError(409, "user with this passowrd or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.avatar[0]?.path;
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


export {
    registerUser,
}