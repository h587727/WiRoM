from flask import Flask, request, jsonify
from flask_cors import CORS
import requests 

app = Flask(__name__)
CORS(app)

@app.route('/controller', methods = ['POST'])
def make_controller():
    mission = request.get_json()
    for robot in mission:
        sequence = []
        for simpleaction in mission[robot]['simpleactions']:
            if simpleaction['args'] is "":
                sequence.append(simpleaction['name'] + "()")
            else:
                sequence.append(simpleaction['name'] + "(" + simpleaction['args'] + ")")

        print(mission[robot]['port'])
        print(mission[robot]['language'])
        print(sequence)
        requests.post('http://localhost:' + mission[robot]['port'] + '/simpleactions', json = sequence)

    #    f = open(robot['name'] + '_controller/' + robot['name'] + '_controller.py', 'w')
    #    f.write('from ' + robot['name'] + '_simpleactions import * \n')
    #    for action in robot['actions']:
    #        f.write(action.lstrip() + '\n')
    #    requests.post('http://localhost:' + robot['port'] + '/simpleactions', json = robot['actions'])
    return 'Controllers successfully created', 200
    
@app.route('/allocate', methods = ['POST'])
def task_allocation():
    tasks = request.get_json()

    bids = bid_if_can_execute_tasks(robots, tasks)
    tasks = allocate_tasks_to_highest_bidder(tasks, bids)

    return jsonify(tasks)

#robot bids 1 if it can execute the task in it's entirety, otherwise 0
def bid_if_can_execute_tasks(robots, tasks):
    bids = {}
    for task in tasks:
        bids[task["name"]] = {}
        for simpleaction in task["simpleactions"]:
            for robot in robots:
                if any(sa["name"] == simpleaction["name"] for sa in robots[robot]["simpleactions"]):
                    if not robot in bids[task["name"]]:
                        bids[task["name"]][robot] = 1
                    if bids[task["name"]][robot] == 0:
                        continue
                else:
                    bids[task["name"]][robot] = 0

    return bids
                     
def allocate_tasks_to_highest_bidder(tasks, bids):
    for bid in bids:
        chosen = ''
        for robot in bids[bid]:
            if not chosen in bids[bid]:
                chosen = robot
            elif bids[bid][robot] > bids[bid][chosen]:
                chosen = robot
                
        for task in tasks:
            if task["name"] == bid:
                for simpleaction in task["simpleactions"]:
                    simpleaction["robot"] = chosen
                    print(simpleaction)

    return tasks
    


@app.route('/ping')
def ping():
    return 'Pong!'

   
robots = {
    "mavic2pro": {
        "language" : "python",
        "port" : "5001",
        "simpleactions": [
            {"name":"set_altitude", "numArgs": 1, "type":"move"},
            {"name":"go_forward", "numArgs": 1, "type":"move"},
            {"name":"go_backward", "numArgs": 1, "type":"move"},
            {"name":"turn_right", "numArgs": 1, "type":"move"},
            {"name":"turn_left", "numArgs": 1, "type":"move"},
            {"name":"recognise_objects", "numArgs": 0, "type":"set_property"},
            {"name":"go_to_location", "numArgs": 1, "type":"move"},
            {"name":"set_message_target", "numArgs": 1, "type":"set_property"},
            {"name":"send_location", "numArgs":0, "type":"notify"},
            {"name":"stop_movement", "numArgs": 0, "type":"move"}
        ]
    },
    "moose": {
        "language" : "python",
        "port" : "5002",
        "simpleactions": [
            {"name":"go_forward", "numArgs": 1, "type":"move"},
            {"name":"go_backward", "numArgs": 1, "type":"move"},
            {"name":"turn_right", "numArgs": 1, "type":"move"},
            {"name":"turn_left", "numArgs": 1, "type":"move"},
            {"name":"go_to_location", "numArgs": 1, "type":"move"},
            {"name":"stop_movement", "numArgs": 0, "type":"move"},
            {"name":"receive_location_from_robot", "numArgs":0 , "type":"wait"}
        ]
    }
}

            
if __name__ == '__main__':
    app.run()