var db = require('../config/connection');
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
var objectId=require('mongodb').ObjectID
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
        userData.Password = await bcrypt.hash(userData.Password, 10);
         db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
          resolve(data.ops[0])
         })
        
      })

    
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus=false
      let response={}
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if (user) {
                bcrypt.compare(userData.Password,user.Password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user=user
                        response.status=true
                        resolve(response)
                    } else {
                        console.log("login failed")
                        resolve({status:false})
                    }
                })
            } else {
                console.log("login failed")
                resolve({status:false})
            }
        
    })
},
addToCart: (proId, userId) => {
    let proObj = {
        item: objectId(proId),
        quantity: 1
    };

    return new Promise(async (resolve, reject) => {
        try {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });

            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId);

                if (proExist !== -1) {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId),'products.item':objectId(proId)},
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve();
                    });
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne(
                        { user: objectId(userId) },
                        {
                            $push: { products: proObj }
                        }
                    ).then(() => {
                        resolve();
                    });
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                };

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(() => {
                    resolve();
                });
            }
        } catch (error) {
            reject(error);
        }
    });
},

getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },{
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray();
            resolve(cartItems);
        } catch (error) {
            reject(error);
        }
    });
},



getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });
            let count = 0;
            if (cart) {
                count = cart.products.length;
            }
            resolve(count);
        } catch (error) {
            reject(error);
        }
    });
},
changeProductQuantity:(details)=>{
    details.count=parseInt(details.count)
    details.quantity=parseInt(details.quantity)
    return new Promise((resolve,reject)=>{
        if(details.count==-1 && details.quantity==1){
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({_id:objectId(details.cart)},
        {
          $inc:{'products.$.quantity':details.count}
        }
        ).then((response)=>{
            resolve({removeProduct:true})
        })
    }else{
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
        {
              $inc:{'product.$.quantity':details.count}
        }
        ).then((response)=>{
            resolve(true)
        })

    }
       
    })
    


    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
          try {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
              {
                $match: { user: objectId(userId) }
              },
              {
                $unwind: "$products"
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity"
                }
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product"
                }
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] }
                }
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: {
                    $toDouble: "$product.price"
                  }
                }
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: { $multiply: ["$quantity", "$product"] } }
                }
              }
            ]).toArray();
      
            console.log(total[0].total);
            resolve(total[0].total);
      
           
          } catch (error) {
            reject(error);
          }
        });
      },

      placeOrder:(order,products,total)=>{
 return new Promise((resolve,reject)=>{
    console.log(order,products,total);
    let status=order['payment-method']==='COD'?'placed':'pending'
    let orderObj={
        deliveryDetails:{
            mobile:order.mobile,
            address:order.address,
            pincode:order.pincode
            
        },
        userId:objectId(order.userId),
        PaymentMethod:order['payment-method'],
        products:products,
        totalAmount:total,
        status:status,
        date:new Date()
    }
    db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
        db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
        resolve()
    })
 })
      },
      getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userId);
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            console.log(cart);
            resolve(cart.products)
        })
      },
      getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userId);
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
            console.log(orders);
            resolve(orders)
        })
      },
      getOrderProducts: (orderId) => {
        console.log("hai");
        return new Promise(async (resolve, reject) => {
         
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $match: { _id: objectId(orderId) }
              },
              {
                $unwind: "$products"
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity"
                }
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product"
                }
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] }
                }
              }
            ]).toArray();
      
            console.log(orderItems);
            resolve(orderItems);
            console.log("hello");
      
           
          
        });
      }

}
