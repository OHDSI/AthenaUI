import * as React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { Button, FormError, FormInput, Panel } from 'arachne-ui-components';
import { get } from 'lodash';
import API from 'services/Api';
import BEMHelper from 'services/BemHelper';
import core from 'modules/Auth/actions/core';
import { revokeLocalSession } from 'modules/Auth/actions/logout';
import { paths, messages } from 'modules/Auth/const';

require('./style.scss');

interface Props {
  backUrl: string;
  message: string;
  hasSession: boolean;
  username: string;
  signedOut: () => void;
  signedIn: (token: string, backUrl: string) => void;
}

class LocalLogin extends React.Component<Props, { pending: boolean; error: string }> {
  state = { pending: false, error: '' };

  submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (this.state.pending) {
      return;
    }
    const fields = event.currentTarget.elements;
    const email = (fields.namedItem('email') as HTMLInputElement).value.trim();
    const password = (fields.namedItem('password') as HTMLInputElement).value;
    this.setState({ pending: true, error: '' });
    try {
      const response = await API.service('users/login').create({ email, password });
      const token = get(response, 'result.token');
      if (typeof token !== 'string' || !token) {
        throw new Error('Missing login token');
      }
      this.props.signedIn(token, this.props.backUrl);
    } catch (error) {
      this.setState({ pending: false, error: error.errorMessage || 'Could not sign in. Please try again.' });
    }
  };

  switchAccount = async () => {
    if (this.state.pending) {
      return;
    }
    this.setState({ pending: true, error: '' });
    try {
      await revokeLocalSession();
      this.props.signedOut();
      // Start the next account with fresh, user-specific application state.
      window.location.reload();
    } catch (error) {
      this.setState({ pending: false, error: 'Could not sign out. Please try again.' });
    }
  };

  render() {
    const classes = BEMHelper('login');
    const notices = {
      [messages.EMAIL_CONFIRMED]: this.props.hasSession ? 'Email confirmed.' : 'Email confirmed. You can now sign in.',
      [messages.REMIND_SUCCESS]: 'Check your email for a reset link.',
      [messages.RESET_SUCCESS]: 'Password updated.',
    };
    const message = notices[this.props.message];
    const notice = typeof message === 'string' && <p {...classes('text', 'success')} role="status">{message}</p>;
    if (this.props.hasSession) {
      return (
        <div {...classes()}>
          <Panel title="Athena account">
            <div {...classes('modal-content')}>
              {notice}
              <p {...classes('text')}>
                {this.props.username ? 'You are signed in as ' + this.props.username + '.' : 'This browser has a saved Athena session.'}
              </p>
              {this.props.username && <Button {...classes('login')} link={this.props.backUrl || '/'}>Continue with this account</Button>}
              <Button {...classes('register')} onClick={this.switchAccount} disabled={this.state.pending}>
                {this.state.pending ? 'Signing out…' : 'Sign out and use another account'}
              </Button>
              {this.state.error && <div role="alert"><FormError error={this.state.error} /></div>}
            </div>
          </Panel>
        </div>
      );
    }
    return (
      <div {...classes()}>
        <Panel title="Sign in to Athena">
          <form {...classes('modal-content')} onSubmit={this.submit}>
            {notice}
            <FormInput
              {...classes('email')}
              mods={['bordered']}
              type="email"
              placeholder="Email"
              input={{ name: 'email', 'aria-label': 'Email', autoComplete: 'username', required: true }}
              meta={{ submitting: this.state.pending }}
            />
            <FormInput
              mods={['bordered']}
              type="password"
              placeholder="Password"
              input={{ name: 'password', 'aria-label': 'Password', autoComplete: 'current-password', required: true }}
              meta={{ submitting: this.state.pending }}
            />
            {this.state.error && <div role="alert"><FormError error={this.state.error} /></div>}
            <Button {...classes('login')} type="submit" disabled={this.state.pending}>
              {this.state.pending ? 'Signing in…' : 'Sign in'}
            </Button>
            <Button {...classes('register')} link={paths.register()}>Register</Button>
            <Button link={paths.remindPassword()}>Remind password</Button>
          </form>
        </Panel>
      </div>
    );
  }
}

export default connect(
  state => ({
    hasSession: !!get(state, 'auth.core.token'),
    username: get(state, 'auth.principal.data.username', ''),
    backUrl: get(state, 'auth.core.backUrl', '/'),
    message: get(state, 'routing.locationBeforeTransitions.query.message', ''),
  }),
  dispatch => ({
    signedOut() {
      dispatch(core.setToken(null));
    },
    signedIn(token: string, backUrl: string) {
      dispatch(core.setToken(token));
      dispatch(core.setBackUrl('/'));
      dispatch(replace(backUrl || '/'));
    },
  })
)(LocalLogin);
