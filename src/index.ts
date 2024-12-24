import express from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";  
import { contentModel,UserModel,LinkModel } from "./db";
import cors from "cors";    
import { userMiddleware } from "./middleware";
import {random} from "./utils";  

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/sinup",async (req,res) =>{
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await UserModel.create({username,password});
        res.json({
            message:"User sinup successfully",
        });  
    }catch(err){
        res.status(411).json({
            message:"User already exists",
        });
    }
});  

app.post("/api/sining", async(req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await UserModel.findOne({username,password});
        if(user){
            const token = jwt.sign({
                id:user._id,
            },JWT_PASSWORD);  

            res.json({
                message:"User singin successfully",
                token:token  
            });
        }else{
            res.status(403).json({
                message:"Invalid username or password",
            });  
        }
    }catch(err){
        res.status(411).json({
            message:"User not found",
        });
    }
});  


app.post("/api/content",userMiddleware, async(req,res) => {
    const link = req.body.link;
    const type = req.body.type;
    const title = req.body.title;
    const UserId = req.userId;  

    await contentModel.create({
        link,
        type,
        title,
        UserId,
        tags: []  
    })

    res.json({
        message:"Content created successfully"
    });  
});

app.get("/api/content", userMiddleware, async(req,res) => {
    const UserId = req.userId;
    const content = await contentModel.find({
        UserId: UserId
    }).populate("userId","username");
    res.json({
        content  
    });  
});  


app.delete("/api/delete",userMiddleware, async(req,res) => {
    const contentId = req.body.contentId;

    await contentModel.deleteMany({
        contentId,  
        userId: req.userId
    });  

    res.json({
        message: "Content deleted successfully"  
    });
});  


app.post("/api/share", userMiddleware, async(req,res) => {
    const share = req.body.share;

    if(share){
        const existingLink = await LinkModel.findOne({
            userId: req.userId
        });

        if(existingLink){
            res.json({
                hash: existingLink.hash  
            })
            return;  
        }

        const hash = random(10);
        await LinkModel.create({
            userId: req.userId,
            hash: hash  
        });  

        res.json({
            hash: hash  
        })
    }else {
        await LinkModel.deleteOne({
            userId: req.userId
        });  

        res.json({
            message: "Link deleted successfully"  
        })
    }
});  


app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    });

    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }
    // userId
    const content = await contentModel.find({
        userId: link.userId
    })

    console.log(link);
    const user = await UserModel.findOne({
        _id: link.userId
    })
   
    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        username: user.username,
        content: content
    })

});  
  


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});   
    