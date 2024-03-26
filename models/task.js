const mongo=require('mongoose')

const taskSchema=new mongo.Schema({
    description:{
        required:true,
        type:String,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongo.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    }
},{
    timestamps:true
})

const Task=mongo.model('Task',taskSchema)

module.exports=Task