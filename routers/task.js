const express=require('express')
const router=new express.Router()
// const taskModel=require('../models/task')
const Task=require('../models/task')
const auth=require('../middleware/auth')




router.post('/createTask',auth,async(req,res)=>{
    const task=new Task({
        ...req.body,
        owner:req.auth_user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
    // task.save().then(()=>{
    //     res.status(201).send(task)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
})

router.get('/getTasks',auth,async(req,res)=>{
    const filter={
        owner:req.auth_user._id
    }
    const findOptions={
        limit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort:{}
    }
    const projection={description:1}
    
    if(req.query.completed){
        filter.completed=req.query.completed==='true'
    }
    if(req.query.sortBy){
        let parts=req.query.sortBy.split(':')
        findOptions.sort[parts[0]]=parts[1]==="desc"?-1:1
    }
    try{
        // let tasks=await Task.find({owner:req.auth_user._id})
        // res.send(tasks)
        let tasks=await Task.find(filter,projection,findOptions)
        res.send(tasks)
        
    }
    catch(e){
        console.log(e)
        res.status(500).send("couldnt fetch tasks")
    }
    // tasks=Task.find({}).then((tasks)=>{
    //     res.send(tasks)
    // }).catch((e)=>{
    //     res.status(500).send("couldnt fetch tasks")
    // })
}) 

router.get('/task/this/:id',auth,async(req,res)=>{
    // let id=req.params.id

    try{
        let task=await Task.findOne({_id:req.params.id,owner:req.auth_user._id})
        // console.log(task)
        // // console.log(id)
        // console.log(req.auth_user)
        if(!task){
            return res.status(404).send("task doesnt exist")
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send()
    }
})

router.get('/updateTaskCompletion/:id',async(req,res)=>{
    let id=req.params.id
    
    try{
        let work=await Task.findOne(id,{completed:true}) 
        
        if(!work){
            return res.status(404).send("task not found")
        }
        res.status(200).json({
            message:"task updated",
            work
        })
        let count=await Task.countDocuments({completed:true})
        console.log(count)
    }
    catch(e){
        res.status(500).send("error")
    }

})

router.patch('/updateTask/:id',auth,async(req,res)=>{
    
    const updates=Object.keys(req.body)
    const allowedUpdates=['description','completed']
    let isValidOperation=updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send("invalid operation")
    }
    
    // let _id=req.params.id

    try{
        let new_task=await Task.findOne({_id: req.params.id,owner:req.auth_user._id})

        if(!new_task){
            return res.status(404).send("task not found")
        }
        updates.forEach((update)=>{
            new_task[update]=req.body[update]
        })
        await new_task.save()

        res.send(new_task)
    }
    catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/deleteTask/:id',auth,async(req,res)=>{
    // let id =req.params.id

    try{
        let deleted=await Task.findOneAndDelete({_id:req.params.id,owner:req.auth_user._id})

        if(!deleted){
            res.status(404).send("task doesnt exists")
        }
        res.status(200).json({
            message:"task deleted",
            deleted
        })
    }
    catch(e){
        res.status(500).send(e)
    }
})

module.exports=router