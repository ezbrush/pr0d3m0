"use strict";
const admin = require("../utils/firebase.js");
const db = admin.database();
//que obtenga el producto con el descuento incluido,
// si no tiene descuento, solo el producto.
async function obtenerProducto(idProducto) {
  var objres = {};
  var snapshot = await db.ref("productos").once("value");
  var datas = snapshot.val();
  for (let key in datas) {
    var obj = datas[key];
    if (idProducto == obj.id) {
      objres = obj;
      objres.oid = key;
      break;
    }
  }
  return objres;
}

async function obtenerDescuento(idDescuento) {
  var objres = {};
  var snapshot = await db.ref("descuentos").once("value");
  var datas = snapshot.val();
  for (let key in datas) {
    var obj = datas[key];
    if (idDescuento == obj.id_descuento) {
      objres = obj;
      break;
    }
  }
  return objres;
}
//Funcion auxiliar
async function listaPromoProducto() {
  var resjson = {};
  var tempProducto = {};
  var tempDescuento = {};
  var i = 0;
  var cadena = "";
  var snapshot = await db.ref("descXprod").once("value");
  var datas = snapshot.val();
  //Generamos el formato json para el envio.
  for (let key in datas) {
    i = i + 1;
    cadena = "prodPromo" + i;
    var tempobj = datas[key];
    tempDescuento = await obtenerDescuento(tempobj.id_descuento);
    tempProducto = await obtenerProducto(tempobj.id_producto);
    let tempjson = Object.assign(tempProducto, tempDescuento);
    tempjson.promo = "true";
    resjson[cadena] = tempjson;
  }
  return resjson;
}

//Solo lista los productos promocionados
exports.listaPromoProducto = async (req, res, next) => {
  try {
    var resjson = {};
    var tempProducto = {};
    var tempDescuento = {};
    var tempobj = {};
    var i = 0;
    var cadena = "";
    var snapshot = await db.ref("descXprod").once("value");
    var datas = snapshot.val();
    //Generamos el formato json para el envio.
    for (let key in datas) {
      i = i + 1;
      cadena = "prodPromo" + i;
      tempobj = datas[key];
      tempDescuento = await obtenerDescuento(tempobj.id_descuento);
      tempProducto = await obtenerProducto(tempobj.id_producto);
      let tempjson = Object.assign(tempProducto, tempDescuento);
      tempjson.promo = "true";
      resjson[cadena] = tempjson;
    }
    return res.json({
      ok: true,
      datas: resjson,
    });
  } catch (error) {
    console.log(error);
    next();
  }
};
//Listar los productos con las promociones incluidas
exports.listaProductoPorCategoria = async (req, res, next) => {
  try {
    var i = 0;
    var cadena = "";
    var params = req.query;
    //id categoria
    var idCategoria = params.categoria;
    if (idCategoria == 6) return this.listaProducto(req, res, next);
    if (idCategoria == 7) return this.listaPromoProducto(req, res, next);
    var producto = {};
    var resjson = {};
    var listPromo = await listaPromoProducto();
    var snapshot = await db.ref("productos").once("value");
    var datas = snapshot.val();
    var sw = true;
    var promo = {};
    for (let key in datas) {
      sw = true;
      i = i + 1;
      cadena = "prodCate" + i;
      producto = datas[key];
      //producto cumple con la categoria
      if (idCategoria == producto.id_categoria) {
        //Si tiene una promocion, almaceno la promocion
        for (let keyPromo in listPromo) {
          promo = listPromo[keyPromo];
          if (promo.id == producto.id) {
            resjson[cadena] = promo;
            sw = false;
            break;
          }
        }
        if (sw) {
          producto.oid = key;
          producto.promo = "false";
          resjson[cadena] = producto;
        }
      }
    }

    return res.json({
      ok: true,
      datas: resjson,
    });
  } catch (error) {
    console.log(error);
    next();
  }
};
// Incluye a los productos con las promociones
exports.listaProducto = async (req, res, next) => {
  try {
    var i = 0;
    var cadena = "";
    var resjson = {};
    var producto = {};
    var sw = true;
    var promo = {};
    var listPromo = await listaPromoProducto();
    var snapshot = await db.ref("productos").once("value");
    var datas = snapshot.val();
    for (let key in datas) {
      sw = true;
      i = i + 1;
      cadena = "producto" + i;
      producto = datas[key];
      for (let keyPromo in listPromo) {
        promo = listPromo[keyPromo];
        if (promo.id == producto.id) {
          resjson[cadena] = promo;
          sw = false;
          break;
        }
      }
      if (sw) {
        producto.oid = key;
        producto.promo = "false";
        resjson[cadena] = producto;
      }
    }

    return res.json({
      ok: true,
      datas: resjson,
    });
  } catch (error) {
    console.log(error);
    next();
  }
};
//Obtiene el producto por el nombre (usado por el dialogflow)
exports.getProducto = async (req, res, next) => {
  try {
    var ok = false;
    var sw = true;
    var params = req.query;
    var nombre = params.producto;
    var objres = {};
    var snapshot = await db.ref("productos").once("value");
    var datas = snapshot.val();
    var listPromo = await listaPromoProducto();
    if (typeof nombre !== "undefined") {
      for (let key in datas) {
        if (ok) break;
        var producto = datas[key];
        //console.log(obj.nombre);
        if (nombre == producto.nombre) {
          //console.log("existe el producto llamado:" + obj.nombre);
          ok = true;
          for (let keyPromo in listPromo) {
            var promo = listPromo[keyPromo];
            if (promo.id == producto.id) {
              objres = promo;
              sw = false;
              break;
            }
          }
          if (sw) {
            producto.oid = key;
            producto.promo = "false";
            objres = producto;
          }
        }
      }
    }

    return res.json({
      ok: ok,
      producto: objres,
    });
  } catch (error) {
    console.log(error);
    next();
  }
};

// Incluye a los productos con las promociones
exports.Catalogo = async () => {
  try {
    var i = 0;
    var cadena = "";
    var resjson = {};
    var producto = {};
    var sw = true;
    var promo = {};
    var listPromo = await listaPromoProducto();
    var snapshot = await db.ref("productos").once("value");
    var datas = snapshot.val();
    for (let key in datas) {
      sw = true;
      i = i + 1;
      cadena = "producto" + i;
      producto = datas[key];
      for (let keyPromo in listPromo) {
        promo = listPromo[keyPromo];
        if (promo.id == producto.id) {
          resjson[cadena] = promo;
          sw = false;
          break;
        }
      }
      if (sw) {
        producto.oid = key;
        producto.promo = "false";
        resjson[cadena] = producto;
      }
    }
    return resjson;
  } catch (error) {
    console.log(error);
  }
};
//Mostrar el index principal a renderizar
exports.index = async (req, res, next) => {
  try {
    const snapshot = await db.ref("productos").once("value");
    const datas = snapshot.val();
    res.render("index", { data: datas });
  } catch (error) {
    console.log(error);
    next();
  }
};
