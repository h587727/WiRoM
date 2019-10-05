"""e-puck_simpleactions controller."""
from controller import Robot, Motor, PositionSensor
import math

robot = Robot()
timestep = int(robot.getBasicTimeStep())

def go_forward(target):
    effective = init_motors_sensors(6.28)
    target = effective + target

    while effective < target:
        if robot.step(timestep) == -1:
            break
        effective = (left_sensor.getValue() + right_sensor.getValue()) / 2

    stop_motors_sensors()

def go_backward(target):
    effective = init_motors_sensors(-6.28)
    target = effective - target

    while effective > target:
        if robot.step(timestep) == -1:
            break
        effective = (left_sensor.getValue() + right_sensor.getValue()) / 2

    stop_motors_sensors()
    # Enter here exit cleanup code.

def init_motors_sensors(velocity):
    global left_motor 
    global right_motor
    global left_sensor
    global right_sensor

    left_motor = robot.getMotor('left wheel motor')
    right_motor = robot.getMotor('right wheel motor')
    left_sensor = robot.getPositionSensor('left wheel sensor')
    right_sensor = robot.getPositionSensor('right wheel sensor')

    left_motor.setPosition(float('inf'))
    right_motor.setPosition(float('inf'))
    left_motor.setVelocity(velocity)
    right_motor.setVelocity(velocity)
    left_sensor.enable(timestep)
    right_sensor.enable(timestep)

    effective = (left_sensor.getValue() + right_sensor.getValue()) / 2
    if math.isnan(effective):
        effective = 0

    return effective

def stop_motors_sensors():
    left_motor.setVelocity(0)
    right_motor.setVelocity(0)
    left_sensor.disable()
    right_sensor.disable()
