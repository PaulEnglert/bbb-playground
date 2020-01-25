import express from 'express';
import bs from 'bonescript';
import { NotFoundError } from '../errors';


/**
 * routerFactory() creates a new router object given
 * the specified sensor(s). The `sensors` argument is
 * expected to contain a single object, or a list of objects
 * denoting a hardware sensor connection:
 * ```
 * // example entry of the sensors argument:
 * {
 *   pins: {signal: "P9_40"}
 * }
 * ```
 *
 *
 *
 */
export default function routerFactory(sensors) {

  // validate sensors
  if (!sensors || sensors.length < 1)
    throw new Error('Require at least 1 sensor configuration!');
  if (!(sensors instanceof Array)) sensors = [sensors];
  sensors.forEach(({ pins }) => {
    if (!pins || !pins.signal || pins.signal == '')
      throw new Error(`Sensor configuration requires property 'pins.signal'!`);
  });

  // setup routes
  const router = express.Router();
  router.get('/', getSensors(sensors));
  router.get('/:id', getTemperature(sensors));

  // return router
  return router;

}


/**
 * getSensors() produces a request hander for the list of sensors
 * api route.
 *
 * @swagger
 * /temperature:
 *  get:
 *    tags:
 *      - Temperature
 *    description: Returns the configured temperature sensors
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The currently configured temperature sensors
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
function getSensors(sensors) {
  const data = sensors.map(({ pins }, idx) => {
    return {
      id: idx,
      pins: pins
    }
  });
  return (req, res) => {
    return res.json(data);
  }
}

/**
 * getTemperature() produces a request hander for the temperature
 * get api route for the given sensor.
 *
 * @swagger
 * /temperature/{id}:
 *  get:
 *    tags:
 *      - Temperature
 *    description: Returns the currently measured temperature data of the
 *                 sensor
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *          format: integer
 *        required: true
 *        description: The numeric ID of the sensor to read
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The currently read temperature data of the sensor
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                timestamp:
 *                  type: string
 *                  format: date-time
 *                millivolts:
 *                  type: number
 *                  format: float
 *                celsius:
 *                  type: number
 *                  format: float
 *                fahrenheit:
 *                  type: number
 *                  format: float
 */
function getTemperature(sensors) {
  return (req, res, next) => {
    const id = req.params['id'];
    if (id >= 0 && id < sensors.length)
      res.json(readTemperatureData(sensors[id].pins.signal));
    else
      next(new NotFoundError(`Temperature Sensor ID: ${id}`));
  }
}


function readTemperatureData(pinId) {

  const mV = readSensorOutput_mV(pinId);
  return {
    timestamp: (new Date()).toISOString(),
    millivolts: mV,
    celsius: mV_to_C(mV),
    fahrenheit: mV_to_F(mV)
  }

}

function readSensorOutput_mV(pinId) {
  return bs.analogRead(pinId) * 1800;
}

function mV_to_C(mv) {
  return mv / 10;
}

function mV_to_F(mv) {
  return (mV_to_C(mv) * 9 / 5) + 32;
}
