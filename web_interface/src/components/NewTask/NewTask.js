import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';


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

export default NewTask