import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ListGroup, ListGroupItem, ToggleButton, ToggleButtonGroup, ButtonToolbar } from 'react-bootstrap';
import { ReactSortable } from "react-sortablejs";


class Robot extends Component {
  state = {
    list: this.props.state.robots[this.props.state.selectedRobot].simpleactions
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      list: nextProps.state.robots[nextProps.state.selectedRobot].simpleactions
    })
  }

  render() {
    return (
      <div>
        <h3>
          Robot simpleactions
          </h3>

        <ButtonToolbar style={{ marginBottom: "15px" }}>
          <ToggleButtonGroup type="radio" name="options">
            {Object.keys(this.props.state.robots).map(robot => (
              <ToggleButton
                size="sm"
                variant={robot === this.props.state.selectedRobot ? "dark" : "outline-dark"}
                onClick={this.props.handleRobotClick(robot)}
              >
                {robot}
              </ToggleButton>))}
          </ToggleButtonGroup>
        </ButtonToolbar>

        <ListGroup style={{ overflow: "scroll" }}>
          <ListGroupItem>
            Language: {this.props.state.robots[this.props.state.selectedRobot].language}
          </ListGroupItem>

          <ListGroupItem>
            Port: {this.props.state.robots[this.props.state.selectedRobot].port}
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

function makeReadable(saName) {
  saName = saName.replace(/_/g, " ")
  return saName.charAt(0).toUpperCase() + saName.slice(1)
}


export default Robot