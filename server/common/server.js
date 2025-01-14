import express from "express";
import Mongoose from "mongoose";
import * as http from "http";
import * as path from "path";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import apiErrorHandler from '../helper/apiErrorHandler';
import WebSocket from 'websocket';
import { parse } from "path";



const WebSocketServer = WebSocket.server;
const WebSocketClient = WebSocket.client;
const client = new WebSocketClient();
const app = new express();
const server = http.createServer(app);
const root = path.normalize(`${__dirname}/../..`);
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 64 * 1024 * 1024,   // 64MiB
  maxReceivedMessageSize: 64 * 1024 * 1024, // 64MiB
  fragmentOutgoingMessages: false,
  keepalive: false,
  disableNagleAlgorithm: false
});

class ExpressServer {
  constructor() {
    app.use(express.json({ limit: '1000mb' }));

    app.use(express.urlencoded({ extended: true, limit: '1000mb' }))

    app.use(morgan('dev'))

    app.use(
      cors({
        allowedHeaders: ["Content-Type", "token", "authorization"],
        exposedHeaders: ["token", "authorization"],
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
      })
    );
  }
  router(routes) {
    routes(app);
    return this;
  }

  configureSwagger(swaggerDefinition) {
    const options = {
      // swaggerOptions : { authAction :{JWT :{name:"JWT", schema :{ type:"apiKey", in:"header", name:"Authorization", description:""}, value:"Bearer <JWT>"}}},
      swaggerDefinition,
      apis: [
        path.resolve(`${root}/server/api/v1/controllers/**/*.js`),
        path.resolve(`${root}/api.yaml`),
      ],
    };

    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(options))
    );
    return this;
  }

  handleError() {
    app.use(apiErrorHandler);

    return this;
  }

  configureDb(dbUrl) {
    return new Promise((resolve, reject) => {
      Mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        family: 4,
        keepAlive: true,
        connectTimeoutMS: 1000 * 60 * 5
      }, (err) => {
        if (err) {
          console.log(`Error in mongodb connection ${err.message}`);
          return reject(err);
        }
        console.log("Mongodb connection established");
        return resolve(this);
      });
    });
  }

  // })

  listen(port) {
    server.listen(port, () => {
      console.log(`Secure app is listening @port ${port}`, new Date().toLocaleString());
    });
    return app;
  }
}

wsServer.on('request', function (request) {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  const connection = request.accept('', request.origin);

  async function getNotificationList(token) {
    if (connection.connected) {
      let result = await notificationController.getNotificationList(token);
      if (result) {
        var data = JSON.stringify(result.responseResult);
        connection.sendUTF(data);
      }
      setTimeout(() => {
        getNotificationList(token)
      }, 5000);
    }
  }
  //******************************************************************************************/
  connection.on('message', function (message) {
    var type = JSON.parse(message.utf8Data);
    console.log("type===>>", type)
    if (type.token) {
      connection.sendUTF(getNotificationList(type.token));
    }
  })

  connection.on('close', function (reasonCode, description) {
    console.log(new Date() + ' Peer ' + connection.remoteAddress + ' Client has disconnected.');
  });
  connection.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
  });
});

client.on('connect', function (connection) {
  connection.on('message', function (error) {
    console.log(new Date() + ' WebSocket Client Connected');
  });
  connection.on('error', function (error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function () {
    console.log('echo-protocol Connection Closed');
  });

});

// client.connect(`ws://localhost:1891/`, '');


export default ExpressServer;

function originIsAllowed(origin) {
  return true;
}

