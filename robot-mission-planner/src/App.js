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
    showInfo: "mavic2pro",
    showTasks: "scoutLocationAndDeliverItem",
    showSimpleactions: "scoutLocation",
    mission: data.mission
  }
    
  handleMissionClick = name => event => {
    this.setState({showTasks: name});
  }

  handleTaskClick = name => event => {
    this.setState({showSimpleactions: name});
  }

  handleTaskChange = items => event => {
    console.log(items)
    let mission = this.state.predefinedMissions[this.state.showTasks]
    mission = items
    this.setState(mission)
  }

  render () {
    return (
      <div>
        <Robot state={this.state}>
        </Robot>

        <MissionForm state={this.state}>
        </MissionForm>

        <Mission state={this.state} handleMissionClick={(mission) => this.handleMissionClick(mission)}>
        </Mission>

        <Task state={this.state} handleTaskClick={(mission) => this.handleTaskClick(mission)}>
        </Task>

        <Simpleactions state={this.state}>
        </Simpleactions>

        
      </div>
    );
  }
}

class Mission extends Component {
  state = {missions: this.props.state.predefinedMissions}

  render(){
    return(
      <div>
        <h1>Missions</h1>
        {Object.keys(this.state.missions).map(m => (<button style={{marginBottom:15}} onClick={this.props.handleMissionClick(m)}>{m}</button>))}
      </div>);
  }
}

class SortableComponent extends Component {
  componentWillReceiveProps(nextProps) {
    this.setState({items: nextProps.state.predefinedMissions[nextProps.state.showTasks]});  
  }

  state = {items: this.props.state.predefinedMissions[this.props.state.showTasks]}
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
    this.setState({missions: nextProps.state.predefinedMissions, showTasks: nextProps.state.showTasks});  
  }
  state = {missions: this.props.state.predefinedMissions, showTasks: this.props.state.showTasks}

  render(){
    return(
      <div>
        {this.state.missions[this.state.showTasks].map(t => (<button style={{display:"block"}} onClick={this.props.handleTaskClick(t)}>{t}</button>))}
      </div>);
  }
}

class Simpleactions extends Component {
  componentWillReceiveProps(nextProps) {
    this.setState({tasks: nextProps.state.predefinedTasks, showSimpleactions: nextProps.state.showSimpleactions});  
  }
  
  state = {tasks: this.props.state.predefinedTasks, showSimpleactions: this.props.state.showSimpleactions}
  render(){
    return(
      <div>
        {this.state.tasks[this.state.showSimpleactions].slice(1).map(sa => <ul><li> {sa} </li></ul>)}
      </div>);
  }

}

class Robot extends Component {
  state = {robots: this.props.state.robots, showInfo: this.props.state.showInfo}

  handleRobotClick = name => event => {
    this.setState({showInfo: name});
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
              {this.state.robots[this.state.showInfo].language}
            </li>
            <li>
              {this.state.robots[this.state.showInfo].port}
            </li>
              <div>{Object.keys(this.state.robots[this.state.showInfo].simpleactions).map(sa => <li>{sa}</li>)}
            </div>
          </ul>
        }
      </div>);
  }
}

class MissionForm extends Component {
  handleSubmit = event => {
    sendMission(this.props.state.mission);
    event.preventDefault();
  }

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
