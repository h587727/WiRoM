import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';
import { ReactSortable } from "react-sortablejs";

class Task extends Component {
  state = {
    robots: this.props.state.robots,
    list: this.props.state.missions[this.props.state.selectedMission].tasks
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      robots: nextProps.state.robots,
      list: nextProps.state.missions[nextProps.state.selectedMission].tasks
    });
  }

  robotsThatCanExecute(task) {
    let select = [<option> {"--"} </option>]
    let robots = this.state.robots
    let target = task.simpleactions.length
    
    Object.keys(robots).forEach(robot => {
      let saCount = 0
      robots[robot].simpleactions.forEach(simpleaction => {
        for (let sa in task.simpleactions) {
          if (task.simpleactions[sa].name === simpleaction.name){
            saCount = saCount + 1
          }
        }
      })
      
      if (saCount === target)
        select.push(<option> {robot} </option>)
    })
    return select
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

              <Form>
                  <Form.Control
                    as="select"
                    value={task.robot ? task.robot : "--"}
                    onChange={this.props.handleTaskAllocationChange(task)}
                    style={{ marginLeft: "5px", width: "120px" }}>
                    {this.robotsThatCanExecute(task)}
                  </Form.Control>
                </Form>

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

export default Task