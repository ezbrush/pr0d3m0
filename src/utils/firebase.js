var admin = require("firebase-admin");
var config = require("../../config.js");

var serviceAccount = require("../../assets/firebase-secret.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.database,
});
module.exports = admin;
