#!/bin/bash


while true; do
	i="1"
	while [ $i -lt 9 ]; do
		curl -X POST -d '{"position":0.'$i'}' -H 'Content-Type: application/json; charset=utf-8' http://beaglebone.usb/bbb-playground/servo/0/position
		curl -X POST -d '{"position":0.'$i'}' -H 'Content-Type: application/json; charset=utf-8' http://beaglebone.usb/bbb-playground/servo/1/position
		sleep 1
		i=$[$i+1]
	done
done