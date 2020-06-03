import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToggleButton, ToggleButtonGroup, ButtonToolbar } from 'react-bootstrap';



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

  export default Mission