import * as React from 'react';

import { request, setAuthHeader } from '../helper/axios_helper';

import LoginForm from './authorization/LoginForm';
import WelcomeContent from './WelcomeContent';
import Buttons from './Buttons';
import App from './App';

export default class AppContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      componentToShow: 'login'
    };
  }

  login = () => {
    this.setState({ componentToShow: 'login' });
  };

  logout = () => {
    this.setState({ componentToShow: 'welcome' });
    setAuthHeader(null);
  };

  onLogin = (e, username, password) => {
    e.preventDefault();
    request('POST', '/login', {
      login: username,
      password: password
    })
      .then((response) => {
        setAuthHeader(response.data.token);
        this.setState({ componentToShow: 'messages' });
      })
      .catch(() => {
        setAuthHeader(null);
        this.setState({ componentToShow: 'welcome' });
      });
  };

  onRegister = (event, firstName, lastName, username, password) => {
    event.preventDefault();
    request('POST', '/register', {
      firstName: firstName,
      lastName: lastName,
      login: username,
      password: password
    })
      .then((response) => {
        setAuthHeader(response.data.token);
        this.setState({ componentToShow: 'messages' });
      })
      .catch(() => {
        setAuthHeader(null);
        this.setState({ componentToShow: 'welcome' });
      });
  };

  render() {
    return (
      <>
        <Buttons login={this.login} logout={this.logout} />

        {this.state.componentToShow === 'welcome' && <WelcomeContent />}
        {this.state.componentToShow === 'login' && (
          <LoginForm onLogin={this.onLogin} onRegister={this.onRegister} />
        )}
        {this.state.componentToShow === 'messages' && <App />}
      </>
    );
  }
}
