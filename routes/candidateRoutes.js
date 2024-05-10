const express=require('express');
const router=express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const Candidate = require('./../models/candidate');

const checkAdminRole= async(userID)=>{
    try{
        const user=await User.findById(userID);
        if(user.role === 'admin'){
            return true;
        }
    }
    catch(err){
        return false;
    }
}

// POST route to add a candidate
router.post('/', jwtAuthMiddleware,async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id))
            return res.status(404).json({message:'user has no admin role'});
        
       
        const data = req.body;     //the data will be sent in many forms by the user. All the forms will be handled by the bodyParser and will be 
        //stored in req.body

        // create a new Candidate document using mongoose model
        const newCandidate = new Candidate(data);

        // save the new user to database
        const response = await newCandidate.save();
        console.log("data saved");

        res.status(200).json({response:response});

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})



router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return response.status(403).json({message:'user does not have admin role'});
        }
        const candidateID = req.params.candidateID;  // Extract id from URL
        const updatedcandidateData = req.body;
        
        const response = await Person.findByIdAndUpdate(candidateID,updatedcandidateData,{
            new : true,   //return the updated document
            runValidators : true    //run the mongoose validation
        });

        if(!response){
            return res.status(404).json({error:'Candidate not found'});
        }

        console.log("Candidate Data updated");
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal error'});
    }
});

router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return response.status(403).json({message:'user does not have admin role'});
        }
        const candidateID = req.params.candidateID;  // Extract id from URL
        
        
        const response = await Person.findByIdAndDelete(candidateID,updatedcandidateData,{
            new : true,   //return the updated document
            runValidators : true    //run the mongoose validation
        });

        if(!response){
            return res.status(404).json({error:'Candidate not found'});
        }

        console.log("Candidate Data updated");
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal error'});
    }
});

// Lets start voting 
router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    // no admin can vote
    // User can vote only once

    candidateID=req.params.candidateID;
    userId = req.user.id;

    try{
        // Find the candidate document with the specified candidateID
        const candidate= await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message:'Candidate not found'});
        }

        const user= await User.findById(userId);
        if(!user){
            return res.status(404).json({message:'User not found'});
        }

        if(user.isVoted){
            return res.status(404).json({message:'User has already votes'});
        }

        if(user.role == 'admin'){
            return res.status(404).json({message:'Admin cannot vote'});
        }

        // Update the candidate to record the vote

        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        // Update the user document
        user.isVoted=true;
        await user.save();

        return res.status(200).json({message:'vote record successfull'});

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal error'});
    }
});

// Vote count
router.get('/vote/count',async(req,res)=>{
    try{
        // Find all candidate and sort them in descending order w.r.t votecount
        const candidate= await Candidate.find().sort({voteCount:'desc'});

        // Map the candidate to return  only name and votecount
        const Voterecord = candidate.map((data)=>{
            return{
                party:data.party,
                count:data.voteCount
            }
        });
        return res.status(200).json(Voterecord);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal error'});
    }
});

// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports=router;

