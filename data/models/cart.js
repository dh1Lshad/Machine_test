const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    user:{type:mongoose.Schema.ObjectId,required:true, ref:'User'},
    products:[
        {item:{type:mongoose.Schema.ObjectId, required:true, ref:'Product'},
        quantity:{type:Number, required:true}    
    }]
})

module.exports = mongoose.model('Cart',cartSchema);