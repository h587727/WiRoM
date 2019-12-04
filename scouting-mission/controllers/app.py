from flask import Flask, request
from flask_cors import CORS
import requests 

app = Flask(__name__)
CORS(app)

@app.route('/controller', methods = ['POST'])
def make_controller():
    mission = request.get_json()
    parse_request_and_forward_actions(mission)

    #    f = open(robot['name'] + '_controller/' + robot['name'] + '_controller.py', 'w')
    #    f.write('from ' + robot['name'] + '_simpleactions import * \n')
    #    for action in robot['actions']:
    #        f.write(action.lstrip() + '\n')
    #    requests.post('http://localhost:' + robot['port'] + '/simpleactions', json = robot['actions'])
    return 'Controllers successfully created', 200
    
@app.route('/ping')
def ping():
    return 'Pong!'

def parse_request_and_forward_actions(mission):
    robots = []
    currentRobot = ''

    for elem in mission:
        if isinstance(elem, dict) and elem not in robots:
            robots.append(elem)

    for robot in robots:
        sequence = []
        for key in robot:
            for elem in mission:
                if isinstance(elem, dict):
                    currentRobot = elem.keys()[0]
                elif key == currentRobot:
                    sequence.append(elem)
            print(key)
            print(robot[key]['port'])
            print(robot[key]['language'])
            print(sequence)
            requests.post('http://localhost:' + robot[key]['port'] + '/simpleactions', json = sequence)
            
if __name__ == '__main__':
    app.run()