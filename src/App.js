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
            <div className="green" onClick={_ => console.log('click green')}></div>
            <div className="red" onClick={_ => console.log('click red')}></div>
            <div className="yellow" onClick={_ => console.log('click yellow')}></div>
            <div className="grey" onClick={_ => console.log('click grey')}></div>
            <div className="blue" onClick={_ => console.log('click blue')}></div>
            <div className="brown" onClick={_ => console.log('click brown')}></div>
            <div className="lightgreen" onClick={_ => console.log('click lightgreen')}></div>
          </Sortable>
        </div>
      </div>
    );
  }
}

export default App;
