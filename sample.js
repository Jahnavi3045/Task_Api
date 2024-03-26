const mongo=require('mongoose')
const express=require('express')
const validator=require('validator')

const app=express()
const port=8000

const user=mongo.model('user',{
    name:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        // validate(value){
        //     if(value.length<6){
        //         throw new Error("short password")
        //     }
        // },
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error('it should not contain password')
            }
        }
    },
    email:{
        type:String,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("invalid email")
            }
        }
    },
    age:{
        type:Number,
        validate(value){
            if(value<0){
                throw new Error('age cannot be negative!!')
            }
        }
    }
})

const person=new user({
    name:"    jahnavi   ",
    age:18,
    email:"jAHNavi3045@gmail.com",
    password:"pass123"
})

const task=mongo.model('tasks',{
    description:{
        type:String
    },
    completed:{
        type:Boolean,
        default:false
    }
})

const new_task=new task({
    description:"do 2 leet code sums"
})

person.save().then((result)=>{
    console.log(result)
}).catch((error)=>{
    console.log(error)
})

new_task.save().then(()=>{
    console.log(new_task)
}).catch((error)=>{
    console.log(error)
})
app.listen(port,async()=>{
    try {
        await mongo.connect("mongodb+srv://jahnavi3045:task123@cluster0.jmxofxm.mongodb.net/")
        console.log("connected")
    } catch {
        console.log("not connected")
    }
})