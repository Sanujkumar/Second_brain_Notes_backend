
import mongoose, { model, Schema } from "mongoose";  
import { title } from "process";

mongoose.connect("mongodb://127.0.0.1:27017/brinly");  

const UserSchema = new mongoose.Schema({
   username: {
    type: String,
    unique: true
   },
   password: String    
})

export const UserModel = mongoose.model("User",UserSchema);  

const contentSchema = new mongoose.Schema({
    type: String, 
    link: String,   
    title: String,      
    tags: [{   
        type: mongoose.Types.ObjectId,
        ref: "Tag",
    }],  
});

export const contentModel = mongoose.model("Content",contentSchema);  

const LinkSchema = new Schema({
    hash: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    }
});  


export const LinkModel = mongoose.model("Links",LinkSchema);  