var express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');
var app = express();
require('dotenv').config();

var userRoute = require('./data/routes/users');
var productRoute = require('./data/routes/products');

mongoose.connect(process.env.MONGO,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true})

mongoose.connection.on('connected',()=>{console.log("Connected to MongoDB server")})

mongoose.connection.on('err',(err)=>{console.log("MongoDB connection error",err);})

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use('/data', userRoute);
app.use('/data', productRoute);

// catch 404 and forward to error handler
app.use((req,res,next)=>{
  const err = new Error('Not Found');
  err.status =404;
  next(err)
})

module.exports = app;
