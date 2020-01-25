# Servo API

The servo API controls a servo on the beaglebone.

### Hardware Setup

The servo has three colored cables:

* Brown: Ground => DGND (e.g. P9 1)
* Rot: Power => VDD_5V (e.g. P9 6)
* Orange: Signal => EHRPWM1A (e.g. P9 14)

### Software Setup

```
const b = require('bonescript');
const SERVO = 'P9_14';

// range: 0 to 0.1
const duty_min = 0.043;
const duty_max = 0.136;
let position = 0; // from 0 to 6

function cycle(){
    setTimeout(function(){
        updatePosition(position); 
        console.log("New position: "+position);
        position++;
        if (position > 6)
            position = 0; 
        cycle();
    },1000);
}

function updatePosition(pos){
    
    var duty_cycle = (pos/60)+duty_min;
    if (duty_cycle > duty_max){
        duty_cycle = duty_max;
    } else if (duty_cycle < duty_min){
        duty_cycle = duty_min;
    }
    b.analogWrite(SERVO, duty_cycle, 60);
    
}

b.pinMode(SERVO, b.OUTPUT);
cycle();
```