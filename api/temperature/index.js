import express from 'express';
import bs from 'bonescript';


const router = express.Router();


const SENSOR_PIN = 'P9_40'
router.get('/', (req, res) => res.json({
	version: '0.0.0',
	api: 'temperature',
	data: getTemperatureData(SENSOR_PIN)
}));


function getTemperatureData(pinId) {

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


export default router;
