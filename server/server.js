const http = require("http");
const express = require("express");
const { urlencoded } = require("body-parser");
const app = express();
const port = process.env.PORT || 1337;
app.use(urlencoded({ extended: false }));
//require the connection module to connect to the mysql database using Sequalize
require("./src/database/connection");
const Message = require("./src/models/Message");

//boilerplate for socket.io
const server = http.createServer(app);
const io = require("socket.io")(server, { origins: "*:*" });
//declare a variable to save socket object for later usage
let socketObject = null;
//listen for connection and obtain the socket object
io.on("connection", (socket) => {
  socketObject = socket;
  //emit greeting to client-side socket on connection
  socketObject.emit("message", "Greeting from server-side socket");
  //listen for and log general message from client-side socket
  socketObject.on("message", (msg) => {
    console.log(msg);
  });
  //listen for smsMessage from client-side socket and then send the SMS message to myNumber
  socketObject.on("smsMessage", (msg) => {
    console.log(msg);
    sendSMS(twilioNumber, myNumber, msg);
  });
});

const MessagingResponse = require("twilio").twiml.MessagingResponse;
//twilio keys
const accountSid = "########PROVIDE YOUR ACCOUNT SID##################";
const authToken = "########PROVIDE YOUR AUTH TOKEN##################";
const twilioNumber = "+12622879711";
const myNumber = "########PROVIDE YOUR PHONE NUMBER##################";
//sms webhook route:
const webhookRoute = "/sms";
const client = require("twilio")(accountSid, authToken);

let sendSMS = function (fromNumber, toNumber, textBody) {
  client.messages
    .create({
      body: textBody,
      from: fromNumber,
      to: toNumber,
    })
    .then((message) => {
      console.log(message);
    });
};
//this route is just for sanity check purpose so that we can test sending a SMS msg and test socketObject.emit as well
app.get("/api/sendSMS", (req, res) => {
  sendSMS(
    twilioNumber,
    myNumber,
    "test message send from Node with twilio number"
  );
  socketObject.emit("message", "greeting from /api/sendSMS");
  res.send("connected");
});

/* Logic Flow: my phone -> twilio number (data center) ->POST Request-> webhook url linked to: localhost:1337/sms */
app.post(webhookRoute, async (req, res) => {
  const twiml = new MessagingResponse();
  console.log(req.body); //need to check all available fields in req.body
  
  //emit the received sms message event from phone to client-side socket, so as to display it on UI
  socketObject.emit("smsObject", req.body);

  /* DB operation below to insert this message in Mysql using Sequelize */
  let tel_from = req.body.From;
  let tel_to = req.body.To;
  let message = req.body.Body;

  let messageObj = {
    tel_from,
    tel_to,
    message,
  };
  //console.log(messageObj);
  //Generic Error Handler
  const errHandler = (err) => {
    //Catch and log any error.
    console.log("Error: " + err);
  };

  let newMessage = await Message.create(messageObj).catch(errHandler);
  //console.log(newMessage);
  /* END of DB operation*/

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end("<Response></Response>");
});

server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
