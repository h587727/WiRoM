from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import time

app = Flask(__name__)
CORS(app)


with open('config.json') as json_data_file:
    data = json.load(json_data_file)
    robots = data["robots"]


@app.route('/mission', methods=['POST'])
def receive_mission():
    mission = request.get_json()
    for robot in mission:
        sequence = []
        for simpleaction in mission[robot]['simpleactions']:
            if simpleaction['args'] is "":
                sequence.append(simpleaction['name'] + "()")
            else:
                if simpleaction['name'] == 'set_message_target':
                    sequence.append(
                        simpleaction['name'] + "(" + "'"+ simpleaction['args'] + "'" + ")")
                else : 
                    sequence.append(
                        simpleaction['name'] + "(" + simpleaction['args'] + ")")

        success = False
        retries = 0
        while not success or retries is 60:
            try:
                requests.post('http://localhost:' + mission[robot]['port'] + '/simpleactions', json=sequence)
                success = True
            except Exception as e:
                print(e)
                retries += 1
                print('Retry: ' + str(retries) + '...')
                time.sleep(1)

    return 'Controllers successfully created', 200


@app.route('/allocate', methods=['POST'])
def receive_tasks_for_allocation():
    tasks = request.get_json()
    tasks = task_allocation(tasks, robots)
    return jsonify(tasks)

# automatic task allocation algorithm, auction-based solution
# allocates tasks to robots based on highest bid
def task_allocation(tasks, robots):
    bids = {}
    for task in tasks:
        bids[task["name"]] = {}
        for robot in robots:
            bids[task["name"]][robot] = {}
            bid = 1
            for simpleaction in task["simpleactions"]:
                robot_simpleaction = list(filter(
                    lambda robot_simpleaction: robot_simpleaction["name"] == simpleaction["name"], robots[robot]["simpleactions"]))
                if robot_simpleaction != []:
                    robot_simpleaction[0].update({"args": simpleaction["args"]})
                    robot_simpleaction[0].update({"location": robots[robot]["location"]})

                    utility = calculate_utility(robot_simpleaction[0])
                    bid = bid*utility
                else:
                    bid = 0
            bids[task["name"]][robot] = bid

    tasks = allocate_tasks_to_highest_bidder(tasks, bids)
    return tasks

# Calculate the utility a robot has for a simpleaction (quality - cost)
def calculate_utility(robot_simpleaction):
    utility = robot_simpleaction["quality"] - robot_simpleaction["cost"]
    # calculate cross dependencies: go to location only such simpleaction for now
    if robot_simpleaction["name"] == "go_to_location" and robot_simpleaction["args"] != "[]":
        robot_loc = robot_simpleaction["location"]
        targetlist = robot_simpleaction["args"].strip('][').split(', ')
        target = {"x": int(targetlist[0]), "y": int(targetlist[1])}
        distance = abs(robot_loc["x"] - target["x"] +
                       robot_loc["y"] - target["y"])
        # find distance from target location and normalize before adding to utility
        distNorm = (1 - distance/100)
        if distNorm > 0.1:
            utility = utility * distNorm
        else:
            utility = utility * 0.1

    return utility

# Sorting bids and allocates tasks to robots based on highest bid
def allocate_tasks_to_highest_bidder(tasks, bids):
    for bid in bids:
        highest_bidder = '--'
        for robot in bids[bid]:
            if highest_bidder == '--' and bids[bid][robot] > 0:
                highest_bidder = robot
            elif highest_bidder != '--' and bids[bid][robot] > bids[bid][highest_bidder]:
                highest_bidder = robot

        for task in tasks:
            if task["name"] == bid:
                task["robot"] = highest_bidder

    return tasks


@app.route('/ping')
def ping():
    return 'Pong!'


if __name__ == '__main__':
    app.run(processes='5')
