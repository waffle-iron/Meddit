var mongoose = require("mongoose")
var crypto = require("crypto")
var jwt = require('jsonwebtoken')

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase:true, unique: true},
  hash: String,
  salt: String
})

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex')
  //pbkdf2() is a password hashing function
  // salt is random data used to hash everything else
  //(password, salt, iterations, key_lengt)
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex')
  // set the salt and hash for the Schema
}

UserSchema.methods.validPassword = function(password){
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString("hex")
  return this.hash === hash;
}
// strongly recommended to use an environment variable for referencing secret
UserSchema.methods.generateJWT = function(){
  //token needs to expire after a week
  var today = new Date();
  var end = new Date(today);
  end.setDate(today.getDate() + 7)

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getDate()/ 1000)
  }, 'SECRET')

}

var User = mongoose.model("User", UserSchema)
