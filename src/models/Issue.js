import mongoose from "mongoose";

const normalizeLabels=(labels)=>{
    if(!Array.isArray(labels)) return [];

    return [...new Set(labels.map((label)=>String(label).trim().toLowerCase()).filter(Boolean))];
}

const statusHistorySchema=new mongoose.Schema({
    from:{
       type:String,
       enum:["open","in-progress","resolved","closed",null],
       default:null
    },

    to:{
        type:String,
        enum:["open","in-progress","resolved","closed"],
        required:true
    },

    changedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    changedAt:{
        type:Date,
        default:Date.now
    }
},{
    _id:false
})


const issueSchema=new mongoose.Schema(
{
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:[true,"Project is required"],
        index:true
    },

    title:{
        type:String,
        required:[true,"Issue title is required"],
        trim:true,
        maxlength:[150,"Title cannot exceed 150 characters"]
    },

    description:{
        type:String,
        trim:true,
        maxlength:[3000,"Description cannot exceed 3000 characters"]
    },

    status:{
        type:String,
        enum:["open","in-progress","resolved","closed"],
        default:"open"
    },

    priority:{
        type:String,
        enum:["low","medium","high","urgent"],
        default:"medium"
    },

    labels:{
        type:[String],
        default:[],
        set:normalizeLabels
    },
    
    assignee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    dueDate:{
        type:Date,
        default:null
    },

    statusHistory:{
        type:[statusHistorySchema],
        default:[]
    }
},{
    timestamps:true
})

const Issue=mongoose.model("Issue",issueSchema);

export default Issue;