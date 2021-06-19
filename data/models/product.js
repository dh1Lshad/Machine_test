const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{type:String, required:true},
    color:{type:[String], required:true},
    uom:[{
        size:{type:String, required:true},
        price:{type:Number, required:true}
    }],
    quantity:{type:Number, required:true, default:0}

})

module.exports = mongoose.model('Product',productSchema);