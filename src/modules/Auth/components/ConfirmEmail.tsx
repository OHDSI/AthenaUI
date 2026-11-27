import * as React from 'react';
import { Button, FormError, Panel } from 'arachne-ui-components';
import API from 'services/Api';
import BEMHelper from 'services/BemHelper';
import { messages, paths } from 'modules/Auth/const';

require('./Login/style.scss');

export default class ConfirmEmail extends React.Component<{}, { pending: boolean; error: string }> {
  private token = new URLSearchParams(window.location.hash.slice(1)).get('token');
  state = { pending: false, error: '' };

  confirm = async () => {
    if (!this.token || this.state.pending) return;
    this.setState({ pending: true, error: '' });
    try {
      await API.service('users/confirm-email').create({ token: this.token });
      window.location.replace(paths.login({ message: messages.EMAIL_CONFIRMED }));
    } catch (error) {
      this.setState({ pending: false, error: error.errorMessage || error.message || 'Could not confirm your email.' });
    }
  };

  render() {
    const classes = BEMHelper('login');
    const error = this.state.error || (!this.token && 'This confirmation link is incomplete.');
    return <div {...classes()}>
      <Panel title="Confirm your email address">
        <div {...classes('modal-content')}>
          {error && <div role="alert"><FormError error={error} /></div>}
          {this.token && <Button {...classes('login')} disabled={this.state.pending} onClick={this.confirm}>
            {this.state.pending ? 'Confirming…' : 'Confirm email address'}
          </Button>}
          <Button link={paths.login()}>Back to login</Button>
        </div>
      </Panel>
    </div>;
  }
}
