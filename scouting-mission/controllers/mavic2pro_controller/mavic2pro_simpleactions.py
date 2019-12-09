"""mavic2pro_controller simpleactions."""
from controller import Robot, Motor, PositionSensor, Gyro, Camera, InertialUnit, GPS, Compass, CameraRecognitionObject
from flask import Flask, request
import requests 
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

# get the motors for the robot
front_left_motor = robot.getMotor('front left propeller')
front_right_motor = robot.getMotor('front right propeller')
rear_left_motor = robot.getMotor('rear left propeller')
rear_right_motor = robot.getMotor('rear right propeller')
motors = [front_left_motor, front_right_motor, rear_left_motor, rear_right_motor]

# get and enable nodes used by the robot
gyro = robot.getGyro('gyro')
iu = robot.getInertialUnit('inertial unit')
gps = robot.getGPS('gps')
compass = robot.getCompass('compass')
camera = robot.getCamera('camera')

gyro.enable(timestep)
iu.enable(timestep)
gps.enable(timestep)
compass.enable(timestep)
camera.enable(timestep)

# empirically found constants for the drone to perform stable flight; inspired by the drone demo controller 
k_vertical_thrust = 68.5  # with this thrust, the drone lifts.
k_vertical_offset = 0.6   # Vertical offset where the robot actually targets to stabilize itself.
k_vertical_p = 3.0        # P constant of the vertical PID.
k_roll_p = 50.0           # P constant of the roll PID.
k_pitch_p = 30.0          # P constant of the pitch PID.

# variables that control the movement of the drone
target_altitude = 0
roll_disturbance = 0
pitch_disturbance = 0
yaw_disturbance = 0

# variables to set drone functions
rec_obj_pos = []
recognise = False
navigate = False
target_reached = False
message_recipient = ''
target_location = []
simpleactions = []

# Initialize which sets the target altitude as well as start the main loop
def init(port):
    main = threading.Thread(target=mavic2pro_main)
    execute = threading.Thread(target=execute_simpleactions)
    main.start()
    execute.start()
    app.run(port=port)


def set_altitude(target):
    global target_altitude
    target_altitude = target
    time.sleep(5)

def go_forward(duration):
    global pitch_disturbance
    global yaw_disturbance
    pitch_disturbance = 3
    yaw_disturbance = 0
    if duration is not 0:
        time.sleep(duration)
        pitch_disturbance = 0

def go_backward(duration):
    global pitch_disturbance
    pitch_disturbance = -2
    if duration is not 0:
        time.sleep(duration)
        pitch_disturbance = 0

def turn_right(duration):
    global yaw_disturbance
    yaw_disturbance = 0.5
    if duration is not 0:
        time.sleep(duration)
        yaw_disturbance = 0

def turn_left(duration):
    global yaw_disturbance
    yaw_disturbance = -0.5
    if duration is not 0:
        time.sleep(duration)
        yaw_disturbance = 0

def recognise_objects():
    global recognise
    recognise = True
    camera.recognitionEnable(timestep)

def go_to_location(target):
    global location
    global navigate
    location = target
    navigate = True
    while navigate:
        time.sleep(1)

def set_message_target(target):
    global message_recipient
    message_recipient = target

def stop_movement():
    global pitch_disturbance
    global yaw_disturbance
    pitch_disturbance = 0
    yaw_disturbance = 0

# Utilize a global JSON file as a simple way of sending information between robots
def send_location():
    global recognise
    global navigate
    send = threading.Thread(target=async_send_location)
    send.start()
    #recognise = True
    #navigate = True

def async_send_location():
    location_json =  {"location": [rec_obj_pos[0], rec_obj_pos[2]]}
    requests.post("http://localhost:5002/location", json = location_json)

# Function that finds the angle and distance to a location and moves the vehicle accordingly
def navigate_to_location():
    global navigate
    global location

    pos = gps.getValues()
    north = compass.getValues()
    front = [-north[0], north[1], north[2]]
    dir = [location[0] - pos[0], location[1] - pos[2]]
    distance = math.sqrt(dir[0] * dir[0] + dir[1] * dir[1])

    # calculate the angle of which the vehicle is supposed to go to reach target
    angle = math.atan2(dir[1], dir[0]) - math.atan2(front[2], front[0])
    if angle < 0:
        angle += 2 * math.pi

    # vehicle is on the right path when angle ≈ math.pi 
    if angle < math.pi - 0.01:
        turn_left(0)
    elif angle > math.pi + 0.01:
        turn_right(0)
    else:
        go_forward(0)
        
    # stop navigation and vehicle movements when target has been reached 
    if distance < 1:
        print('Reached target')
        navigate = False
        location = []
        stop_movement()

def CLAMP(value, low, high):
    if value < low:
        return low
    if value > high:
        return high
    return value

def stabilize_and_control_movement():
    roll = iu.getRollPitchYaw()[0] + math.pi/ 2.0
    pitch = iu.getRollPitchYaw()[1]
    roll_acceleration = gyro.getValues()[0] 
    pitch_acceleration = gyro.getValues()[1]
    altitude = gps.getValues()[1]

    # Compute the roll, pitch, yaw and vertical inputs.
    roll_input = k_roll_p * CLAMP(roll, -1.0, 1.0) + roll_acceleration + roll_disturbance
    pitch_input = k_pitch_p * CLAMP(pitch, -1.0, 1.0) - pitch_acceleration + pitch_disturbance
    yaw_input = yaw_disturbance
    clamped_difference_altitude = CLAMP(target_altitude - altitude + k_vertical_offset, -1.0, 1.0)
    vertical_input = k_vertical_p * pow(clamped_difference_altitude, 3.0)

    # Actuate the motors taking into consideration all the computed inputs.
    front_left_motor_input = k_vertical_thrust + vertical_input - roll_input - pitch_input + yaw_input
    front_right_motor_input = k_vertical_thrust + vertical_input + roll_input - pitch_input - yaw_input
    rear_left_motor_input = k_vertical_thrust + vertical_input - roll_input + pitch_input - yaw_input
    rear_right_motor_input = k_vertical_thrust + vertical_input + roll_input + pitch_input + yaw_input

    # Set the motor velocities required for stabilization and movement
    front_left_motor.setVelocity(front_left_motor_input)
    front_right_motor.setVelocity(-front_right_motor_input)
    rear_left_motor.setVelocity(-rear_left_motor_input)
    rear_right_motor.setVelocity(rear_right_motor_input)


# main loop, starting and controlling the robot based on the global variables
def mavic2pro_main():
    global recognise
    global navigate
    global rec_obj_pos

    for motor in motors:
        motor.setPosition(float('inf'))

    while robot.step(timestep) != -1:
        if navigate:
            navigate_to_location()
        
        stabilize_and_control_movement()
        if recognise and camera.getRecognitionObjects():
            for rec_obj in camera.getRecognitionObjects():
                rec_obj_pos = [gps.getValues()[0] - rec_obj.get_position()[0], gps.getValues()[1] - rec_obj.get_position()[1], gps.getValues()[2] - rec_obj.get_position()[2]]
                recognise = False
                navigate = False
                stop_movement()

@app.route('/simpleactions', methods = ['POST'])
def receive_simpleactions():
    global simpleactions
    simpleactions = request.get_json()
    return "Updated simple actions", 200

def execute_simpleactions():
    global simpleactions
    while robot.step(timestep) != -1:
        if simpleactions:
            action = simpleactions.pop(0)
            print(action)
            eval(action)
