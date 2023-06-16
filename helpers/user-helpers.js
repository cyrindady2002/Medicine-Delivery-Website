var db = require('../config/connection');
var collection = require('../config/collections');
const bcrypt = require('bcrypt');

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        userData.Password = await bcrypt.hash(userData.Password, 10);
        const result = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);
        resolve(result.ops[0]);
      } catch (error) {
        reject(error);
      }
    });
  },
  doLogin:(userData)=>{
    return new Promise(async(resolve,reject)=>{
  
        let loginStatus=false
        let response={}
        try {
          let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
          console.log(user)
        if(user){
            bcrypt.compare(user.Password,userData.Password).then((status)=>{
                   if(status){
                    console.log("login success");    
                   }else{
                    console.log("login failed");
                   }
            })
        }else{
            console.log("login failed");
           }
        } catch (error) {
          console.log(error)
        }
        
    })
  }
};
