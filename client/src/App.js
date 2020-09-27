import React from "react";
import socketIOClient from "socket.io-client";
import "./App.css";

const localHost = "http://127.0.0.1:1337";
const socket = socketIOClient(localHost);

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      messagesReceived: [],
      messagesSent: [],
      currentMsg: "",
      receivedObj: {},
    };
  }

  componentDidMount() {
    // Emit message to server
    socket.emit("message", "hello from client-side socket");
    // Message from server
    socket.on("message", (msg) => {
      console.log(msg);
    });
    //smsObject from server
    socket.on("smsObject", (data) => {
      console.log(data);
      let text = data.Body;
      let allMessages = [...this.state.messagesReceived, text];
      this.setState({ messagesReceived: allMessages, receivedObj: data });
    });
  }

  handleInput = (e) => {
    this.setState({
      currentMsg: e.target.value,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    // Emit message to server after submission
    socket.emit("smsMessage", this.state.currentMsg);
    let allMessages = [...this.state.messagesSent, this.state.currentMsg];
    //clear the input and updated all messagesSent
    this.setState({
      currentMsg: "",
      messagesSent: allMessages,
    });
  };

  render() {
    return (
      <div className="app">
        <div className="input-container">
          <form onSubmit={this.handleSubmit}>
            <input
              className="chat-container"
              id="currentMsg"
              value={this.state.currentMsg}
              onChange={(e) => this.handleInput(e)}
            ></input>
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
          <div>
            <hr />
            <div className="messages-container">
              <p>All messages sent:</p>
              <ul>
                {this.state.messagesSent &&
                  this.state.messagesSent.map((message, idx) => {
                    return (
                      <li key={idx} className="message">
                        {message}
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
          <div>
            <hr />
            <p>
              New Message received:{" "}
              {JSON.stringify(this.state.receivedObj.Body)}
            </p>
            <div className="messages-container">
              <p>All messages received:</p>
              <ul>
                {this.state.messagesReceived &&
                  this.state.messagesReceived.map((message, idx) => {
                    return (
                      <li key={idx} className="message">
                        {message}
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
