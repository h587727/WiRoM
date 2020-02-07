import React, { Component } from 'react';
import data from './data';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { Button, Form, Dropdown, Container, Col, Row, ListGroup, ListGroupItem, ToggleButton, ToggleButtonGroup, ButtonToolbar } from 'react-bootstrap';
import { ReactSortable } from "react-sortablejs";
import { Graph } from "react-d3-graph";

// the graph configuration, you only need to pass down properties
// that you want to override, otherwise default ones will be used
const myConfig = {
  nodeHighlightBehavior: true,
  staticGraph: true,
  automaticRearrangeAfterDropNode: true,
  directed: true,
  width: "950px",
  d3: {
    linklength: 200,
    linkStrength: 1
  },
  node: {
    color: "#7e11c3",
    size: 200,
    highlightStrokeColor: "#cf0404",
  },
  link: {
    highlightColor: "#cf0404",
  },
};

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
    selectedRobot: data.defaultSelectedRobot,
    selectedMission: data.defaultSelectedMission,
    selectedTask: data.defaultSelectedTask,
    availableSimpleactions: [],
    missions: data.missions,
    currentMission: data.defaultCurrentMission,
    graphData: { nodes: [{ id: "robot" }], links: [] },
    showTimeline: false
  }

  componentDidMount() {
    this.handleMissionChange()
    this.handleAvailableSimpleactionsChange()
  }

  handleAvailableSimpleactionsChange = event => {
    let availableSimpleactions = []

    for (let robot in this.state.robots) {
      this.state.robots[robot].simpleactions.forEach(sa => {
        availableSimpleactions.push({ "name": sa.name, "robot": robot, "numArgs": sa.numArgs, "type": sa.type })
      })
    }
    this.setState({ availableSimpleactions: availableSimpleactions })
  }

  generateGraphData() {
    let mission = this.state.currentMission
    let x = 50
    let y = 100
    let data = { nodes: [], links: [] }
    let waitNode = ""
    let notifyNode = ""
    Object.keys(mission).forEach(robot => {
      data["nodes"].push({ id: robot, x: x, y: y, symbolType: "wye" })
      let prevNode = robot
      x += 120
      mission[robot].simpleactions.forEach(sa => {
        this.state.availableSimpleactions.forEach(availSa => {
          if (availSa.robot === robot && availSa.name === sa.name) {
            if (availSa.type === "wait") {
              waitNode = sa
            }
            if (availSa.type === "notify") {
              notifyNode = sa
            }
            if (notifyNode !== "" && waitNode !== "") {
              data["links"].push({ source: notifyNode.name + "(" + notifyNode.args + ")", target: waitNode.name + "(" + waitNode.args + ")" })
              notifyNode = waitNode = ""
            }
          }
        })
        data["nodes"].push({ id: sa.name + "(" + sa.args + ")", x: x, y: y })
        data["links"].push({ source: prevNode, target: sa.name + "(" + sa.args + ")" })
        prevNode = sa.name + "(" + sa.args + ")"
        x += 120
      })
      x = 50
      y += 100
    })
    console.log(data)
    this.setState({ graphData: data })
  }

  handleMissionClick = missionName => event => {
    let newSelectedTask = ""
    if (this.state.missions[missionName].tasks.length > 0)
      newSelectedTask = this.state.missions[missionName].tasks[0].name

    this.setState({ selectedMission: missionName })
    this.setState({ selectedTask: newSelectedTask })
    this.handleMissionChange()
  }

  handleTaskClick = name => event => {
    this.setState({ selectedTask: name })
  }

  handleSimpleActionArgsChange = sa => event => {
    let tasks = this.state.missions[this.state.selectedMission].tasks
    let newSa = sa
    tasks.forEach(task => {
      task.simpleactions.forEach(simpleaction => {
        if (simpleaction = sa) {
          newSa = simpleaction
          newSa.args = event.target.value
        }
      })
    })
    this.setState({ sa: newSa })
    this.handleMissionChange()
  }

  handleSimpleActionRobotChange = sa => event => {
    let tasks = this.state.missions[this.state.selectedMission].tasks
    let newSa = sa
    tasks.forEach(task => {
      task.simpleactions.forEach(simpleaction => {
        if (simpleaction = sa) {
          newSa = simpleaction
          newSa.robot = event.target.value
        }
      })
    })
    this.setState({ sa: newSa })
    this.handleMissionChange()
  }

  handleSubmit = event => {
    sendMission(this.state);
    event.preventDefault();
  }

  handleMissionChange = event => {
    let tasks = this.state.missions[this.state.selectedMission].tasks
    let robots = this.state.robots
    let newCurrentMission = {}

    tasks.forEach(task => {
      task.simpleactions.forEach(simpleaction => {
        let robot = simpleaction.robot
        let simpleactions = [simpleaction]

        if (robot in newCurrentMission) {
          simpleactions = newCurrentMission[robot].simpleactions
          simpleactions.push(simpleaction)
        }
        else {
          newCurrentMission[robot] = { port: robots[robot]["port"], language: robots[robot]["language"] }
        }
        newCurrentMission[robot].simpleactions = simpleactions
        task.simpleactions[task.simpleactions.indexOf(simpleaction)].id = newCurrentMission[robot].simpleactions.length - 1
      })
    })
    this.setState({ tasks: tasks })
    this.setState({ currentMission: newCurrentMission })
    console.log(this.state)
    this.generateGraphData()
  }

  handleAddNewTask = taskName => event => {
    let mission = this.state.missions[this.state.selectedMission]
    mission.tasks.push({ "name": taskName, "id": mission.tasks.length, simpleactions: [] })
    this.setState({ selectedTask: taskName })
    this.setState({ mission: mission })

    event.preventDefault()
    event.target.reset()
    this.handleMissionChange()
  }

  handleAddNewSimpleaction = sa => event => {
    let tasks = this.state.missions[this.state.selectedMission].tasks
    tasks.forEach(task => {
      if (task.name === this.state.selectedTask)
        task.simpleactions.push({ "name": sa.name, "args": "", "robot": sa.robot })
      tasks[tasks.indexOf(task)] = task
    })
    this.setState({ tasks: tasks })
    this.handleMissionChange()
  }

  handleAddNewMission = missionName => event => {
    let missions = this.state.missions
    missions[missionName] = { "tasks": [] }
    this.setState({ missions: missions })
    this.setState({ selectedMission: missionName })
    this.setState({ selectedTask: "" })

    event.preventDefault()
    event.target.reset();
    this.handleMissionChange()
  }

  handleRemoveTask = task => event => {
    let mission = this.state.missions[this.state.selectedMission]
    mission.tasks.splice(mission.tasks.indexOf(task), 1)
    this.setState({ mission: mission })
    this.handleMissionChange()
  }

  handleRemoveSimpleaction = simpleaction => event => {
    let tasks = this.state.missions[this.state.selectedMission].tasks
    tasks.forEach(task => {
      if (task.name === this.state.selectedTask) {
        task.simpleactions.splice(task.simpleactions.indexOf(simpleaction), 1)
      }
    })
    this.setState({ tasks: tasks })
    this.handleMissionChange()
  }

  handleSimpleactionSortable = newState => {
    let tasks = this.state.missions[this.state.selectedMission].tasks

    tasks.forEach(task => {
      if (task.name === this.state.selectedTask) {
        if (newState > task.simpleactions) {
          newState.forEach(sa => {
            if (!task.simpleactions.includes(sa)) {
              newState[newState.indexOf(sa)] = { "name": sa.name, "args": "", "robot": this.state.selectedRobot, "id": (newState.length - 1) }
            }
          })
        }
        task.simpleactions = newState
      }
    })

    this.setState({ tasks: tasks })
    this.handleMissionChange()
  }

  handleTaskSortable = newState => {
    let missions = this.state.missions
    missions[this.state.selectedMission].tasks = newState
    this.setState({ missions: missions })
    this.handleMissionChange()
  }

  render() {
    return (
      <Container fluid>
        <Row style={{ marginTop: "30px" }}>
          <Col xs="9">
            <div className="shadow p-3 mb-5 rounded" style={{ backgroundColor: "#f2f2f2" }}>
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
                <Col xs={4}>
                  <div className="shadow p-3 mb-5 bg-white rounded">
                    <Task
                      state={this.state}
                      handleTaskClick={(currentMission) => this.handleTaskClick(currentMission)}
                      handleRemoveTask={(task) => this.handleRemoveTask(task)}
                      handleTaskSortable={(newState) => this.handleTaskSortable(newState)}>
                    </Task>

                    <NewTask state={this.state} handleAddNewTask={(taskName) => this.handleAddNewTask(taskName)} print={() => this.print()}>
                    </NewTask>
                  </div>
                </Col>

                <Col xs={8}>
                  {
                    this.state.selectedTask === "" ? <div></div> :
                      <div className="shadow p-3 mb-5 bg-white rounded">
                        <Simpleactions
                          state={this.state}
                          handleSimpleActionArgsChange={(sa) => this.handleSimpleActionArgsChange(sa)}
                          handleSimpleActionRobotChange={(sa) => this.handleSimpleActionRobotChange(sa)}
                          handleRemoveSimpleaction={(sa) => this.handleRemoveSimpleaction(sa)}
                          handleSimpleactionSortable={(newState) => this.handleSimpleactionSortable(newState)}
                        >
                        </Simpleactions>

                        <Dropdown>
                          <Dropdown.Toggle id="dropdown-custom-components" as={CustomToggle} title="Search for simpleaction">
                            Search for simpleaction
                          </Dropdown.Toggle>

                          <Dropdown.Menu as={CustomMenu}>
                            {this.state.availableSimpleactions.map(sa => <Dropdown.Item onClick={this.handleAddNewSimpleaction(sa)}> {sa.name} ({sa.robot}) </Dropdown.Item>)}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                  }
                </Col>
              </Row>

              <div className="shadow p-3 mb-5 bg-white rounded">
                {this.state.showTimeline &&
                  <Graph
                    id="mission-planner" // id is mandatory, if no id is defined rd3g will throw an error
                    data={this.state.graphData}
                    config={myConfig}>
                  </Graph>
                }
              </div>

              <Button type="submit" variant="outline-dark" onClick={this.handleSubmit}>
                Send mission
              </Button>

              <Button variant="outline-dark" onClick={() => this.setState({ showTimeline: !this.state.showTimeline })}>
                {this.state.showTimeline ? "Hide mission timeline" : "Show mission timeline"}
              </Button>
            </div>
          </Col>

          <Col xs={3}>
            <div className="shadow p-3 mb-5 bg-white rounded">
              <Robot state={this.state}>
              </Robot>
            </div>
          </Col>
        </Row>

      </Container>
    );
  }
}

class Mission extends Component {
  state = { missions: this.props.state.missions }

  render() {
    return (
      <div style={{ marginLeft: "15px" }}>
        <h1>Missions</h1>

        <ButtonToolbar>
          <ToggleButtonGroup type="radio" name="options">
            {Object.keys(this.state.missions).map(mission => (
              <ToggleButton
                size="md"
                variant={mission === this.props.state.selectedMission ? "dark" : "outline-dark"}
                style={{ height: "50px", lineHeight: "2.2" }}
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
      list: nextProps.state.missions[nextProps.state.selectedMission].tasks
    });
  }
  state = {
    list: this.props.state.missions[this.props.state.selectedMission].tasks
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
                variant="outline-danger"
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
      list: nextProps.state.tasks[nextProps.state.selectedTask]
    });
  }

  findRobotsWithSimpleaction(sa) {
    let select = []
    let robots = this.state.robots
    Object.keys(robots).forEach(robot => {
      robots[robot].simpleactions.forEach(simpleaction => {
        if (sa.name === simpleaction.name)
          select.push(<option> {robot} </option>)
      })
    })
    return select
  }

  printNumSequence(sa) {
    let num = (sa.id + 1)
    this.state.robots[sa.robot].simpleactions.forEach(simpleaction => {
      if (simpleaction.name === sa.name)
        if (simpleaction.type === "notify" || simpleaction.type === "wait")
          num = (sa.id + 1) + "*"
    })
    return num
  }

  simpleactionNoArguments(sa) {
    let noArgs = false
    this.state.robots[sa.robot].simpleactions.forEach(simpleaction => {
      if (sa.name === simpleaction.name)
        if (simpleaction.numArgs === 0)
          noArgs = true
    })
    return noArgs
  }

  state = {
    robots: this.props.state.robots,
    list: this.props.state.missions[this.props.state.selectedMission].tasks
  }

  render() {
    this.props.state.missions[this.props.state.selectedMission].tasks.forEach(task => {
      if (task.name === this.props.state.selectedTask)
        this.state.list = task.simpleactions
    })
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
            group="shared"
          >
            {this.state.list.map(sa => (
              <ListGroup horizontal>
                <div style={{ minWidth: "25px", marginTop: "5px", border: "" }}>
                  {this.printNumSequence(sa)}
                </div>

                <ListGroupItem style={{ width: "250px", overflow: "scroll" }}>
                  {makeReadable(sa.name)}
                </ListGroupItem>
                <Form>
                  {this.simpleactionNoArguments(sa) ?
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
                    {this.findRobotsWithSimpleaction(sa)})}
                  </Form.Control>
                </Form>

                <Button style={{ marginLeft: "5px" }} onClick={this.props.handleRemoveSimpleaction(sa)} variant="outline-danger">
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
  state = {
    robots: this.props.state.robots,
    selectedRobot: this.props.state.selectedRobot,
    list: this.props.state.robots[this.props.state.selectedRobot].simpleactions
  }

  handleRobotClick = name => event => {
    this.setState({ selectedRobot: name, list: this.state.robots[name].simpleactions });
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

        <ListGroup style={{ overflow: "scroll" }}>
          <ListGroupItem>
            Language: {this.state.robots[this.state.selectedRobot].language}
          </ListGroupItem>

          <ListGroupItem>
            Port: {this.state.robots[this.state.selectedRobot].port}
          </ListGroupItem>

          <div style={{ marginBottom: "15px" }}></div>

          <ReactSortable
            list={this.state.list}
            setList={newState => this.setState({ list: newState })}
            sort={false}
            group={{ name: 'shared', pull: 'clone', put: false }}
          >
            {this.state.list.map(sa => <ListGroupItem>{makeReadable(sa.name)}</ListGroupItem>)}
          </ReactSortable>
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
      <Form inline style={{ marginTop: "55px", marginLeft: "15px" }} onSubmit={this.props.handleAddNewMission(this.state.missionName)}>
        <Form.Group >
          <Form.Control onChange={this.handleNameChange} required placeholder="Mission name" type="input" />

          <Button type="submit" variant="outline-dark">
            Add new mission
          </Button>
        </Form.Group>
      </Form>
    )
  }
}

function makeReadable(saName) {
  saName = saName.replace(/_/g, " ")
  return saName.charAt(0).toUpperCase() + saName.slice(1)
}

function sendMission(state) {
  console.log('Sending request')
  fetch('http://localhost:5000/controller', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(state.currentMission)
  })
    .then(res => console.log(res))
    .catch(console.log)
}

export default App;
