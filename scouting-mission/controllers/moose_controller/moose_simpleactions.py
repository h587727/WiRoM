"""moose_controller simpleactions."""

from controller import Robot, Motor, PositionSensor
import math
import threading
import time

# create the Robot instance.
robot = Robot()

# get the time step of the current world.
timestep = int(robot.getBasicTimeStep())

names = ["left motor 1",  "left motor 2",  "left motor 3",  "left motor 4", "right motor 1", "right motor 2", "right motor 3", "right motor 4"]
motors = []
speed = 0

for name in names:
    motors.append(robot.getMotor(name))

def init_moose():
    main = threading.Thread(target=moose_main)
    main.start()

def drive_forward(duration):
    global speed
    speed = 4.0
    time.sleep(duration)
    speed = 0

def drive_backward(duration):
    global speed
    speed = -4.0
    time.sleep(duration)
    speed = 0

def moose_main():
    for motor in motors:
        motor.setPosition(float('inf'))
    while robot.step(timestep) != -1:
        for motor in motors:
            motor.setVelocity(speed)


# Enter here exit cleanup code.