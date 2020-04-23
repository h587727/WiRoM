# Multi-robot-mission-planner

## Pre-requirements
To use the system as-is, one needs to download and install the robot simulaton tool Webots. Webots is a powerful and open-source robot simulation tool that provides a big robot repository and possibilty for having multi-robot setups and create controllers for different robots, as well as streaming to a web platform.

Go to Cyberbotics website to find instructions on how to download and install Webots: https://cyberbotics.com/

One could use another simulation if desired, but then one would need to program the controllers and add simpleactions for that simulation tool, in order for it to work.

## How to run the system from the GitHub repository
Clone the repository to your local machine using the command: 
```
git clone https://github.com/joakimgrutle/Multi-robot-mission-planner.git
```

This system is a web application, and uses a server-client setup for communicating between the browser and the simulation.
This means we need to run the server and the client in order to run the system.


### Running the client
First you start by running the web-client.
Open a new terminal and navigate into the repository folder, then the robot-mission-planner folder, then the src folder: 
```
cd Multi-robot-mission-planner/robot-mission-planner/src
```
Then run the following command: 
```
npm start
```
The client is now running at localhost:3000 (a new window should open automatically in you browser)

### Running the server
After the client is started, you can start the server.
Open another new terminal window and navigate into the repository folder, then the scouting missions folder, then the controllers folder:
```
cd Multi-robot-mission-planner/scouting-mission/controllers
```
Then run the following command: 
```
flask run
```
This should start the server of the system and it should say it is running on the local ip at port 5000

### Running Webots
The third thing we have to do is start Webots, either normally or in streaming mode (streaming has to be run via terminal).
Opening normally is simply opening the program using the executable file (link to webots docs below). 
However it is strongly recommended to open in streaming mode, such that the simulation can be viewed directly from the browser, which gives the best experience of the system.

To open in streaming mode on Mac, open a new terminal and navigate to the installation folder, which typically is Applications/Webots.app and run it using the command :
```
./webots --stream
```
This should open a new Webots instance, and it might ask for permission to access the web.

To open in streaming mode on Windows, also navigate to the bin folder in the installation folder, typically C:\Program Files\Webots\msys64\mingw64\bin and run the program from command line using the *--stream* argument

For the official documentation on how to start Webots normally and in streaming mode for Windows, Mac and Linux go to: https://cyberbotics.com/doc/guide/starting-webots

After Webots is running, simply click File -> Open world and navigate to Multi-robot-mission-planner/scouting-mission/worlds and select the the file called 
```
scouting-mission.wbt
```

When you have completed all the steps, the system is ready to be used.

### System instructions
Instructions for testing the system will be added as a pdf format.
