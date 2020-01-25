# Temperature API

The temperature API uses a temperature sensor on the beaglebone to read
and output the current temperature.

### Hardware Setup

The following image depicts the pin layout on the temperature sensor
when layed with the flat surface down having the pins facing the reader:

```
      *******
    **       **
  **           **
 *    A  B  C    *
 -----------------
```

* Pin A: Ground => GNDA_ADC (e.g. P9 34)
* Pin B: Signal => AIN1 (e.g. P9 40)
* Pin C: Power => VDD_5V (e.g. P9 5)

### Software Setup

```
const b = require('bonescript');
const temperatureSensor = 'P9_40';

function readTemperature() {
    const timestamp = new Date();
    const analogOutput = b.analogRead(temperatureSensor);
    const millivolts = analogOutput * 1800; 
    const celsius = millivolts / 10;
    const fahrenheit = (celsius * 9 / 5) + 32;
    console.log(`${timestamp} => Millivolts: ${millivolts}mV, Celsius: ${celsius} °C, Fahrenheit: ${fahrenheit} °F`);
}
```