import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import UploadPage from '../pages/Upload';

const RouterAPP : React.FC= () => {
    return <Router>
    <Switch>
      <Route path="/" >
        <UploadPage />
      </Route>
    </Switch>
  </Router>
}

export default RouterAPP;