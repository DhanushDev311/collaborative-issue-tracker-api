import mongoose from "mongoose";

const commentSchema=new mongoose.Schema({
    issue:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Issue",
        required:[true,"Issue is required"]
    },

    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    content:{
        type:String,
        required:[true,"Comment content is required"],
        trim:true,
        maxlength:[1000,"Comment cannot exceed 1000 characters"]
    }
},{
    timestamps:true
})

const Comment=mongoose.model("Comment",commentSchema);

export default Comment;