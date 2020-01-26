
/**
 * The temperature sensors attached to the beaglebone black.
 *
 *
 */
const temperatureSensors = [
  {
    pins: {
      signal: 'P9_40',
      power: 'P9_6',
      ground: 'P9_34'
    }
}
];

/**
 * The servo motors attached to the beaglebone black.
 *
 *
 */
const servos = [
  {
    dutyCycle: {
      min: 0.046, // 0.043
      max: 0.134  // 0.136
    },
    pins: {
      signal: 'P9_14',
      power: 'P9_5',
      ground: 'P9_1'
    }
  },
  {
    dutyCycle: {
      min: 0.046, // 0.043
      max: 0.134  // 0.136
    },
    pins: {
      signal: 'P8_19',
      power: 'P9_8',
      ground: 'P8_1'
    }
  }
];

module.exports = {temperatureSensors, servos};