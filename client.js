/**
 Jquery code for responsive UI and 
 server communication via AJAX
 */

$(function main(){ //wait for the page to be fully loaded
	curr_led = "LED1"; //global variable pointing the currently selected LED
	last_led = "LED3"; //tells how many LEDs are there
	
	getGPIO(updateCurrentStatus); //update the GPIO status after loading the page
	timerHandler = setInterval(function(){
		getGPIO(swAction)//updates the GPIO status periodically	
	}, 200); //the update interval is set to every 200ms=0,2s
	
	$(".true_btn").click(btnHandling); //if element of class "true_btn" is clicked	
	$("#MSG").click(resumeApp); //if element of id "MSG" is clicked
});

function btnHandling(){
	/* Check which button was pressed and change button and LED state based on button state */
	var id, val ; //data to be sent to server
	
	if($(this).attr("class").indexOf("success") != -1){ //check whether button is pressed or not
		$(this).removeClass("btn-success").addClass("btn-danger").val($(this).attr("id") + ":OFF"); //changes label and color
		id = $(this).attr("id"); //get which button was clicked
		val = 0; //tell the server the button is clicked
	}
	
	else{ //if button was unclicked
		$(this).removeClass("btn-danger").addClass("btn-success").val($(this).attr("id") + ":ON"); //changes label and color
		id = $(this).attr("id"); //get which button was clicked
		val = 1; //tell the server the button is unclicked
	}
	
	changeLedState(id, val); //send data to the server to change LED state
}

function resumeApp(){ //if the message button was clicked
	if($(this).attr("class").indexOf("warning") != -1){ //if app is paused
		timerHandler = setInterval(function(){
			getGPIO(swAction) //restart the GPIO polling every 0,2s		
		}, 200);
		$("#MSG").attr("class","btn btn-block btn-info").val("Application running"); //changes label and color
	}
}

function changeLedState(led, new_state){
	/* Send request to the server to change LED state */
	var btn_status = {id:led, val:new_state}; //data to be sent to the server
	$.post("/gpio", btn_status, function (data, status){ //send data to the server via HTTP POST
		if(status == "success"){ //if server responds ok
			console.log(data);//print server response to the console
		}
	},"json"); //server response shuld be in JSON encoded format
}

function getGPIO(callback){
	/* Gets the current GPIO status*/
	$.post("/gpio", {id:'getGPIO'}, function (data, status){ //send data to the server via HTTP POST
		if(status == "success"){ //if server responds ok
			callback(data);
		}
	},"json"); //server response shuld be in JSON encoded format
}

function updateCurrentStatus(gpio_status){
	/* Updates the page GPIO status*/
	if(gpio_status.status == 'readgpio'){ //if all ok on the server-side
		for (next_pin in gpio_status.gpio){ //iterate through all GPIO
			if(next_pin.indexOf("SW") != -1){ //if it is a switch
				gpio_status.gpio[next_pin] = !gpio_status.gpio[next_pin]; //then inverts the logic, for 0 means pressed
			}
			if(gpio_status.gpio[next_pin]){ //if state is ON (or HIGH)
				$("#" + next_pin).attr("class","btn btn-block btn-success").val(next_pin + ":ON"); //changes label and color
			}
			else{ //if state is OFF (or LOW)
				$("#" + next_pin).attr("class","btn btn-block btn-danger").val(next_pin + ":OFF"); //changes label and color
			}
			if(next_pin == curr_led){ //set as active to tell that this is the selected LED
				$("#" + next_pin).addClass("active");
			}
		}
	}
}

function swAction(gpio_current){
	/* Handles the switches actions based on their state */
	var value, led_index ; //tmp variables
	if(gpio_current.status == 'readgpio'){ //if all ok on the server-side
		for (next_pin in gpio_current.gpio){ //iterate through all GPIO
			if(!gpio_current.gpio[next_pin]){ //if current GPIO was pressed
				switch(next_pin){ //for every switch there is an action
				case "SW1": //when pushbutton 1 is pressed
					if(curr_led == last_led){ //points to the first LED
						curr_led = "LED1";
					}
					else{ //otherwise points to the next LED
						led_index = parseInt(curr_led.replace("LED","")) + 1;//get the current LED index and increment its value
						curr_led = "LED" + led_index; //concatenate string to value, e.g. "LED2" 
					}
					break; //this should be removed if button priority is not desired
				case "SW2": //when pushbutton 2 is pressed
					changeLedState(curr_led, (1 - gpio_current.gpio[curr_led])); //invert currently selected LED state
					break;//this should be removed if button priority is not desired
				case "SW3": //when pushbutton 3 is pressed, or otherwise
					if(timerHandler){ //if it is polling the GPIO
						clearInterval(timerHandler) //then stop it
						timerHandler = false; //and set the timer handler value to FALSE
						$("#MSG").attr("class","btn btn-block btn-warning").val("Application paused! " +
								"Press this button to restart"); //tell the user the application is disabled
					}
					break;
				default: break; //this GPIO was not a switch
				}
			}
		}
	}
	updateCurrentStatus(gpio_current);
}








