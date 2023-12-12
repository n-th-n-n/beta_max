import React from 'react';
import {
  Route,
  Link
} from 'react-router-dom';
import { withRouter } from 'react-router';



class Nav extends React.Component {
  constructor(props) {
    super(props);
  }





  render() {
    return (
      <div className="Nav">
        <Link to="/">Home</Link>
      </div>
    );
  }
};

export default withRouter(Nav);
