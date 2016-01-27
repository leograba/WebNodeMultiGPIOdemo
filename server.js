/**
 Node.js webserver. Handles communication to the client
 and GPIO configuration and access.
 
 This app is a demo example of how to use Node.js to access remotely
 the module Colibri VF61 and use its GPIO.
 */

/* Modules */
var fs = require('fs'); //module to handle the file system
var express = require('express'); //webserver module
var bodyParser = require('body-parser');
var app = express();
var debug = require('debug')('myserver'); //debug module. For info refer to https://www.npmjs.com/package/debug

/* VF61 GPIO pins */
/*const	LED1 = '47', // PTC2, 101(SODIMM), 16(IRIS)
		LED2 = '50', // PTC5, 97(SODIMM), 17(IRIS)
		LED3 = '53', // PTC8, 85(SODIMM), 18(IRIS)
		SW1 = '46', // PTC1, 98(SODIMM), 13(IRIS)
		SW2 = '88', // PTC9, 133(SODIMM), 14(IRIS)
		SW3 = '48'; // PTC3, 103(SODIMM), 15(IRIS)*/
const GPIO = {	LED1:'47',	LED2:'50',	LED3:'53',
				SW1:'46',	SW2:'88',	SW3:'48'};

/* Constants */
const HIGH = 1, LOW = 0, IP_ADDR = '192.168.0.180', PORT_ADDR = 3000;
	
//starting app
debug('Starting VF61 webserver and GPIO control'); //hello message

//Using Express to create a server
app.use(express.static(__dirname)); //add the directory where HTML and CSS files are
var server = app.listen(PORT_ADDR, IP_ADDR, function () {//listen at the port and address defined
    var host = server.address().address;
    var port = server.address().port;
    var family = server.address().family;
    debug('Express server listening at http://%s:%s %s', host, port, family);
});

app.use(bodyParser.urlencoded({ //to support URL-encoded bodies, must come before routing
	extended: true
}));

app.route('/gpio') //used to unite all the requst types for the same route
.post(function (req, res) { //handles incoming POST requests
    var serverResponse = {};
    serverResponse['gpio'] = {};
    var btn = req.body.id, val = req.body.val; // get the button id and value
    if(btn == "getGPIO"){ //if client requests GPIO status
    	serverResponse['status'] = 'readgpio';
    	for(io in GPIO){ //iterate through all GPIO
    		serverResponse.gpio[io] = +rdGPIO(GPIO[io]); //and get its current status as a string
    	}
    }
    else{ //otherwise change GPIO status
    	serverResponse.status = 'changegpio'; //echo which button was pressed
        if(val == 1){ //if button is clicked, turn on the leds
        	serverResponse.gpio[btn] = HIGH;
        	wrGPIO(GPIO[btn], HIGH);
        }
        else{ //if button is unclicked, turn off the leds
        	serverResponse.gpio[btn] = LOW;
        	wrGPIO(GPIO[btn], LOW);
        }
    }
    res.send(serverResponse); //echo the changes made to GPIO
});

setImmediate(function cfgOurPins(){
	for(io in GPIO){ //for every GPIO pin
		if(io.indexOf('LED') != -1){ //if it is a LED
			cfGPIO(GPIO[io], 'out'); //configure it as output
		}
		else if(io.indexOf('SW') != -1){ //make sure it is a switch
			cfGPIO(GPIO[io], 'in'); //configure it as input
		}
	}
});

function cfGPIO(pin, direction){
/*---------- export pin if not exported and configure the pin direction -----------*/
        fs.access('/sys/class/gpio/gpio' + pin, fs.F_OK, function(err){//
                if(err){ //if GPIO isn't exported, do it
                        debug('exporting GPIO' + pin);
                        fs.writeFileSync('/sys/class/gpio/export', pin);//export pin
                }
                debug('configuring GPIO' + pin + ' as ' + direction);
                fs.writeFileSync('/sys/class/gpio/gpio' + pin + '/direction', direction);
        });
}

function rdGPIO(pin){
/*---------- read GPIO value and return it -----------*/
	var value = fs.readFileSync('/sys/class/gpio/gpio' + pin + '/value');
	debug('reading ' + value + ' from ' + pin);
	return value;
}

function wrGPIO(pin, value){
/*---------- write value to corresponding GPIO -----------*/
	debug('writing ' + value + ' to pin ' + pin);
	fs.writeFileSync('/sys/class/gpio/gpio' + pin + '/value', value);
}

function copySwToLed(){
/********* Copy the sw values into the LEDs  *********/
        var state_now; //temporary sw value

        state_now = 1 - rdGPIO(SW1); //read pushbutton 1 and invert its value...
        wrGPIO(LED1,state_now); //...then copy its value to LED 1
        state_now = 1 - rdGPIO(SW2); //read pushbutton 2 and invert its value...
        wrGPIO(LED2,state_now); //...then copy its value to LED 2
        state_now = 1 - rdGPIO(SW3); //read pushbutton 3 and invert its value...
        wrGPIO(LED3,state_now); //...then copy its value to LED 3
}