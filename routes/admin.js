const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
var productHelpers= require("../helpers/product-helpers");
const { log } = require("handlebars");
router.get('/', function (req, res, next) {
productHelpers.getAllProducts().then((products)=>{
  console.log(products);
  res.render('./admin/view-products',{ admin: true, products });
})
 
});


router.get('/add-product', function (req, res) {
  res.render('admin/add-product');
});

router.post('/add-product', function (req, res) {
  console.log(req.body);
  console.log(req.files.images);

  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.image
    console.log(id)
    image.mv('./public/product-images/'+id+'.png',(err,done)=>{
      if(!err){
        res.render("admin/add-product")
      }else{
        console.log(err);
      }
    })
    
  })
})

module.exports = router;
