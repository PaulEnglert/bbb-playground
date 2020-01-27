import express from "express";

import * as errs from './errors';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import temperatureRouterFactory from "./temperature";
import servoRouterFactory from "./servo";


/**
 * serve() constructs and runs the api for the given
 * hardware configuration.
 *
 * bbmgr: bbManager instance
 * server: {port: <int>}
 * hardware: {temperatureSensors: see temperature api, servos: see servo api}
 *
 */
export function serve(bbmgr, server, hardware) {

  const { port } = server;
  const { temperatureSensors, servos } = hardware;

  // prepare global router
  const globalRouter = express.Router();
  globalRouter.get("/", getHome());


  // configure express app
  const app = express();
  app.use(express.json());
  const apis = [
    ["/temperature", temperatureRouterFactory(bbmgr, temperatureSensors)],
    ["/servo", servoRouterFactory(bbmgr, servos)],
    ["/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs())],
    ["/", globalRouter],
  ];
  apis.map(api => app.use(...api));
  app.use(errorHandler);


  // start server
  app.listen(port, () => console.log(`BBB Playground API ready: http://localhost:${port}`));

}

/**
 * getHome() produces a request hander for the globaç
 * api home route.
 *
 * @swagger
 * /:
 *  get:
 *    tags:
 *      - Global
 *    description: Returns general api description and health
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The api description and health
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                version:
 *                  type: string
 *                status:
 *                  type: string
 *                  enum: [healthy]
 */
function getHome() {
  const data = {
    version: "0.0.0",
    status: "healthy"
  }
  return (_, res) => {
    res.json(data);
  }
}

/**
 * errorHandler() returns a middleware that will handle errors
 * properly as long as they have been using the errors defined
 * in the 'error' package.
 *
 *
 */
function errorHandler (err, req, res, next) {
  if (err.name === errs.NotFoundError.name)
    res.status(404);
  else if (err.name === errs.BadRequestError.name)
    res.status(400)
  else // if (err.name === errs.InternalServerError.name)
    res.status(500)
  res.json({ message: err.message, name: err.name });
}


/**
 * swaggerSpecs() returns a swagger-jsdoc compatible specs
 * object to dynamically produce the api docs.
 *
 *
 */
function swaggerSpecs() {
  return swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'BBB Playground API',
        version: '0.0.0',
        description: 'BeagleBone Black Playground APIs',
      },
      servers: [
        {description: "Development", url:""},
        {description: "BBB", url:"http://beaglebone.wifi/bbb-playground"},
      ]
    },
    apis: ['./api/**/*.js'],
  });
}
