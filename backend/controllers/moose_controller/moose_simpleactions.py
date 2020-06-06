"""moose_controller simpleactions."""
from controller import Robot, Motor, PositionSensor, GPS, Compass
from flask import Flask, request
import math
import threading
import time
import json

# create flask instance
app = Flask(__name__)

# create the Robot instance.
robot = Robot()

# get the time step of the current world.
timestep = int(robot.getBasicTimeStep())

left_motor_names = ["left motor 1",  "left motor 2",
                    "left motor 3",  "left motor 4"]
right_motor_names = ["right motor 1",
                     "right motor 2", "right motor 3", "right motor 4"]
left_motors = [robot.getMotor(name) for name in left_motor_names]
right_motors = [robot.getMotor(name) for name in right_motor_names]
left_speed = 0
right_speed = 0

# get and enable nodes used by the robot
gps = robot.getGPS('gps')
compass = robot.getCompass('compass')
gps.enable(timestep)
compass.enable(timestep)

target_reached = False
navigate = False
location = []
simpleactions = []

# Initialize which sets the target altitude as well as start the main loop
def init(port):
    main = threading.Thread(target=moose_main)
    execute = threading.Thread(target=execute_simpleactions)
    main.start()
    execute.start()
    app.run(port=port)


def go_forward(duration):
    global left_speed
    global right_speed
    left_speed = 7.0
    right_speed = 7.0
    if duration is not 0:
        time.sleep(duration)
        left_speed = 0
        right_speed = 0


def go_backward(duration):
    global left_speed
    global right_speed
    left_speed = -2.0
    right_speed = -2.0
    if duration is not 0:
        time.sleep(duration)
        left_speed = 0
        right_speed = 0


def turn_left(duration):
    global left_speed
    global right_speed
    left_speed = 1.0
    right_speed = 4.0
    if duration is not 0:
        time.sleep(duration)
        left_speed = 0
        right_speed = 0


def turn_right(duration):
    global left_speed
    global right_speed
    left_speed = 4.0
    right_speed = 1.0
    if duration is not 0:
        time.sleep(duration)
        left_speed = 0
        right_speed = 0


def go_to_location(target):
    global location
    global navigate
    if not location and target:
        location = [target]

    navigate = True
    while navigate:
        time.sleep(1)


def stop_movement():
    global left_speed
    global right_speed
    left_speed = 0
    right_speed = 0

# Function that finds the angle and distance to a location and moves the vehicle accordingly
def navigate_to_location():
    global navigate
    global location
    loc = location[0]

    pos = gps.getValues()
    north = compass.getValues()
    front = [-north[0], north[1], north[2]]

    dir = [loc[0] - pos[0], loc[1] - pos[2]]
    distance = math.sqrt(dir[0] * dir[0] + dir[1] * dir[1])

    # calculate the angle of which the vehicle is supposed to go to reach target
    angle = math.atan2(dir[1], dir[0]) - math.atan2(front[2], front[0])
    if angle < 0:
        angle += 2 * math.pi

    # vehicle is on the right path when angle = math.pi
    if angle < math.pi - 0.01:
        turn_left(0)
    elif angle > math.pi + 0.01:
        turn_right(0)
    else:
        go_forward(0)

    # stop vehicle and navigation when target has been reached
    if distance < 1:
        print('Reached target')
        navigate = False
        location.pop(0)
        stop_movement()

#Actively wait for new location
def receive_location_from_robot():
    while not location:
        time.sleep(1)

# write the location of this robot to the config file
def setLocationConfig():
    with open('../config.json') as json_data_file:
        data = json.load(json_data_file)

    with open('../config.json', 'w') as json_data_file:
        data['robots']['moose']['location'] = {
            "x": gps.getValues()[0], "y": gps.getValues()[2]}
        json.dump(data, json_data_file, indent=2, sort_keys=True)


def moose_main():
    for motor in left_motors:
        motor.setPosition(float('inf'))
    for motor in right_motors:
        motor.setPosition(float('inf'))

    while robot.step(timestep) != -1:
        if navigate:
            navigate_to_location()
        for motor in left_motors:
            motor.setVelocity(left_speed)
        for motor in right_motors:
            motor.setVelocity(right_speed)

# Function for receiving messages from other robots
@app.route('/location', methods=['POST'])
def receive_location():
    global location
    msg = request.get_json()
    location.append(msg['location'])
    return "Received location", 200


# Function for receiving simpleactions from server
@app.route('/simpleactions', methods=['POST'])
def receive_simpleactions():
    global simpleactions
    simpleactions = request.get_json()
    return "Updated simple actions", 200


# Function for executing simpleactions in the queue
def execute_simpleactions():
    global simpleactions
    while robot.step(timestep) != -1:
        if simpleactions:
            simpleaction = simpleactions.pop(0)
            print('Executing simpleaction: ' + simpleaction)
            eval(simpleaction)
