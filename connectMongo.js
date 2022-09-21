const sendMail = require('./testemail');

var mongoClient = require('mongodb').MongoClient;

global.dbo = null;
const connectDatabase = () => {

    var url = process.env.MONGODB_URL;

    mongoClient.connect(url, function(err, db) {
      if (err) {
        sendMail('Error in DB connection')
        throw err;
      } 
      dbo = db.db("DBMonday");
    
    });
}

module.exports = {
    connectDatabase
}