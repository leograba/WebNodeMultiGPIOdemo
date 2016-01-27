# WebNodeGPIOdemo
Demo application to control the Toradex VF61 GPIO via a friendly web UI using Node.js

## Description
This application uses the Toradex Colibri VF61 + Iris Carrier Board to read 3 switches by polling their GPIO, showing their state on the web UI and taking action based on their state. Also 3 LEDs can be controlled by the web UI or by the swithces.The GPIO handling is done by accessing the file system (/sys/class/gpio).

The server-side application is built using Node.js to access the board GPIOs, via filesystem operations, and the Express framework to run a webserver which handles incoming POST requests by the client-side application, changing GPIO states and answering to the client as needed.

The client-side application uses the Bootstrap framework, providing a quick example on how to build a simple yet welcoming user-interface. Regarding the functionality, Javascript jQuery, along with AJAX, is used to create a responsive experience.

This demo is part of an article on how to access/control the GPIO via web with a friendly UI (Demo 3), so the following repositories are previoues versions of the current application:

[Demo 1 - Control GPIO using Node.js](https://github.com/leograba/NodeGPIOdemo.git)

[Demo 2 - Control one GPIO via web using Node.js](https://github.com/leograba/WebNodeGPIOdemo.git)

# Dependencies
To run this application some node modules need to be installed:

  [Express framework](http://expressjs.com/):
    npm install express # install the Express framework to build a webserver
    
  [Body-parser](https://github.com/expressjs/body-parser) middleware for Express:
    npm install body-parser # install this Node.js middleware to parse JSON body for the Express framework
    
## How to run this app
After installing the dependencies you can run the application using Node. Then just access http://192.168.0.180:3000/ (default values - modify the server code for other values) to get to the menu.

To run it you need just to:

	node server.js

To display log messages:

	DEBUG=myserver node server.js

## Helpful modules
To help the development of node applications, there are some modules that can be useful
  
  [Nodemon](http://nodemon.io/):
    npm install -g nodemon # restart the app whenever a file within the project changes
    
  [Debug](https://www.npmjs.com/package/debug) (already installed with Express):
    npm install debug # anyway if you need it for other projects
