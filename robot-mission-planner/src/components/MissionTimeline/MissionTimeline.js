import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, } from 'react-bootstrap';
import { Graph } from "react-d3-graph";

// the graph configuration, you only need to pass down properties
// that you want to override, otherwise default ones will be used
const myConfig = {
    nodeHighlightBehavior: true,
    staticGraph: true,
    automaticRearrangeAfterDropNode: true,
    directed: true,
    width: "955px",
    d3: {
        linklength: 2000,
        linkStrength: 1
    },
    node: {
        color: "#7e11c3",
        size: 200,
        highlightStrokeColor: "#cf0404",
        labelProperty: myCustomLabelBuilder,
        renderLabel: true
    },
    link: {
        color: "#d3d3d3",
        //renderLabel:true,
        labelProperty: "label",
        highlightColor: "#cf0404",
    },
};

function myCustomLabelBuilder(node) {
    return makeReadable(node.id.split(";")[0]);
}

function makeReadable(saName) {
    saName = saName.replace(/_/g, " ")
    return saName.charAt(0).toUpperCase() + saName.slice(1)
}
  
function nodeName(name, x, y) {
    return name + ";" + x + "," + y
}

class MissionTimeline extends Component {
    state = {
        graphData: [],
        showTimeline: false,
        currentMission: this.props.state.currentMission,
        availableSimpleactions: this.props.state.availableSimpleactions
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            currentMission: nextProps.state.currentMission,
            availableSimpleactions: nextProps.state.availableSimpleactions
        })
        this.generateGraphData()
    }

    generateGraphData() {
        let mission = this.state.currentMission
        let x = 50
        let y = 100
        let data = { nodes: [], links: [] }
        let waitNodes = []
        let notifyNodes = []
        Object.keys(mission).forEach(robot => {
            data["nodes"].push({ id: robot, x: x, y: y, symbolType: "wye" })
            let prevNode = robot
            x += 120
            mission[robot].simpleactions.forEach(sa => {
                this.state.availableSimpleactions.forEach(availSa => {
                    if (availSa.robot === robot && availSa.name === sa.name) {
                        if (availSa.type === "wait") {
                            waitNodes.push({ name: sa.name, x: x, y: y })
                        }
                        if (availSa.type === "notify") {
                            notifyNodes.push({ name: sa.name, x: x, y: y })
                        }
                        console.log(waitNodes)
                        console.log(notifyNodes)
                        console.log(waitNodes.length > 0 && notifyNodes.length > 0)
                        if (waitNodes.length > 0 && notifyNodes.length > 0) {
                            let waitNode = waitNodes.shift()
                            let notifyNode = notifyNodes.shift()
                            
                            data["links"].push({
                                source: nodeName(notifyNode.name, notifyNode.x, notifyNode.y),
                                target: nodeName(waitNode.name, waitNode.x, waitNode.y)
                            })
                            notifyNode = waitNode = ""
                        }
                    }
                })
                data["nodes"].push({ id: nodeName(sa.name, x, y), x: x, y: y })
                data["links"].push({ label: sa.name, source: prevNode, target: nodeName(sa.name, x, y) })
                prevNode = nodeName(sa.name, x, y)
                x += 120
            })
            x = 50
            y += 100
        })
        this.setState({ graphData: data })
    }

    render() {
        return (
            <div>
                {this.state.showTimeline &&
                    <div className="shadow p-3 mb-5 bg-white rounded">
                        <Graph
                            id="mission-planner" // id is mandatory, if no id is defined rd3g will throw an error
                            data={this.state.graphData}
                            config={myConfig}>
                        </Graph>
                    </div>
                }

                <Button style={{marginBottom: "10px"}} variant="outline-dark" onClick={() => {
                    this.generateGraphData();
                    this.setState({ showTimeline: !this.state.showTimeline })
                }}>
                    {this.state.showTimeline ? "Hide mission timeline" : "Show mission timeline"}
                </Button>
            </div>
        )
    }
}

export default MissionTimeline