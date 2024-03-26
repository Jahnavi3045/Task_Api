const mongo=require('mongoose')
const validator=require('validator')
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')

const Task=require('./task')

const userSchema=new mongo.Schema({
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
        unique:true,
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
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.generateAuthToken=async function(){
    let user=this
    let token=jwt.sign({_id:user._id.toString()},process.env.jwt_secret)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON= function(){
    let curr_user=this
    let userObj=curr_user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}

userSchema.statics.findByCredentials=async (email,password)=>{
    let logging_user=await user.findOne({email})
    if(!logging_user){
        throw new Error('user doesnt exist')
    }
    let isMatch=await bcryptjs.compare(password,logging_user.password)
    if(!isMatch){
        throw new Error("incorrect password")
    }
    return logging_user
}

userSchema.pre('save',async function(next){
    let curr_user=this

    if(curr_user.isModified('password')){
        curr_user.password=await bcryptjs.hash(curr_user.password,8)
    }
    next()
})

userSchema.pre('deleteOne',async function(next){
    let curr_user=this
    // await Task.deleteMany({owner:curr_user._id})

    await Task.deleteMany({owner:curr_user._conditions._id})
    next()
})

const user=mongo.model('user',userSchema)

module.exports=user