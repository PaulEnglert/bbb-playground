import express from "express";
import bs from 'bonescript';
import { NotFoundError, BadRequestError } from '../errors';


/**
 * routerFactory() creates a new router object given
 * the specified servo(s). The `servos` argument is
 * expected to contain a single object, or a list of objects
 * denoting a hardware servo connection:
 * ```
 * // example entry of the servos argument:
 * {
 *   dutyCycle: {min: 0.01, max: 0.03},
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
  servos.forEach(({ pins, dutyCycle }) => {
    if (!pins || !pins.signal || pins.signal == '')
      throw new Error(`Servo configuration requires property 'pins.signal'!`);
    if (!dutyCycle || dutyCycle.min === undefined || dutyCycle.max === undefined)
      throw new Error(`Servo configuration requires property 'dutyCycle.min' and  'dutyCycle.max'!`);
  });

  const mgr = servoManager(servos);
  mgr.init(.5);

  // setup routes
  const router = express.Router();
  router.get('/', getServos(servos));
  router.get('/:id/position', getPosition(mgr));
  router.post('/:id/position', setPosition(mgr));

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
  const data = servos.map(({ pins, dutyCycle }, idx) => {
    return {
      id: idx,
      dutyCycle: dutyCycle,
      pins: pins
    }
  });
  return (req, res) => {
    return res.json(data);
  }
}

/**
 * getPosition() produces a request hander to return the position of
 * the servo.
 *
 * @swagger
 * /servo/{id}/position:
 *  get:
 *    tags:
 *      - Servo
 *    description: Returns the servos positional data
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *          format: integer
 *        required: true
 *        description: The numeric ID of the servo to read
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The current position (in range [0,1]) of the servo
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                timestamp:
 *                  type: string
 *                  format: date-time
 *                position:
 *                  type: number
 *                  format: double
 */
function getPosition(mgr) {
  return (req, res, next) => {
    const id = req.params['id'];
    if (mgr.exists(id))
      res.json(mgr.read(id));
    else
      next(new NotFoundError(`Servo ID: ${id}`));
  }
}

/**
 * setPosition() produces a request hander to update the position of
 * the servo.
 *
 * @swagger
 * /servo/{id}/position:
 *  post:
 *    tags:
 *      - Servo
 *    description: Update the servos position and returns the new data
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *          format: integer
 *        required: true
 *        description: The numeric ID of the servo to read
 *    requestBody:
 *      description: The new positional data (in range [0,1])
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              position:
 *                type: number
 *                format: double
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The current position (in range [0,1]) of the servo
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                timestamp:
 *                  type: string
 *                  format: date-time
 *                position:
 *                  type: number
 *                  format: double
 */
function setPosition(mgr) {
  return (req, res, next) => {
    const id = req.params['id'];
    const pos = req.body['position'];
    if (mgr.exists(id)){
      if (mgr.isWriting(id)) {
        next(new BadRequestError(`Servo with ID ${id} is busy`));
      } else {
        mgr.write(id, pos)
        res.json(mgr.read(id));
      }
    } else {
      next(new NotFoundError(`Servo ID: ${id}`));
    }
  }
}

/**
 * servoManager() creates a new stateful manager object that
 * can be used to init, write and read to/from the servos.
 *
 */
function servoManager(servos) {

  const cache = servos.map(_ => null);
  const writing = servos.map(_ => false);

  return {
    /**
     * init() writes an initial position to all servos
     * after having initialized the signal pins for writing.
     */
    init: function (pos = 0.5) {
      servos.forEach(({ pins }, idx) => {
        initServoPin(pins.signal);
        this.write(idx, pos);
      });
    },
    /**
     * exists() returns if the id corresponds to a configured servo.
     */
    exists: function (id) {
      return id >= 0 && id < servos.length;
    },
    /**
     * isWriting() returns true if the manager currently writes to the servo.
     */
    isWriting: function (id) {
      return writing[id] || false;
    },
    /**
     * write() updates the position of the servo.
     */
    write: function (id, pos) {
      if (writing[id])
        throw new Error(`Cannot concurrently write to servo: ${id}`);
      writing[id] = true;
      const {pins, dutyCycle} = servos[id];
      const dc = (((pos < 0 ? 0 : (pos > 1 ? 1 : pos))) * (dutyCycle.max - dutyCycle.min)) + dutyCycle.min;
      writeServoPosition_dc(pins.signal, dc);
      cache[id] = pos;
      writing[id] = false;
    },
    /**
     * read() returns the last set position of the servo.
     */
    read: function (id) {
      return {
        timestamp: (new Date()).toISOString(),
        position: cache[id]
      }
    }
  }
}

/**
 * writeServoPosition_dc() writes a dutycycle with a given frequency to the pin.
 *
 */
function writeServoPosition_dc(pinId, dc, freq = 60) {
  bs.analogWrite(pinId, dc, freq);
}

/**
 * initServoPin() modifies the pin configuration to be ready for writing.
 *
 */
function initServoPin(pinId) {
  bs.pinMode(pinId, bs.OUTPUT);
}
