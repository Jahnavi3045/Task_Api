const jwt=require('jsonwebtoken')
const usermodel=require('../models/user')

const auth=async(req,res,next)=>{
    try{
        let token=req.header('authorization').replace('Bearer ','')
        let decoded=jwt.verify(token,process.env.jwt_secret)

        let auth_user=await usermodel.findOne({_id:decoded._id,'tokens.token':token})
        if(!auth_user){
            throw new Error()
        }

        req.token=token
        req.auth_user=auth_user
        next()
    }
    catch(e){
        res.status(401).send({error:"please authenticate"})
    }
}

module.exports=auth