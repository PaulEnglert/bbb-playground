import express from "express";

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import temperatureRouter from "./temperature";
import servoRouter from "./servo";


// prepare global router
const globalRouter = express.Router();
globalRouter.get("/", getHome());


// configure express app
const app = express();
export default app;
app.use(express.json());
const apis = [
  ["/temperature", temperatureRouter],
  ["/servo", servoRouter],
  ["/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs())],
  ["/", globalRouter],
];
apis.map(api => app.use(...api));


// start server
const port = process.env.PORT || 36000;
app.listen(port, () => console.log(`BBB Playground API ready: http://localhost:${port}`));


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
    },
    apis: ['./api/**/*.js'],
  });
}
