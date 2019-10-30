"""mavic2pro_controller simpleactions."""
from controller import Robot, Motor, PositionSensor, Gyro, Camera, InertialUnit, GPS
import math
import threading
import time

# create the Robot instance.
robot = Robot()

# get the time step of the current world.
timestep = int(robot.getBasicTimeStep())

front_left_motor = robot.getMotor('front left propeller')
front_right_motor = robot.getMotor('front right propeller')
rear_left_motor = robot.getMotor('rear left propeller')
rear_right_motor = robot.getMotor('rear right propeller')
motors = [front_left_motor, front_right_motor, rear_left_motor, rear_right_motor]

gyro = robot.getGyro('gyro')
iu = robot.getInertialUnit('inertial unit')
gps = robot.getGPS('gps')

gyro.enable(timestep)
iu.enable(timestep)
gps.enable(timestep)

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

# takeoff function which sets the target altitude as well as start the main loop
def takeoff(target):
    global target_altitude
    target_altitude = target
    main = threading.Thread(target=drone_main)
    main.start()
    time.sleep(5)

def fly_forward(duration):
    global pitch_disturbance
    pitch_disturbance = 1.5
    time.sleep(duration)
    pitch_disturbance = 0

def fly_backward(duration):
    global pitch_disturbance
    pitch_disturbance = -1.5
    time.sleep(duration)
    pitch_disturbance = 0

# main loop, starts the drone and keeps it stable at target altitude, and reading the global variables for target directions
def drone_main():
    for motor in motors:
        motor.setPosition(float('inf'))

    while robot.step(timestep) != -1:
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

        front_left_motor.setVelocity(front_left_motor_input)
        front_right_motor.setVelocity(-front_right_motor_input)
        rear_left_motor.setVelocity(-rear_left_motor_input)
        rear_right_motor.setVelocity(rear_right_motor_input)

def CLAMP(value, low, high):
    if value < low:
        return low
    if value > high:
        return high
    return value
