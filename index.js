const app = require("./app.js");
//puerto
app.listen(app.get("port"));
console.log("servidor corriendo en el puerto ", app.get("port"));
