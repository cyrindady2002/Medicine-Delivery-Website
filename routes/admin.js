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
  console.log(req.files.image);

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
router.get('/delete-product/:id',(req,res)=>{
    let proId=req.params.id
    console.log(proId)
    productHelpers.deleteProduct(proId).then((response)=>{
      res.redirect('/admin/')
    })
})
router.get('/edit-product/:id',async(req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product',{product})
})
router.post('/edit-product/:id',(req,res)=>{
  let id=req.params.id
    productHelpers.updateProduct(req.params.id,req.body).then(()=>{
      res.redirect('/admin')
      if(req.files.image){
        let image=req.files.image
        image.mv('./public/product-images/'+id+'.png')
        
      }
    })
})

module.exports = router;

