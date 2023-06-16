var express = require("express");
var router = express.Router();
var productHelpers= require("../helpers/product-helpers");
const userHelpers=require('../helpers/user-helpers');
/* GET home page. */
router.get("/", function (req, res, next) {
  
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render('user/view-product',{ admin: false, products });
  })
});
router.get('/login',(req,res)=>{
  res.render('user/login')
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',async (req,res)=>{
  const response = await userHelpers.doSignup(req.body);
  console.log(response);
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body)
})
module.exports = router;
