import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import { ReactSortable } from "react-sortablejs";

class Task extends Component {
  state = {
    list: this.props.state.missions[this.props.state.selectedMission].tasks
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      list: nextProps.state.missions[nextProps.state.selectedMission].tasks
    });
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

export default Task