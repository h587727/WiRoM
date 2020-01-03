import React, {Component} from 'react';
import data from './data';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import {Button, Form, Dropdown, DropdownButton, Container, Col, Row, ListGroup, ListGroupItem, ToggleButton, ToggleButtonGroup, ButtonToolbar} from 'react-bootstrap';
import { object } from 'prop-types';

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

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={e => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
    &#x25bc;
  </a>
));

// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
const CustomMenu = React.forwardRef(
  ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
    const [value, setValue] = React.useState('');

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <Form.Control
          autoFocus
          className="mx-3 my-2 w-auto"
          placeholder="Type to filter..."
          onChange={e => setValue(e.target.value)}
          value={value}
        />
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            child =>
              !value || child.props.children[1].toLowerCase().includes(value),
          )}
        </ul>
      </div>
    );
  },
);

class App extends Component {
  state = {
    robots: data.robots,
    predefinedMissions: data.predefinedMissions,
    tasks: data.predefinedTasks,
    showInfoForRobot: "mavic2pro",
    selectedMission: "scoutLocationAndDeliverItem",
    selectedTask: "scoutLocation",
    availableSimpleactions: [],
    mission: {}
  }

  componentDidMount() {
    this.handleMissionChange()
    this.handleAvailableSimpleactionsChange()
  }

  handleAvailableSimpleactionsChange = event => {
    let availableSimpleactions = []
    for (let r in this.state.robots) {
      let i = 0
      for (let sa in this.state.robots[r].simpleactions) { 
        availableSimpleactions.push({"name":sa, "robot":r, "numArgs":sa.numArgs})
      }
    }
    this.setState({availableSimpleactions: availableSimpleactions})
  }
    
  handleMissionClick = name => event => {
    this.setState({selectedMission: name});
    this.handleMissionChange()
  }

  handleTaskClick = name => event => {
    this.setState({selectedTask: name});
  }

  handleSimpleActionArgsChange = sa => event => {
    let task = this.state.tasks[this.state.selectedTask]
    let newTask = task

    newTask[task.indexOf(sa)].args = event.target.value
    this.setState({task: newTask})
    this.handleMissionChange()
  }

  handleSimpleActionRobotChange = sa => event => {
    let task = this.state.tasks[this.state.selectedTask]
    let newTask = task

    newTask[task.indexOf(sa)].robot = event.target.value
    this.setState({task: newTask})
    this.handleMissionChange()
  }

  handleSubmit = event => {
    sendMission(this.state);
    event.preventDefault();
  }

  handleMissionChange = event => {
    let preMission = this.state.predefinedMissions[this.state.selectedMission]
    let tasks = this.state.tasks
    let robots = this.state.robots
    let mission = {}

    preMission.forEach(task => {
      tasks[task].forEach(simpleaction => {
        let robot = simpleaction.robot
        let simpleactions = [simpleaction]

        if (robot in mission){
          simpleactions = mission[robot].simpleactions
          simpleactions.push(simpleaction)
        }
        else
          mission[robot] = {port:robots[robot]["port"], language:robots[robot]["language"]}
        mission[robot].simpleactions = simpleactions
      })
    })
    console.log(mission)
    this.setState({mission: mission})
  }

  handleAddNewTask = taskName => event => {
    let tasks = this.state.tasks
    let preMission = this.state.predefinedMissions
    
    tasks[taskName] = []
    preMission[this.state.selectedMission].push(taskName)
    this.setState({tasks: tasks})
    this.setState({predefinedMissions: preMission})
    event.preventDefault()
  }

  handleAddNewSimpleaction = sa => event => {
    let tasks = this.state.tasks
    tasks[this.state.selectedTask].push({"name":sa.name, "args":"", "robot":sa.robot})
    this.setState({tasks: tasks})
  }

  handleRemoveTask = taskName => event => {
    let preMission = this.state.predefinedMissions[this.state.selectedMission]
    preMission.splice(preMission.indexOf(taskName), 1)
    this.setState({preMission: preMission})
  }

  handleRemoveSimpleaction = simpleaction => event => {
    let task = this.state.tasks[this.state.selectedTask]
    task.splice(task.indexOf(simpleaction), 1)
    this.setState({task: task})
  }

  print = event => {
    console.log("Test")
  }

  render () {
    return (
      <Container fluid>
        
        <div class="shadow p-3 mb-5 bg-white rounded">
          <div class="shadow p-3 mb-5 bg-white rounded">
            <Row>
              <Mission 
                state={this.state} 
                handleMissionClick={(mission) => this.handleMissionClick(mission)}>
              </Mission>
            </Row>
          </div>
          
          <Row style={{marginBottom:"15px"}}>
            <Col>
              <div class="shadow p-3 mb-5 bg-white rounded">
                <Task state={this.state} handleTaskClick={(mission) => this.handleTaskClick(mission)} handleRemoveTask={(task) => this.handleRemoveTask(task)}>
                </Task>

                <NewTask state = {this.state} handleAddNewTask={(taskName) => this.handleAddNewTask(taskName)} print={() => this.print()}>
                </NewTask>
              </div>
            </Col>

            <Col xs={6}>
              <div class="shadow p-3 mb-5 bg-white rounded">
                <Simpleactions 
                  state={this.state} 
                  handleSimpleActionArgsChange={(sa) => this.handleSimpleActionArgsChange(sa)}
                  handleSimpleActionRobotChange={(sa) => this.handleSimpleActionRobotChange(sa)}
                  handleRemoveSimpleaction={(sa) => this.handleRemoveSimpleaction(sa)}>

                </Simpleactions>
                
                <Dropdown>
                  <Dropdown.Toggle id="dropdown-custom-components" as={CustomToggle} title="Add new simpleaction">
                    Add new simpleaction  
                  </Dropdown.Toggle>

                  <Dropdown.Menu as={CustomMenu}>
                    {this.state.availableSimpleactions.map(sa => <Dropdown.Item onClick={this.handleAddNewSimpleaction(sa)}> {sa.name} ({sa.robot}) </Dropdown.Item>)}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
            <Col>
              <div class="shadow p-3 mb-5 bg-white rounded">
                <Robot state={this.state}>
                </Robot>
              </div>
            </Col>
          </Row>
        
          <Button type="submit" style={{marginBottom:"15px"}} variant="dark" onClick={this.handleSubmit}>
              Send mission
          </Button>
        </div>
      </Container>
    );
  }
}

class Mission extends Component {
  state = {predefinedMissions: this.props.state.predefinedMissions}

  render(){
    let numMissions = Object.keys(this.state.predefinedMissions).length
    return(
      <div style={{marginLeft:"15px"}}>
        <h1>Missions</h1>
        
        <ButtonToolbar>
          <ToggleButtonGroup type="radio" name="options" defaultValue={numMissions}>
            {Object.keys(this.state.predefinedMissions).map(m => (
              <ToggleButton value={numMissions--} variant="outline-dark" style={{marginBottom:15}} onClick={this.props.handleMissionClick(m)}>{m}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </ButtonToolbar>
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
    let numTasks = Object.keys(this.state.missions[this.state.selectedMission]).length
    return(
      <div>
        <h3>
          Tasks
        </h3>
        <ButtonToolbar>
          <Row>
            <Col>
          <ToggleButtonGroup type="radio" name="options" defaultValue={numTasks} vertical>
            {this.state.missions[this.state.selectedMission].map(t => (
              <ToggleButton value={numTasks--} variant="outline-dark" style={{display:"block"}} onClick={this.props.handleTaskClick(t)}> {t}  
              </ToggleButton> 
            ))}
            </ToggleButtonGroup>
            </Col>
            <Col>
            {this.state.missions[this.state.selectedMission].map(t => (
              <Row>
              <Button style={{marginLeft:"15px"}}onClick={this.props.handleRemoveTask(t)} variant="outline-dark">
                X
              </Button>
              </Row>
            ))}
           </Col>
          </Row>
        </ButtonToolbar>
      </div>);
  }
}

class Simpleactions extends Component {
  componentWillReceiveProps(nextProps) {
    this.setState({robots: nextProps.state.robots, tasks: nextProps.state.tasks, selectedTask: nextProps.state.selectedTask});  
  }

  findRobotsWithSimpleaction(sa) {
    let select = []
    for (let robot in this.state.robots){
      if (sa in this.state.robots[robot].simpleactions)
        select.push(<option> {robot} </option>)
    }
    return select
  }

  renderSimpleAction(sa) {    
    let simpleaction = sa.name;
    let args = sa.args;
    return (
        <ListGroup horizontal>
          <ListGroupItem style={{minWidth:"250px"}}>
            {simpleaction} 
          </ListGroupItem>
          <Form>
            <Form.Control as="input" style={{ marginLeft:"5px"}}
              value={args}
              onChange={this.props.handleSimpleActionArgsChange(sa)}>
            </Form.Control>
          </Form>

          <Form>
            <Form.Control as="select" value={sa["robot"]} onChange={this.props.handleSimpleActionRobotChange(sa)} style={{marginLeft:"10px"}}>
              {this.findRobotsWithSimpleaction(simpleaction)})}
            </Form.Control>
          </Form>

          <Button style={{marginLeft:"15px"}}onClick={this.props.handleRemoveSimpleaction(sa)} variant="outline-dark">
            X
          </Button>
        </ListGroup>);
  }

  state = {robots: this.props.state.robots, tasks: this.props.state.tasks, selectedTask: this.props.state.selectedTask}
  render(){
    console.log(this.state.tasks, this.state.selectedTask)
    return(
      <div style={{ marginBottom:"15px"}}>
        <h3>Simpleactions</h3>

        {this.state.tasks[this.state.selectedTask].map(sa => this.renderSimpleAction(sa))}
      </div>);
  }

}

class Robot extends Component {
  state = {robots: this.props.state.robots, showInfoForRobot: this.props.state.showInfoForRobot}

  handleRobotClick = name => event => {
    this.setState({showInfoForRobot: name});
  }

  render(){
    let numRobots = Object.keys(this.state.robots).length
    return(
      <div>
        <h3>
          Robot simpleactions
        </h3>

        <ButtonToolbar style={{marginBottom:"15px"}}>
          <ToggleButtonGroup type="radio" name="options" defaultValue={numRobots}>
              {Object.keys(this.state.robots).map(r => (
                <ToggleButton value={numRobots--} size="sm" variant="outline-dark" onClick={this.handleRobotClick(r)}>{r}</ToggleButton>)
              )}
            </ToggleButtonGroup>
        </ButtonToolbar>
      
        <ListGroup style={{marginBottom:"15px"}}>
          <ListGroupItem>
            Language: {this.state.robots[this.state.showInfoForRobot].language}
          </ListGroupItem>
          <ListGroupItem>
            Port: {this.state.robots[this.state.showInfoForRobot].port}
          </ListGroupItem>
            <div>{Object.keys(this.state.robots[this.state.showInfoForRobot].simpleactions).map(sa => <ListGroupItem>{sa}</ListGroupItem>)}
          </div>
        </ListGroup>
      </div>);
  }
}

class NewTask extends Component {
  state = this.props.state

  handleNameChange = event => {
    let taskName = event.target.value
    this.setState({taskName: taskName})
  }

  render() { 
    return(
    <Form onSubmit={this.props.handleAddNewTask(this.state.taskName)}>
      <Form.Group>
        <Form.Control onChange={this.handleNameChange} required placeholder="Task name" type="input"/>
      </Form.Group>

      <Button type="submit" variant="outline-dark" style={{marginTop:"10px"}}>
        Add new task
      </Button>
    </Form>
    )
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
