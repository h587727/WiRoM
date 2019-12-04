import React, {Component} from 'react';
import data from './data';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import arrayMove from 'array-move';

const SortableItem = SortableElement(({value}) => <li onClick={console.log(value)}>{value}</li>);

const SortableList = SortableContainer(({items}) => {
  return (
    <ul>
      {items.map((value, index) => (
        <SortableItem key={`item-${value}`} index={index} value={value}/>
      ))}
    </ul>
  );
});

class App extends Component {
  state = {
    robots: data.robots,
    predefinedMissions: data.predefinedMissions,
    predefinedTasks: data.predefinedTasks,
    showInfoForRobot: "mavic2pro",
    selectedMission: "scoutLocationAndDeliverItem",
    selectedTask: "scoutLocation",
    mission: data.mission
  }
    
  handleMissionClick = name => event => {
    this.setState({selectedMission: name});
    this.handleMissionChange()
  }

  handleTaskClick = name => event => {
    this.setState({selectedTask: name});
  }

  handleSubmit = event => {
    sendMission(this.state);
    event.preventDefault();
  }

  handleMissionChange = event => {
    let preMission = this.state.predefinedMissions[this.state.selectedMission]
    let preTasks = this.state.predefinedTasks
    let robots = this.state.robots
    let mission = {}

    preMission.forEach(task => {
      let simpleactions = []
      let robot = preTasks[task][0].robot

      if (robot in mission)
          simpleactions = mission[robot].simpleactions

      mission[robot] = {port:robots[robot]["port"], language:robots[robot]["language"]}
      preTasks[task].slice(1).forEach(simpleaction => { simpleactions.push(simpleaction) })
      mission[robot].simpleactions = simpleactions
    })
    console.log(mission)
    this.setState({mission: mission})
  }

  handleTaskChange = items => event => {
    let mission = this.state.predefinedMissions[this.state.selectedMission]
    mission = items
    this.setState(mission)
  }

  render () {
    return (
      <div>
        <Robot state={this.state}>
        </Robot>

        <Mission 
          state={this.state} 
          handleMissionClick={(mission) => this.handleMissionClick(mission)}>
        </Mission>

        <Task state={this.state} handleTaskClick={(mission) => this.handleTaskClick(mission)}>
        </Task>

        <Simpleactions state={this.state}>
        </Simpleactions>

        <button onClick={this.handleSubmit}>
            Send mission
        </button>
        
      </div>
    );
  }
}

class Mission extends Component {
  state = {predefinedMissions: this.props.state.predefinedMissions}

  render(){
    return(
      <div>
        <h1>Missions</h1>
        {Object.keys(this.state.predefinedMissions).map(m => (<button style={{marginBottom:15}} onClick={this.props.handleMissionClick(m)}>{m}</button>))}
      </div>);
  }
}

class SortableComponent extends Component {
  componentWillReceiveProps(nextProps) {
    this.setState({items: nextProps.state.predefinedMissions[nextProps.state.selectedMission]});  
  }

  state = {items: this.props.state.predefinedMissions[this.props.state.selectedMission]}
  onSortEnd = ({oldIndex, newIndex}) => {
    this.setState(({items}) => ({
      items: arrayMove(items, oldIndex, newIndex),
    }));
    console.log(this.state.items)
    
  };

  render() {
    return <SortableList items={this.state.items} onSortEnd={this.onSortEnd}/>;
  }
}

class Task extends Component {
  componentWillReceiveProps(nextProps) {
    this.setState({missions: nextProps.state.predefinedMissions, selectedMission: nextProps.state.selectedMission});  
  }
  state = {missions: this.props.state.predefinedMissions, selectedMission: this.props.state.selectedMission}

  render(){
    return(
      <div>
        {this.state.missions[this.state.selectedMission].map(t => (<button style={{display:"block"}} onClick={this.props.handleTaskClick(t)}>{t}</button>))}
      </div>);
  }
}

class Simpleactions extends Component {
  componentWillReceiveProps(nextProps) {
    this.setState({tasks: nextProps.state.predefinedTasks, selectedTask: nextProps.state.selectedTask});  
  }
  
  state = {tasks: this.props.state.predefinedTasks, selectedTask: this.props.state.selectedTask}
  render(){
    return(
      <div>
        {this.state.tasks[this.state.selectedTask].slice(1).map(sa => <ul><li> {sa} </li></ul>)}
      </div>);
  }

}

class Robot extends Component {
  state = {robots: this.props.state.robots, showInfoForRobot: this.props.state.showInfoForRobot}

  handleRobotClick = name => event => {
    this.setState({showInfoForRobot: name});
  }

  render(){
    return(
      <div>
        <h1>
          Robot information
        </h1>

        {Object.keys(this.state.robots).map(r => (<button onClick={this.handleRobotClick(r)}>{r}</button>))}

        {
          <ul>
            <li>
              {this.state.robots[this.state.showInfoForRobot].language}
            </li>
            <li>
              {this.state.robots[this.state.showInfoForRobot].port}
            </li>
              <div>{Object.keys(this.state.robots[this.state.showInfoForRobot].simpleactions).map(sa => <li>{sa}</li>)}
            </div>
          </ul>
        }
      </div>);
  }
}

class MissionForm extends Component {
  handleRobotChange = event => {
    const robot = this.props.state.mission.robots;
    robot.name = event.target.value;
    this.setState(robot)
  }

  handleActionsChange = id => event => {
    const robot = this.props.state.mission.robots[id];
    robot.actions = [];
    event.target.value.split(',').forEach(e => {
      robot.actions.push(e);
    });
    this.setState(robot)
  }

  handleSubmit = event => {
    sendMission(this.state);
    event.preventDefault();
  }

  render(){
    return(
      <div>
        <h1>Select robot mission</h1>

        <form onSubmit={this.handleSubmit}>
          <input 
            type="text"
            value={this.props.state.mission.robots[0].name}
            onChange={this.handleRobotChange}
          />

          <input
            type="text"
            value={this.props.state.mission.robots[0].actions}
            onChange={this.handleActionsChange(0)}
            style={{width: 200}}
          />
        </form>

        <form onSubmit={this.handleSubmit}>
          <input 
            type="text"
            value={this.props.state.mission.robots[1].name}
            onChange={this.handleRobotChange}
          />

          <input 
            type="text"
            value={this.props.state.mission.robots[1].actions}
            onChange={this.handleActionsChange(1)}
            style={{width: 200}}
          />

          <button type="submit">
            Send mission
          </button>
        </form>
      </div>
    );
  }
}


function sendMission(state){
  console.log('Sending request')
  fetch('http://localhost:5000/controller', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(state.mission)
  })
  .then(res => console.log(res))
  .catch(console.log)
}

export default App;
