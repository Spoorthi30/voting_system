const mongoose=require('mongoose')
require('dotenv').config();

// define mongodb URL

const mongoURL=process.env.MONGODB_URL_LOCAL;          //local database
// const mongoURL= process.env.MONGODB_URL;
// set up mongodb connection
mongoose.connect(mongoURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true

})

// mongoDb object
const db=mongoose.connection;

// define event listenser to database server.     connected, error and disconnected are builtin
db.on('connected',()=>{
    console.log("Connected to the mongoDB server");
})

db.on('error',()=>{
    console.log("error");
})

db.on('disconnected',()=>{
    console.log("Disconnected from the mongoDB server");
})


// export to database connection    here to tut6_server.js
module.exports=db;