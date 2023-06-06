var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let products=[
{    name:"Zerodol P",
     category:"Tablet",
     description:"Rs.78.00",
     image:"https://www.practostatic.com/practopedia-images/v3/res-750/zerodol-p-tablet-10-s_f54723ff-3356-4e6d-aa61-f39df92a34dd.JPG"
},
{
    name:"Dolo 650",
     category:"Tablet",
     description:"Rs.20.00",
     image:"https://cpimg.tistatic.com/04228300/b/5/Paracetamol-Tablets.jpg"
},
{    name:"Rabesec DSR",
  category:"Capsule",
  description:"Rs.152.00",
  image:"https://images.apollo247.in/pub/media/catalog/product/r/a/rab0058.jpg"
},
{    name:"Zincovit",
  category:"Capsule",
  description:"Rs.90.00",
  image:"https://images.apollo247.in/pub/media/catalog/product/c/_/c.jpg"
}
  ]
  res.render('index', {products,admin:false});
});

module.exports = router;
