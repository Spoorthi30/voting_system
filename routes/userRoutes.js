const express=require('express');
const router=express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');

router.post('/signup', async (req, res) => {
    try {
        const data = req.body;     //the data will be sent in many forms by the user. All the forms will be handled by the bodyParser and will be 
        //stored in req.body

        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Convert Aadhar Card number to string and validate its length
        if (!/^\d{12}$/.test(String(data.adharCardNumber))) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }


        // Check if a user with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({ adharCardNumber: data.adharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }

        // create a new user document using mongoose model
        const newUser = new User(data);

        // save the new user to database
        const response = await newUser.save();
        console.log("data saved");

        const payload={
            id:response.id
        }

        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
       
        console.log("Token is:",token);

        res.status(200).json({response:response,token:token});

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// Login route
router.post('/login', async (req, res) => {
    try {
        const { adharCardNumber, password } = req.body;

        // Find user by adharCardNumber
        const user = await User.findOne({adharCardNumber:adharCardNumber});

        // If user does not exists or password does not match , return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:'Invalid username or password'});
        }

        // generate token
        const payload={
            id:user.id
        }

        const token = generateToken(payload);

        // return token as response 
        res.json({token});

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userData = req.user;

        const userId = userData.id;
        const user = await User.findById(userId);
        
        res.status(200).json({user});
    }
    catch(err){
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userId = req.user.id;  // Extract id from token
        const {currentPassword,newPassword}=req.body;   //Extract current and new password from request body

        // Find user by userID
        const user = await User.findById(userId);

         // If password does not match , return error
         if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:'Invalid username or password'});
        }

        // Update the user's password

        user.password=newPassword;
        await user.save();

        console.log('Password updated');
        res.status(200).json({message:'Password updated'});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal error'});
    }
})

module.exports=router;

