const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')
const Cart = require('../models/cart')
const Product = require('../models/product')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authToken = require('../middlewares/auth');

require('dotenv').config();

/* GET users listing. */
router.post('/signup', function(req, res, next) {
  console.log(req.body);
        User.find({email:req.body.email}).exec()
        .then(user =>{
            if(user.length >= 1){
                return res.status(409).json({message:"Mail id already exists"})
            }else{
                bcrypt.hash(req.body.password,10,(err,hash)=>{
                    if(err){
                        return res.status(500).json({error:err});
                    }else{
                        const user = new User({
                            _id:new mongoose.Types.ObjectId(),
                            email:req.body.email,
                            password:hash
                        });
                        user.save()
                        .then(result =>{
                            console.log(result);
                            res.status(201).json({message:"user created"})
                        })
                        .catch(err =>{
                            console.log(err);
                            res.status(500).json({error:err})
                        });
                    }
                })
            }
        })
});

router.post('/login', function(req, res, next) {
  console.log(req.body);
        User.findOne({email:req.body.email}).exec()
        .then(user =>{
            console.log(user);
            if(!user){
                return res.status(401).json({message:"Auth failed"})
            }
            bcrypt.compare(req.body.password,user.password,(err,result)=>{
                if(err){
                     return res.status(401).json({message:"Auth failed"})
                }
                if(result){
                    const token = jwt.sign({
                        email:user.email,
                        userId:user._id
                    },process.env.JWT_KEY,
                    {
                        expiresIn:"1h"
                    })
                    return res.status(200).json({message:"Auth Successfull", token:token})
                }
                res.status(401).json({message:"Auth failed  "})
            })
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({error:err})
        })
});

router.post('/addtocart',authToken,async(req,res)=>{
    console.log(req.body);
    const {productId, userId} = req.body;

    let proObj = {
      item: productId,
      quantity: 1,
    };
    console.log(proObj);

    let userCart = await Cart.findOne({ user: userId });

    if (userCart) {
      let proExist = userCart.products.findIndex(
        (product) => product.item == productId
      );

      if (proExist != -1) {
        Cart.findByIdAndUpdateOne(
          { user:userId, "products.item": productId },
          {
            $inc: { "products.$.quantity": 1 },
          }
        ).then(() => {
          res.status(200).json({ message: "quantity incremented" });
        });
      } else {
        Cart.updateOne(
          { user: userId },
          {
            $push: { products: proObj },
          }
        ).then((response) => {
          res.status(200).json({ message: "cart updated" });
        });
      }
    } else {
      let cartObj = {
        user: userId,
        products: [proObj],
      };
      console.log('cartObj',cartObj);
      Cart.insertMany(cartObj).then((response) => {
        res.status(200).json({ message: "product inserted to cart" });
      });
    }
})

router.get('/cartProducts',authToken,async(req,res)=>{
    const {userId} = req.body;
      console.log(userId + "get cart products");
      let userCart = await Cart.findOne({ user: userId });
      if (userCart) {
        let cartItems = await Cart.aggregate([
          {
            $match: { user: userId },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            }
          },
          {
            $lookup: {
              from: Product,
              localField: "item",
              foreignField: "_id",
              as: "product",
            }
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            }
          }
        ]).toArray()

        res.status(200).json({ message: "Cart products",cartItems });
      } else {
        console.log(response);
      }
})

module.exports = router;
