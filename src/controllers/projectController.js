import Comment from "../models/Comment.js";
import Issue from "../models/Issue.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

const getMemberRecord=(project,userId)=>{
    return project.members.find((member)=>member.user.toString()===userId.toString())
}

const isProjectAdmin=(project,userId)=>{
    const member=getMemberRecord(project,userId);
    return member && (member.role==="owner" || member.role==="admin");
}

const populateProject=async(projectId)=>{
    return Project.findById(projectId)
    .populate("owner","name email")
    .populate("members.user","name email")
}

export const createProject=async (req,res,next) => {
    try {
    const {name,description}=req.body;

    const project=await Project.create({
        name,
        description,
        owner:req.user._id,
        members:[
            {
                user:req.user._id,
                role:"owner"
            }
        ]
    })

    const populatedProject=await populateProject(project._id);

    res.status(201).json({
        success:true,
        message:"Project created successfully",
        data:populatedProject
    })
    } catch (error) {
        next(error);
    }
}

export const getAllProjects=async (req,res,next) => {
    try {
        const projects=await Project.find({"members.user":req.user._id})
        .populate("owner","name email")
        .populate("members.user","name email")
        .sort({createdAt:-1})

        res.status(200).json({
            success:true,
            count:projects.length,
            data:projects
        })
    } catch (error) {
        next(error);
    }
}

export const getProjectById=async (req,res,next) => {
    try {
        const project=await Project.findOne({
            _id:req.params.id,
            "members.user":req.user._id
        })
        .populate("owner","name email")
        .populate("members.user","name email")

        if(!project){
           return res.status(404).json({
            success:false,
            message:"Project not found or access denied"
           })
        }

        res.status(200).json({
            success:true,
            data:project
        })
    } catch (error) {
        next(error);
    }
}


export const updateProject=async (req,res,next) => {
    try {
        const project=await Project.findById(req.params.id);

        if(!project){
           return res.status(404).json({
            success:false,
            message:"Project not found"
           })
        }

        if(!isProjectAdmin(project,req.user._id)){
            return res.status(403).json({
                success:false,
                message:"Only project owner or admin can update the project"
            })
        }

        const updateData={};

        if(req.body.name!==undefined){
            updateData.name=req.body.name;
        }
        if(req.body.description!==undefined){
            updateData.description=req.body.description;
        }

        if(Object.keys(updateData).length===0){
            return res.status(400).json({
                success:false,
                message:"No valid fields provided for update"
            })
        }

        const updatedProject=await Project.findByIdAndUpdate(req.params.id,updateData,{
            new:true,
            runValidators:true
        })
        .populate("owner","name email")
        .populate("members.user","name email")

        res.status(200).json({
            success:true,
            message:"Project updated successfully",
            data:updatedProject
        })
    } catch (error) {
        next(error);
    }
}

export const deleteProject=async (req,res,next) => {
    try {
        const project=await Project.findById(req.params.id);

        if(!project){
           return res.status(404).json({
            success:false,
            message:"Project not found"
           })
        }

        if(project.owner.toString()!==req.user._id.toString()){
            return res.status(403).json({
                success:false,
                message:"Only the project owner can delete the project"
            })
        }

        const issues=await Issue.find({project:project._id}).select("_id");
        const issueIds=issues.map((iss)=>iss._id);
        if(issueIds.length>0){
            await Comment.deleteMany({issue:{$in:issueIds}});
        }

        await Issue.deleteMany({project:project._id});
        await Project.findByIdAndDelete(project._id);

        res.status(200).json({
            success:true,
            message:"Project and related issues/comments deleted successfully"
        });
    } catch (error) {
        next(error);    
    }
}

export const addProjectMember=async (req,res,next) => {
    try {
        const {email, role="member"}=req.body;

        if(!["admin","member"].includes(role)){
            return res.status(400).json({
                success:false,
                message:"Role must be either admin or member"
            })
        }

        const project=await Project.findById(req.params.id);

        if(!project){
            return res.status(404).json({
                success:false,
                message:"Project not found"
            })
        }

        if(!isProjectAdmin(project,req.user._id)){
            return res.status(403).json({
                success:false,
                message:"Only project owner or admin can add members"
            })
        }

        const user=await User.findOne({email:String(email).toLowerCase()});

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const alreadyMember=project.members.some((member)=>member.user.toString()===user._id.toString());

        if(alreadyMember){
            return res.status(400).json({
                success:false,
                message:"User is already a member of this project"
            })
        }

        project.members.push({
            user:user._id,
            role
        })

        await project.save();
        const populatedProject=await populateProject(project._id);

        res.status(200).json({
            success:true,
            message:"Member added successfully",
            data:populatedProject
        })
    } catch (error) {
        next(error);
    }
}


export const updateProjectMemberRole=async (req,res,next) => {
    try {
        const {role}=req.body;

        if(!["admin","member"].includes(role)){
            return res.status(400).json({
                success:false,
                message:"Role must be either admin or member"
            })
        }

        const project=await Project.findById(req.params.id);

        if(!project){
            return res.status(404).json({
                success:false,
                message:"Project not found"
            })
        }

        if(!isProjectAdmin(project,req.user._id)){
            return res.status(403).json({
                success:false,
                message:"Only project owner or admin can add members"
            })
        }

        const member=getMemberRecord(project,req.params.memberId);

        if(!member){
            return res.status(404).json({
                success:false,
                message:"Member not found in this project"
            })
        }

        if(member.role==="owner"){
            return res.status(400).json({
                success:false,
                message:"Owner role cannot be changed"
            })
        }

        member.role=role;
        await project.save();
        const populatedProject=await populateProject(project._id);
        res.status(200).json({
            success:true,
            message:"Member role updated successfully",
            data:populatedProject
        })
    } catch (error) {
        next(error);
    }
}

export const removeProjectMember=async (req,res,next) => {
    try {
        const project=await Project.findById(req.params.id);

        if(!project){
            return res.status(404).json({
                success:false,
                message:"Project not found"
            })
        }

        if(!isProjectAdmin(project,req.user._id)){
            return res.status(403).json({
                success:false,
                message:"Only project owner or admin can remove members"
            })
        }

        const member=getMemberRecord(project,req.params.memberId);

        if(!member){
            return res.status(404).json({
                success:false,
                message:"Member not found in this project"
            })
        }

        if(member.role==="owner"){
            return res.status(400).json({
                success:false,
                message:"Owner cannot be removed from the project"
            })
        }

        project.members=project.members.filter((item)=>item.user.toString()!==req.params.memberId)
        await project.save();

        const populatedProject=await populateProject(project._id);
        res.status(200).json({
            success:true,
            message:"Member removed successfully",
            data:populatedProject
        })
    } catch (error) {
        next(error);
    }
}