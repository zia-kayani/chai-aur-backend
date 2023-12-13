import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema(
    {
        videoFile:{
            type:String,  //cloudnary url
            required:true,
        },
        thumbnail:{
            type:String,
            required:true,
        },
        title:{
            type:String,  //cloudnary url
            required:true,
        },
        description:{
            type:String,  //cloudnary url
            required:true,
        },
        duration:{
            type:String,  //cloudnary url
            required:true,
        },
        view:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {
        timestamps:true
    }
)
videoSchema.plugin(mongooseAggregatePaginate) //for mongodb aggregation pipeline


export const Video = mongoose.model("Video", videoSchema)