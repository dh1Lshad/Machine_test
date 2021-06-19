const express = require('express');
const router = express.Router();
const Product = require('../models/product');

/* GET home page. */
router.get('/allProducts', (req, res, next) => {
  Product.find().select('_id name color uom quantity ')
            .exec()
            .then(products => {
                const response = {
                    count: products.length,
                    products: products.map(product => {
                        return {
                            _id:product._id,
                            name: product.name,
                            uom:product.uom.map(uom=>{
                              return(
                                product.color + " : " +uom.size + ' - ' + uom.price
                              )
                            }),
                            quantity:product.quantity
                        }
                    })
                }
                res.status(200).json(response)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err })
            })
});

router.post('/addProduct', (req,res,next) => {
  console.log(req.body);
  const {name,color,uom,quantity} = req.body;
  const product = new Product({ name,color,uom,quantity });
  product.save()
    .then(response => {
      console.log(response)
      res.status(201).json({
        message: "Product created successfully"
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: err })
    })
})

module.exports = router;
