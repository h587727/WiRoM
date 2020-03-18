from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)


with open('config.json') as json_data_file:
    data = json.load(json_data_file)
    robots = data["robots"]


@app.route('/controller', methods=['POST'])
def make_controller():
    mission = request.get_json()
    for robot in mission:
        sequence = []
        for simpleaction in mission[robot]['simpleactions']:
            if simpleaction['args'] is "":
                sequence.append(simpleaction['name'] + "()")
            else:
                sequence.append(
                    simpleaction['name'] + "(" + simpleaction['args'] + ")")

        print(mission[robot]['port'])
        print(mission[robot]['language'])
        print(sequence)
        requests.post('http://localhost:' +
                      mission[robot]['port'] + '/simpleactions', json=sequence)

    return 'Controllers successfully created', 200


@app.route('/allocate', methods=['POST'])
def task_allocation():
    tasks = request.get_json()

    bids = bid_if_can_execute_tasks(robots, tasks)
    bids = bid_by_utility(robots, tasks, bids)
    print(bids)
    tasks = allocate_tasks_to_highest_bidder(tasks, bids)

    return jsonify(tasks)

# robot bids 1 if it can execute each simpleaction for a task, otherwise 0


def bid_if_can_execute_tasks(robots, tasks):
    bids = {}
    for task in tasks:
        bids[task["name"]] = {}
        for robot in robots:
            can_execute = True
            for simpleaction in task["simpleactions"]:
                if not any(robotSimpleaction["name"] == simpleaction["name"] for robotSimpleaction in robots[robot]["simpleactions"]):
                    can_execute = False

            if can_execute:
                bids[task["name"]][robot] = 1
            else:
                bids[task["name"]][robot] = 0

    return bids


def bid_by_utility(robots, tasks, bids):
    for task in tasks:
        for robot in robots:
            bid = bids[task["name"]][robot]
            for simpleaction in task["simpleactions"]:
                for robotSimpleaction in robots[robot]["simpleactions"]:
                    if robotSimpleaction["name"] == simpleaction["name"]:
                        bid = bid * robotSimpleaction["utility"]
                        if robotSimpleaction["name"] == "go_to_location" and simpleaction["args"] != "[]":
                            loc = robots[robot]["location"]
                            # change this when structure of args is changed
                            target = {"x": 388, "y": -365}
                            distance = abs(
                                loc["x"] - target["x"] + loc["y"] - target["y"])
                            distNorm = (1 - distance/100)
                            if distNorm > 0.1:
                                bid = bid * distNorm
                            else:
                                bid = bid * 0.1
                        bids[task["name"]][robot] = bid

    return bids


def allocate_tasks_to_highest_bidder(tasks, bids):
    for bid in bids:
        chosen = '--'
        for robot in bids[bid]:
            if chosen == '--' and bids[bid][robot] > 0:
                chosen = robot
            elif chosen != '--' and bids[bid][robot] > bids[bid][chosen]:
                chosen = robot

        for task in tasks:
            if task["name"] == bid:
                task["robot"] = chosen

    return tasks


@app.route('/ping')
def ping():
    return 'Pong!'


if __name__ == '__main__':
    app.run()
