from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/controller', methods = ['POST'])
def make_controller():
    mission = request.get_json()
    f = open('epuck_controller/epuck_controller.py', 'w')
    f.write('from ' + mission['robot'] + '_simpleactions import * \n')
    for action in mission['actions']:
        f.write(action + '\n')
    return 'Script was made'
    
@app.route('/ping')
def ping():
    return 'Pong!'

if __name__ == '__main__':
    app.run()