from flask import Flask, request
from flask_cors import CORS
import requests 

app = Flask(__name__)
CORS(app)

@app.route('/controller', methods = ['POST'])
def make_controller():
    mission = request.get_json()
    for robot in mission:
        print(mission[robot])
        print(mission[robot]['port'])
        print(mission[robot]['language'])
        print(mission[robot]['simpleactions'])
        requests.post('http://localhost:' + mission[robot]['port'] + '/simpleactions', json = mission[robot]['simpleactions'])

    #    f = open(robot['name'] + '_controller/' + robot['name'] + '_controller.py', 'w')
    #    f.write('from ' + robot['name'] + '_simpleactions import * \n')
    #    for action in robot['actions']:
    #        f.write(action.lstrip() + '\n')
    #    requests.post('http://localhost:' + robot['port'] + '/simpleactions', json = robot['actions'])
    return 'Controllers successfully created', 200
    
@app.route('/ping')
def ping():
    return 'Pong!'

            
if __name__ == '__main__':
    app.run()