import express from 'express';
import bs from 'bonescript';


const router = express.Router();
export default router;
router.get('/', getTemperature('P9_40'));


/**
 * getTemperature() produces a request hander for the temperature
 * get api route.
 *
 * @swagger
 * /temperature:
 *  get:
 *    tags:
 *      - Temperature
 *    description: Returns the currently measured temperature data
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The currently read temperature data
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
function getTemperature(pinId) {
  return (req, res) => {
    res.json(readTemperatureData(pinId));
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
