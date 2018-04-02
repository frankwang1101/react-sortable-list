import React, { Component } from 'react';
import Sortable from './Sortable'
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <br />
        <div className="sort-panel">
          <Sortable cols={4} height={140} pad={10}>
            <div className="green" ></div>
            <div className="red" ></div>
            <div className="yellow" ></div>
            <div className="grey" ></div>
            <div className="blue" ></div>
            <div className="brown" ></div>
            <div className="lightgreen" ></div>
          </Sortable>
        </div>
      </div>
    );
  }
}

export default App;
