"""e-puck_simpleactions controller."""

# You may need to import some classes of the controller module. Ex:
#  from controller import Robot, Motor, DistanceSensor
from controller import Robot, Motor


# You should insert a getDevice-like function in order to get the
# instance of a device of the robot. Something like:
#  motor = robot.getMotor('motorname')
#  ds = robot.getDistanceSensor('dsname')
#  ds.enable(timestep)
robot = Robot()

# get the time step of the current world.
timestep = int(robot.getBasicTimeStep())

def go_forward():
    left_motor = robot.getMotor('left wheel motor')
    right_motor = robot.getMotor('right wheel motor')

    left_motor.setPosition(float('inf'))
    right_motor.setPosition(float('inf'))

    left_motor.setVelocity(6.28)
    right_motor.setVelocity(6.28)
# Main loop:
# - perform simulation steps until Webots is stopping the controller
    while robot.step(timestep) != -1:
    # Read the sensors:
    # Enter here functions to read sensor data, like:
    #  val = ds.getValue()

    # Process sensor data here.

    # Enter here functions to send actuator commands, like:
    #  motor.setPosition(10.0)
        pass

# Enter here exit cleanup code.
