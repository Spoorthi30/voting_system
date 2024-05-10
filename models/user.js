const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

// create user schema
const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String
    },
    mobile:{
        type:String
    },
    address:{
        type:String,
        required:true
    },
    adharCardNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }
});

userSchema.pre('save',async function(next){
    const person = this;
    // hash the password only if it is modified(or is new)
    if(!person.isModified('password')) return next();
    try{
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashPassword = await bcrypt.hash(person.password,salt);
        person.password=hashPassword;
        next();

    }
    catch(err){
        return next(err);
    }
});

userSchema.methods.comparePassword=async function(candidatePassword){
    try{
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword,this.password);
        return isMatch;
    }
    catch(err){
        throw err;
    }
}

// create user model
const User=mongoose.model('User',userSchema);
module.exports=User;

