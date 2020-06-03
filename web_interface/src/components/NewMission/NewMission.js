import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';


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

  export default NewMission