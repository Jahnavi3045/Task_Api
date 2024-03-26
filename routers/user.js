const express=require('express')
const router=new express.Router()
const auth=require('../middleware/auth')
const multer=require('multer')
const sharp=require('sharp')
// const userModel=require('../models/user')
const User=require('../models/user')

router.post('/signup',async(req,res)=>{
    const user=new User(req.body)

    try{
        let user_token=await user.generateAuthToken()
        await user.save()
        res.status(201).send({user,user_token})
    }
    catch(e){
        res.status(400).send(e)
    }
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
}) 

router.post('/users/login',async(req,res)=>{
    try{
        let user=await User.findByCredentials(req.body.email,req.body.password)
        let token=await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/user/logout',auth,async (req,res)=>{
    try{
        req.auth_user.tokens=req.auth_user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.auth_user.save()
        res.send()
    }
    catch(e){
        console.log(e)
        res.status(500).send()
    }
})

router.post('/user/logOutAll',auth,async(req,res)=>{
    try{
        req.auth_user.tokens=[]
        await req.auth_user.save()
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
    
})

router.get('/user/me',auth,async(req,res)=>{
    res.send(req.auth_user)
})

// router.get('/user/:id',auth,async(req,res)=>{
//     let id=req.params.id

//     try{
//         let info=await User.findById(id)
        
//         if(!info){
//             return res.status(404).send("user not found")
//         }
//         res.send(info)
//     }
//     catch(e){
//         res.status(500).send("error in fetching data")
//     }
//     // let info=User.findById(id)
//     // info.then((user)=>{
//     //     if(!user){ 
//     //         return res.status(404).send("user not found")
//     //     }
//     //     res.send(user)
//     // }).catch((e)=>{
//     //     res.status(500).send("error in fetching data")
//     // })
// })

router.patch('/userUpdate',auth,async(req,res)=>{

    const updates=Object.keys(req.body)
    const allowedUpdate=['name','email','password','age']
    const isValidOperation=updates.every((update)=>allowedUpdate.includes(update))

    if(!isValidOperation){
        return res.status(400).send("invalid operation")
    }
    // let id=req.auth_user._id

    try{
        // let new_user=await User.findById(id)

        updates.forEach((update)=>{
            req.auth_user[update]=req.body[update]
        })
        await req.auth_user.save()

        // if(!new_user){
        //     return res.status(404).send("user not found")
        // }
        res.send(req.auth_user)
    }
    catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/users/deleteMe',auth,async (req,res)=>{
    try{
        await req.auth_user.deleteOne()
        res.send(req.auth_user)
    }
    catch(e){
        console.log(e)
        res.status(500).send()
    }
})
const upload=multer({
    // dest:'avatars',
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("only images are allowed"))
        }
        cb(undefined,true)
    }
})

router.post('/user/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    let buffer=await sharp(req.file.buffer).resize({width:100,height:100}).png().toBuffer()
    
    req.auth_user.avatar=buffer
    await req.auth_user.save()

    res.send("uploaded successfully")
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/user/me/avatar',auth,async(req,res)=>{
    req.auth_user.avatar=undefined
    await req.auth_user.save()

    res.send("deleted profile picture")
})

router.get('/user/:id/getAvatar',async(req,res)=>{
    try{
        let curr_user=await User.findById(req.params.id)

        if(!curr_user || !curr_user.avatar){
            throw new Error("error")
        }
        res.set('content-type','image/png')
        res.send(curr_user.avatar)
    }
    catch(e){
        res.status(404).send()
    }
})

module.exports=router