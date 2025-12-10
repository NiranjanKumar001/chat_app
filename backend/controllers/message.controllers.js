import { Conversation } from "../modules/conversation.modules.js";
import { Message } from "../modules/message.modules.js";

//logic..

//this part of code is for sending message from sender----->reciver..

const send_message =async(req ,res)=>{
    const senderId=req.user._id
    const reciverId=req.params.id
    const {message}=req.body

    let isConveserationPresent=await Conversation.findOne({
        participants:{$all :[senderId,reciverId]}
    })

    if(!isConveserationPresent){
        isConveserationPresent=await Conversation.create({
            participants:[senderId,reciverId]
        })
    };

    const newMessage=await Message.create({
        senderId,
        reciverId,
        message

    })
    if (newMessage){
        isConveserationPresent.messages.push(newMessage._id)
        await isConveserationPresent.save()
    }
    res.status(201).json({
        sucess:true,
        message:"Message succesfully delivered...",
        data:newMessage
    })
}

// this code is for reading all the sender message....

const recive_message=async (req,res)=>{
    const senderId=req.user._id
    const reciverId=req.params.id
    const ispresent=await Conversation.findOne({
        participants:{$all:[senderId,reciverId]}
    }).populate("messages").populate("participants","fullname")
    if (ispresent){
        res.status(201).json({
            sucess:true,
            data:ispresent
        })
    } else {
        res.status(200).json({
            sucess:true,
            data: { messages: [] }
        })
    }
}

export{
    send_message,
    recive_message
}