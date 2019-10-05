from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/controller', methods = ['POST'])
def make_controller():
    mission = request.get_json()
    robot = mission['robot']
    f = open(robot + '_controller/epuck_controller.py', 'w')
    f.write('from ' + robot + '_simpleactions import * \n')
    for action in mission['actions']:
        f.write(action + '\n')
    return 'Script was made'
    
@app.route('/ping')
def ping():
    return 'Pong!'

if __name__ == '__main__':
    app.run()