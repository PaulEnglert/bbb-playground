
/**
 * The temperature sensors attached to the beaglebone black.
 *
 *
 */
export const temperatureSensors = [
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
export const servos = [
  {
    dutyCycle: {
      min: 0.043,
      max: 0.136
    },
    pins: {
      signal: 'P9_14',
      power: 'P9_5',
      ground: 'P9_1'
    }
  }
];