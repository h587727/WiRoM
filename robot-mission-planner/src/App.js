import React, { Component } from 'react';
import data from './data';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { Button, Form, Dropdown, Container, Col, Row, ListGroup, ListGroupItem, ToggleButton, ToggleButtonGroup, ButtonToolbar } from 'react-bootstrap';
import { ReactSortable } from "react-sortablejs";

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
              !value || child.props.children[1].toLowerCase().includes(value) || child.props.children[3].toLowerCase().includes(value),
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
    showInfoForRobot: data.defaultShowInfoForRobot,
    selectedMission: data.defaultSelectedMission,
    selectedTask: data.defaultSelectedTask,
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
      for (let sa in this.state.robots[r].simpleactions) {
        availableSimpleactions.push({ "name": sa, "robot": r, "numArgs": sa.numArgs })
      }
    }
    this.setState({ availableSimpleactions: availableSimpleactions })
  }

  handleMissionClick = name => event => {
    let newSelectedTask = ""
    if (this.state.predefinedMissions[name].length > 0)
      newSelectedTask = this.state.predefinedMissions[name][0].name

    this.setState({ selectedMission: name })
    this.setState({ selectedTask: newSelectedTask })
    this.handleMissionChange()
  }

  handleTaskClick = name => event => {
    this.setState({ selectedTask: name })
  }

  handleSimpleActionArgsChange = sa => event => {
    let task = this.state.tasks[this.state.selectedTask]
    let newTask = task

    newTask[task.indexOf(sa)].args = event.target.value
    this.setState({ task: newTask })
    this.handleMissionChange()
  }

  handleSimpleActionRobotChange = sa => event => {
    let task = this.state.tasks[this.state.selectedTask]
    let newTask = task

    newTask[task.indexOf(sa)].robot = event.target.value
    this.setState({ task: newTask })
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
      tasks[task.name].forEach(simpleaction => {
        let robot = simpleaction.robot
        let simpleactions = [simpleaction]

        if (robot in mission) {
          simpleactions = mission[robot].simpleactions
          simpleactions.push(simpleaction)
        }
        else
          mission[robot] = { port: robots[robot]["port"], language: robots[robot]["language"] }
        mission[robot].simpleactions = simpleactions
        tasks[task.name][tasks[task.name].indexOf(simpleaction)].id = mission[robot].simpleactions.length - 1
      })
    })
    this.setState({ tasks: tasks })
    this.setState({ mission: mission })
  }

  handleAddNewTask = taskName => event => {
    let tasks = this.state.tasks
    let preMission = this.state.predefinedMissions
    tasks[taskName] = []
    preMission[this.state.selectedMission].push({ "name": taskName, "id": tasks.length })

    this.setState({ selectedTask: taskName })
    this.setState({ tasks: tasks })
    this.setState({ predefinedMissions: preMission })
    event.preventDefault()
    event.target.reset()
    this.handleMissionChange()
  }

  handleAddNewSimpleaction = sa => event => {
    let tasks = this.state.tasks
    tasks[this.state.selectedTask].push({ "name": sa.name, "args": "", "robot": sa.robot })
    this.setState({ tasks: tasks })
    this.handleMissionChange()
  }

  handleAddNewMission = missionName => event => {
    let preMission = this.state.predefinedMissions
    preMission[missionName] = []
    event.preventDefault()
    event.target.reset();
    this.setState({ predefinedMissions: preMission })
    this.setState({ selectedMission: missionName })
    this.setState({ selectedTask: "" })
    this.handleMissionChange()
  }

  handleRemoveTask = task => event => {
    let preMission = this.state.predefinedMissions[this.state.selectedMission]
    preMission.splice(preMission.indexOf(task), 1)
    this.setState({ preMission: preMission })
    this.handleMissionChange()
  }

  handleRemoveSimpleaction = simpleaction => event => {
    let task = this.state.tasks[this.state.selectedTask]
    task.splice(task.indexOf(simpleaction), 1)
    this.setState({ task: task })
    this.handleMissionChange()
  }

  handleSimpleactionSortable = newState => {
    let tasks = this.state.tasks
    tasks[this.state.selectedTask] = newState
    this.setState({ tasks: tasks })
    this.handleMissionChange()
  }

  handleTaskSortable = newState => {
    let preMissions = this.state.predefinedMissions
    preMissions[this.state.selectedMission] = newState
    this.setState({ predefinedMissions: preMissions })
    this.handleMissionChange()
  }

  render() {
    return (
      <Container fluid>
        <div className="shadow p-3 mb-5 bg-white rounded">
          <div className="shadow p-3 mb-5 bg-white rounded">
            <Row>
              <Mission
                state={this.state}
                handleMissionClick={(mission) => this.handleMissionClick(mission)}
              >
              </Mission>

              <NewMission
                state={this.state}
                handleAddNewMission={(missionName) => this.handleAddNewMission(missionName)}
              >
              </NewMission>
            </Row>
          </div>

          <Row style={{ marginBottom: "15px" }}>
            <Col xs={3}>
              <div className="shadow p-3 mb-5 bg-white rounded">
                <Task
                  state={this.state}
                  handleTaskClick={(mission) => this.handleTaskClick(mission)}
                  handleRemoveTask={(task) => this.handleRemoveTask(task)}
                  handleTaskSortable={(newState) => this.handleTaskSortable(newState)}>
                </Task>

                <NewTask state={this.state} handleAddNewTask={(taskName) => this.handleAddNewTask(taskName)} print={() => this.print()}>
                </NewTask>
              </div>
            </Col>

            <Col xs={6}>
              {
                this.state.selectedTask === "" ? <div></div> :
                  <div className="shadow p-3 mb-5 bg-white rounded">
                    <Simpleactions
                      state={this.state}
                      handleSimpleActionArgsChange={(sa) => this.handleSimpleActionArgsChange(sa)}
                      handleSimpleActionRobotChange={(sa) => this.handleSimpleActionRobotChange(sa)}
                      handleRemoveSimpleaction={(sa) => this.handleRemoveSimpleaction(sa)}
                      handleSimpleactionSortable={(newState) => this.handleSimpleactionSortable(newState)}>

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
              }
            </Col>
            <Col xs={3}>
              <div className="shadow p-3 mb-5 bg-white rounded">
                <Robot state={this.state}>
                </Robot>
              </div>
            </Col>
          </Row>

          <Button type="submit" style={{ marginBottom: "15px" }} variant="dark" onClick={this.handleSubmit}>
            Send mission
          </Button>
        </div>
      </Container>
    );
  }
}

class Mission extends Component {
  state = { predefinedMissions: this.props.state.predefinedMissions }

  render() {
    let numMissions = Object.keys(this.state.predefinedMissions).length
    return (
      <div style={{ marginLeft: "15px" }}>
        <h1>Missions</h1>

        <ButtonToolbar>
          <ToggleButtonGroup type="radio" name="options" defaultValue={numMissions}>
            {Object.keys(this.state.predefinedMissions).map(mission => (
              <ToggleButton
                variant={mission === this.props.state.selectedMission ? "dark" : "outline-dark"}
                style={{ marginBottom: 15 }}
                onClick={this.props.handleMissionClick(mission)}>
                {mission}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </ButtonToolbar>
      </div>);
  }
}

class Task extends Component {
  componentWillReceiveProps(nextProps) {
    this.setState({
      list: nextProps.state.predefinedMissions[nextProps.state.selectedMission]
    });
  }
  state = {
    list: this.props.state.predefinedMissions[this.props.state.selectedMission]
  }

  render() {
    return (
      <div>
        <h3>
          Tasks
        </h3>

        <ReactSortable
          list={this.state.list}
          setList={newState => this.props.handleTaskSortable(newState)}
          animation={150}
        >
          {this.state.list.map(task => (
            <div style={{ display: "flex" }}>
              <Button
                variant={task.name === this.props.state.selectedTask ? "dark" : "outline-dark"}
                style={{ display: "block", width: "100%", overflow: "scroll" }}
                onClick={this.props.handleTaskClick(task.name)}
              >
                {task.name}
              </Button>

              <Button
                style={{ marginLeft: "5px" }}
                onClick={this.props.handleRemoveTask(task)}
                variant="outline-dark"
              >
                X
              </Button>
            </div>
          ))}
        </ReactSortable>
      </div>);
  }
}

class Simpleactions extends Component {
  componentWillReceiveProps(nextProps) {
    this.setState({
      robots: nextProps.state.robots,
      list: nextProps.state.tasks[nextProps.state.selectedTask],
      mission: nextProps.state.mission
    });
  }

  findRobotsWithSimpleaction(sa) {
    let select = []
    for (let robot in this.state.robots) {
      if (sa in this.state.robots[robot].simpleactions)
        select.push(<option> {robot} </option>)
    }
    return select
  }

  state = {
    robots: this.props.state.robots,
    list: this.props.state.tasks[this.props.state.selectedTask]
  }

  render() {
    if (this.state.list === undefined)
      return (<h3>Simpleactions</h3>)

    return (
      <div style={{ marginBottom: "15px" }}>
        <h3>Simpleactions</h3>
        {

          <ReactSortable
            list={this.state.list}
            setList={newState => this.props.handleSimpleactionSortable(newState)}
            animation={150}
          >
            {this.state.list.map(sa => (
              <ListGroup horizontal>
                <div style={{ minWidth: "25px", marginTop: "5px", border: "" }}>
                  {
                    (this.state.robots[sa.robot].simpleactions[sa.name].type === "notify" ||
                      this.state.robots[sa.robot].simpleactions[sa.name].type === "wait") ?
                      (sa.id + 1) + "*" : (sa.id + 1)
                  }
                </div>

                <ListGroupItem style={{ width: "225px", overflow: "scroll" }}>
                  {sa.name}
                </ListGroupItem>

                <Form>
                  {this.state.robots[sa.robot].simpleactions[sa.name].numArgs === 0
                    ?
                    <Form.Control as="input" disabled style={{ marginLeft: "5px", width: "120px", overflow: "scroll" }}
                      value={sa.args}
                      onChange={this.props.handleSimpleActionArgsChange(sa)}>
                    </Form.Control>
                    :
                    <Form.Control as="input" style={{ marginLeft: "5px", width: "120px", overflow: "scroll" }}
                      value={sa.args}
                      onChange={this.props.handleSimpleActionArgsChange(sa)}>
                    </Form.Control>
                  }
                </Form>

                <Form>
                  <Form.Control
                    as="select"
                    value={sa.robot}
                    onChange={this.props.handleSimpleActionRobotChange(sa)}
                    style={{ marginLeft: "5px", width: "120px" }}>
                    {this.findRobotsWithSimpleaction(sa.name)})}
                </Form.Control>
                </Form>

                <Button style={{ marginLeft: "5px" }} onClick={this.props.handleRemoveSimpleaction(sa)} variant="outline-dark">
                  X
              </Button>
              </ListGroup>
            ))}
          </ReactSortable>
        }
      </div>);
  }

}

class Robot extends Component {
  state = { robots: this.props.state.robots, showInfoForRobot: this.props.state.showInfoForRobot }

  handleRobotClick = name => event => {
    this.setState({ showInfoForRobot: name });
  }

  render() {
    let numRobots = Object.keys(this.state.robots).length
    return (
      <div>
        <h3>
          Robot simpleactions
        </h3>

        <ButtonToolbar style={{ marginBottom: "15px" }}>
          <ToggleButtonGroup type="radio" name="options" defaultValue={numRobots}>
            {Object.keys(this.state.robots).map(r => (
              <ToggleButton value={numRobots--} size="sm" variant="outline-dark" onClick={this.handleRobotClick(r)}>{r}</ToggleButton>)
            )}
          </ToggleButtonGroup>
        </ButtonToolbar>

        <ListGroup style={{ overflow: "scroll", height: "315px" }}>
          <ListGroupItem>
            Language: {this.state.robots[this.state.showInfoForRobot].language}
          </ListGroupItem>

          <ListGroupItem>
            Port: {this.state.robots[this.state.showInfoForRobot].port}
          </ListGroupItem>

          <div>
            {Object.keys(this.state.robots[this.state.showInfoForRobot].simpleactions).map(sa => <ListGroupItem>{sa}</ListGroupItem>)}
          </div>
        </ListGroup>
      </div>);
  }
}

class NewTask extends Component {
  state = this.props.state

  handleNameChange = event => {
    let taskName = event.target.value
    this.setState({ taskName: taskName })
  }

  render() {
    return (
      <Form inline style={{ marginTop: "15px" }} onSubmit={this.props.handleAddNewTask(this.state.taskName)}>
        <Form.Group>
          <Form.Control style={{ width: "165px" }} onChange={this.handleNameChange} required placeholder="Task name" type="input" />

          <Button type="submit" variant="outline-dark">
            Add new task
          </Button>
        </Form.Group>
      </Form>
    )
  }
}

class NewMission extends Component {
  state = this.props.state

  handleNameChange = event => {
    let missionName = event.target.value
    this.setState({ missionName: missionName })
  }

  render() {
    return (
      <Form inline style={{ marginTop: "40px", marginLeft: "10px" }} onSubmit={this.props.handleAddNewMission(this.state.missionName)}>
        <Form.Group >
          <Form.Control onChange={this.handleNameChange} required placeholder="Mission name" type="input" />

          <Button type="submit" variant="outline-dark" style={{}}>
            Add new mission
          </Button>
        </Form.Group>
      </Form>
    )
  }
}

function sendMission(state) {
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
