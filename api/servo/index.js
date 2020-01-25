import express from "express";


/**
 * routerFactory() creates a new router object given
 * the specified servo(s). The `servos` argument is
 * expected to contain a single object, or a list of objects
 * denoting a hardware servo connection:
 * ```
 * // example entry of the servos argument:
 * {
 *   pins: {signal: "P9_14"}
 * }
 * ```
 *
 *
 *
 */
export default function routerFactory(servos) {

  // validate servos
  if (!servos || servos.length < 1)
    throw new Error('Require at least 1 servo configuration!');
  if (!(servos instanceof Array)) servos = [servos];
  servos.forEach(({ pins }) => {
    if (!pins || !pins.signal || pins.signal == '')
      throw new Error(`Servo configuration requires property 'pins.signal'!`);
  });

  // setup routes
  const router = express.Router();
  router.get('/', getServos(servos));
  // router.get('/:id/position', getPosition(servos));
  // router.post('/:id/position', setPosition(servos));

  // return router
  return router;

}

/**
 * getServos() produces a request hander for the list of servos
 * api route.
 *
 * @swagger
 * /servo:
 *  get:
 *    tags:
 *      - Servo
 *    description: Returns the configured servos
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The currently configured servos
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    type: number
 *                    format: integer
 *                  pins:
 *                    type: object
 *                    properties:
 *                      signal:
 *                        type: string
 *                      ground:
 *                        type: string
 *                      power:
 *                        type: string
 */
function getServos(servos) {
  const data = servos.map(({ pins }, idx) => {
    return {
      id: idx,
      pins: pins
    }
  });
  return (req, res) => {
    return res.json(data);
  }
}
