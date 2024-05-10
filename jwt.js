const jwt=require('jsonwebtoken');

const jwtAuthMiddleware=(req,res,next)=>{

    // first check request header has authorization or not
    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({error:'Token not found'});

    // extract jwt token from request header
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error:'unauthorized'});

    try{
        // verify the jwt token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        // attach user information to the request object
        req.user = decoded;
        next();
    }
    catch(err){
        console.log(err);
        res.status(401).json({error:'invalid token'});
    }
}

// generate jwt token

const generateToken = (userData)=>{
    
    // generate new jwt token using user data
    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:50000});
}

module.exports = {jwtAuthMiddleware,generateToken};