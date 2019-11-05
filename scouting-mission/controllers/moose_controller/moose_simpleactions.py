"""moose_controller simpleactions."""

from controller import Robot, Motor, PositionSensor, GPS, Compass
import math
import threading
import time

# create the Robot instance.
robot = Robot()

# get the time step of the current world.
timestep = int(robot.getBasicTimeStep())

left_motor_names = ["left motor 1",  "left motor 2",  "left motor 3",  "left motor 4"] 
right_motor_names = ["right motor 1", "right motor 2", "right motor 3", "right motor 4"]
left_motors = []
right_motors = []
left_speed = 0
right_speed = 0 

for name in left_motor_names:
    left_motors.append(robot.getMotor(name))
for name in right_motor_names:
    right_motors.append(robot.getMotor(name))

gps = robot.getGPS('gps')
compass = robot.getCompass('compass')
gps.enable(timestep)
compass.enable(timestep)

def init_moose():
    main = threading.Thread(target=moose_main)
    main.start()

def norm(dir): 
    dir_norm = []
    for d in dir: 
        dir_norm.append(d / abs(d))
    return dir_norm

def go_to_location():
    global left_speed
    global right_speed

    pos = gps.getValues()
    north = compass.getValues()
    front = [-north[0], north[1], north[2]]

    dir = [400 - pos[0], -450 - pos[2]]
    distance = math.sqrt(dir[0] * dir[0] + dir[1] * dir[1])
    #print(pos)
    #print(north)
    #print(front)
    #print(dir)
    #print(distance)
    dir_norm = norm(dir)
    #print(dir_norm)
    angle = math.atan2(dir_norm[1], dir_norm[0]) - math.atan2(front[2], front[0])
    #print(angle)
    if angle < 0:
        angle += 2 * math.pi

    beta = angle - math.pi
    #print(beta)
    left_speed = 7.0 - math.pi + 4.0 * beta
    right_speed = 7.0 - math.pi - 4.0 * beta

def drive_forward(duration):
    global left_speed
    global right_speed
    left_speed = 7.0
    right_speed = 7.0
    time.sleep(duration)
    left_speed = 0
    right_speed = 0

def drive_backward(duration):
    global left_speed
    global right_speed
    left_speed = -2.0
    right_speed = -2.0
    time.sleep(duration)
    left_speed = 0
    right_speed = 0


def turn_left(duration):
    global left_speed
    global right_speed
    left_speed = -2.0
    right_speed = 2.0
    time.sleep(duration)
    left_speed = 0
    right_speed = 0

def turn_right(duration):
    global left_speed
    global right_speed
    left_speed = 2.0
    right_speed = -2.0
    time.sleep(duration)
    left_speed = 0
    right_speed = 0

def moose_main():
    for motor in left_motors:
        motor.setPosition(float('inf'))
    for motor in right_motors:
        motor.setPosition(float('inf'))

    while robot.step(timestep) != -1:
        go_to_location()
        for motor in left_motors:
            motor.setVelocity(left_speed)
        for motor in right_motors:
            motor.setVelocity(right_speed)


# Enter here exit cleanup code.