import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, ListGroup, ListGroupItem } from 'react-bootstrap';
import { ReactSortable } from "react-sortablejs";

class Simpleaction extends Component {
  state = {
    robots: this.props.state.robots,
    list: this.getSimpleactions(this.props.state.missions[this.props.state.selectedMission], this.props.state.selectedTask)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      robots: nextProps.state.robots,
      list: this.getSimpleactions(nextProps.state.missions[nextProps.state.selectedMission], nextProps.state.selectedTask)
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

  getSimpleactions(mission, selectedTask) {
    let simpleactions = []
  
    mission.tasks.forEach(task => {
      if (task.name === selectedTask) {
        simpleactions = task.simpleactions
      }
    })
    return simpleactions
  }

  render() {
    if (this.state.list === undefined)
      return (<h3>Simpleactions</h3>)
    else
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
                        onChange={this.props.handleSimpleactionArgsChange(sa)}>
                      </Form.Control>
                      :
                      <Form.Control as="input" style={{ marginLeft: "5px", width: "120px", overflow: "scroll" }}
                        value={sa.args}
                        onChange={this.props.handleSimpleactionArgsChange(sa)}>
                      </Form.Control>
                    }
                  </Form>

                  <Form>
                    <Form.Control
                      as="select"
                      value={sa.robot}
                      onChange={this.props.handleSimpleactionRobotChange(sa)}
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


function makeReadable(saName) {
  saName = saName.replace(/_/g, " ")
  return saName.charAt(0).toUpperCase() + saName.slice(1)
}


export default Simpleaction