const express = require("express");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const path = require("path");
const routes = require("./src/routes/routes.js");
//crear el servidor
const app = express();
//settings
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "./src/views"));
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");
// middlewares
app.use(morgan("dev"));
app.use(
  express.urlencoded({
    extended: false,
  })
);
//routes(rutas) de la app
app.use(routes);
//static files
app.use(express.static(path.join(__dirname, "public")));
process.env.TZ = "America/La_Paz";
module.exports = app;
