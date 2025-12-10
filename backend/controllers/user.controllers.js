import {User} from '../modules/user.modules.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const register=async (req,res)=>{
    try{
        const {fullname,username,password,profilephoto,gender}=req.body
        if(!fullname || !username  || !password || !gender || fullname.trim()==='' || username.trim()==='' || password.trim()===''|| gender.trim()===''){
            return res.status(400).json({sucess:false ,message:" all fileds are mandatory"})
        }
        const exsistuser=await User.findOne({username})
        if(exsistuser){
            return res.status(400).json({
                sucess:false,
                message:"User already exsist..go to login site"
            })
        
        }
        //hashing password....
        const hashedpassword=await bcrypt.hash(password,10)
        //logic for profile photo......
        const maleprofilephoto=`https://avatar.iran.liara.run/public/boy?username=${username}`;
        const femaleprofilephoto=`https://avatar.iran.liara.run/public/girl?username=${username}`;
        //creating user in db...
        const newuser=await User.create({
            fullname,
            username,
            password:hashedpassword,
            profilephoto:gender==='male'?maleprofilephoto:femaleprofilephoto,
            gender
        })
        return res.status(201).json({sucess:true,message :"User created sucessfully...",user:newuser})
    }catch(err){
        console.error("Registration error..",err)
        res.status(500).json({sucess:false ,message:"internal server error..."})
    }
}
const login=async(req,res)=>{
    try{
        const {username ,password}=req.body
        if(!username || !password || username.trim()==='' || password.trim()===''){
            return res.status(400).json({sucess:false,message:"all fields are mandatory..."})
        }
        const exsistuser=await User.findOne({username})
        if(!exsistuser){
            return res.status(404).json({sucess:false ,message:"User not exsist register the user..."})

        }
        const passwordmatch=await bcrypt.compare(password,exsistuser.password)
        if(!passwordmatch){
            return res.status(401).json({sucess:false ,message: "invalid password..."})
        }
        const tokendata={
            userid:exsistuser._id
        }
        const token= jwt.sign(tokendata,process.env.JWT_SECRET_KEY,{expiresIn:'1d'})
        return res.status(200).cookie("token",token,{ maxAge:1*24*60*60*1000 , httpOnly :true ,sameSite :"strict"}).json({
            sucess: true,
            message: `User : ${exsistuser.username} logedin sucessfully...`,
            user: {
                _id:exsistuser._id,
                name:exsistuser.fullname,
                username:exsistuser.username,
                profilephoto:exsistuser.profilephoto
            }
        })
    }catch(err){
        console.error("Login error..",err)
        res.status(500).json({sucess:false ,message:"internal server error..."})
    }
}
const logout=async(req,res)=>{
    try{
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }
        const user=req.user.fullname
        return res.status(200).cookie("token","",{maxAge:0}).json({
            message: `${user} logged out successfully...`
        })
    }catch(err){
        console.error("Logout error..",err)
        res.status(500).json({sucess:false ,message:"internal server error..."})

    }
}
const demo=(req,res)=>{
    res.send("this is for testing middleware....")
}

const getalluserexceptAuth=async(req,res)=>{
    try{
        const currentuser=req.user._id
        const alluser=await User.find({_id:{$ne:currentuser}}).select("-password")
        res.status(200).json({
            success:true,
            alluser
        })
    }catch(err){
        console.error("error in fetching user :",err)
        res.status(500).json({
            sucess:false,
            message:"Internal server error"
        })
    }
}

export{
    register,
    login,
    logout,
    demo,
    getalluserexceptAuth
 }
