const mongo=require('mongoose')
const express=require('express')
const dotenv=require('dotenv')
dotenv.config()

const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')

const app=express()
const port=8000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port,async()=>{
    try {
        await mongo.connect(process.env.mongo_url)
        console.log("connected")
    } catch {
        console.log("not connected")
    }
})