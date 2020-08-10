"use strict";

const uuid = require("uuid");
const Dialogbot = require("../utils/dfservice.js");
const twilio = require("../utils/twilio.js");
const producto = require("./productoController.js");

const sessionIds = new Map();

function setSessionAndUser(senderID) {
  if (!sessionIds.has(senderID)) {
    sessionIds.set(senderID, uuid.v1());
  }
}
async function detectIntent(intento) {
  var mensaje = "";
  switch (intento) {
    case "ordenar":
      mensaje += "tenemos los siguientes productos: \n";
      var object = await producto.Catalogo();
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          const element = object[key];
          mensaje += element.nombre + " -> " + element.precio + " Bs. \n";
        }
      }
      break;
  }
  return mensaje;
}
exports.sendTwilio = async (req, res, next) => {
  try {
    const sender = req.body.From;
    const text = req.body.Body;
    const from = req.body.To;
    setSessionAndUser(sender);
    let response;

    response = await Dialogbot.sendTextQueryToDialogFlow(
      sessionIds,
      sender,
      text
    );
    var mensaje = await detectIntent(response.intent.displayName);
    if (mensaje == "") {
      mensaje = response.fulfillmentText;
    }
    await twilio
      .sendText(from, mensaje, sender)
      .then((resp) => console.log(resp.sid));
  } catch (error) {
    console.log(error);
    next();
  }
};
