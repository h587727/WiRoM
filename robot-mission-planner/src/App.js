import React, {Component} from 'react';
class App extends Component {

  render () {
    return (
      <div>
        <ActionForm>
        </ActionForm>  
      </div>
    );
  }
}

class ActionForm extends Component {
  state = {
    mission: {
      robot : "epuck",
      actions : [
          "go_forward(10, 6.28)"
      ]
    }
  }

  handleSubmit = event => {
    sendMission(this.state.mission);
    event.preventDefault();
  }

  handleRobotChange = event => {
    const mission = this.state.mission;
    mission.robot = event.target.value;
    this.setState(mission)
  }

  handleActionsChange = id => event => {
    const mission = this.state.mission;
    mission.actions[id] = event.target.value;
    this.setState(mission)
  }

  render(){
    return(
      <div>
        <h1>Select robot mission</h1>

        <form onSubmit={this.handleSubmit}>
          <input 
            type="text"
            value={this.state.mission.robot}
            onChange={this.handleRobotChange}
          />
          <input 
            type="text"
            value={this.state.mission.actions}
            onChange={this.handleActionsChange(0)}
          />

          <button type="submit">
            Send mission
          </button>
        </form>
      </div>
    );
  }
}

function sendMission(mission){
  console.log('Sending request')
  fetch('http://localhost:5000/controller', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mission)
  })
  .then(res => console.log(res))
  .catch(console.log)
}

export default App;
