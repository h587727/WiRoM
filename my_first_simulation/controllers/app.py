from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/controller', methods = ['POST'])
def make_controller():
    mission = request.get_json()
    print(mission)
    robot = mission['robot']

    f = open(robot + '_controller/' + robot + '_controller.py', 'w')
    f.write('from ' + robot + '_simpleactions import * \n')
    for action in mission['actions']:
        f.write(action + '\n')
    return 'Controller for "' + robot + '" was successfully created', 200
    
@app.route('/ping')
def ping():
    return 'Pong!'

if __name__ == '__main__':
    app.run()