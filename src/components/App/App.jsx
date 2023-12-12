import React from "react";
import { Route, Link } from "react-router-dom";
import { withRouter } from "react-router";

//Pages
import Home from "../../pages/Home/Home.jsx";
import Number from "../../pages/Number/Number.jsx";

// import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        <Route exact path="/" component={Home} />
        <Route exact path="/number" component={Number} />
      </div>
    );
  }
}

export default withRouter(App);
