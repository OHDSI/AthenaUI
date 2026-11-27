import { Component } from 'react';
import { connect } from 'react-redux';
import actions from 'modules/Vocabulary/actions';
import { ModalUtils } from 'arachne-ui-components';
import { modal, paths, forms } from 'modules/Vocabulary/const';
import { get } from 'lodash';
import presenter from './presenter';
import { IModalProps, IModalStateProps, IModalDispatchProps } from './presenter';
import * as URI from "urijs";
import { reduxForm, reset, SubmissionError } from 'redux-form';

class ModalShare extends Component<IModalProps, {}> {

  componentDidUpdate(prevProps) {
    if (!!this.props.isOpened && !prevProps.isOpened) {
      this.props.reset();
    }
  }
  render() {
    return presenter(this.props);
  }
}

function mapStateToProps(state: any): IModalStateProps {
    const bundle = get(state, `modal.${modal.share}.data.bundle`, {});
    const emailList = String(get(state, `modal.${modal.share}.data.bundle.shareEmails`) || '');
    const emails = emailList ? emailList.split(', ') : [];
  return {
    isOpened: get(state, `modal.${modal.share}.isOpened`, false),
    bundle: get(state, `modal.${modal.share}.data.bundle`, {}),
    initialValues: {
        emailList: emails,
      }

  };
}

const mapDispatchToProps = {
  close: () => ModalUtils.actions.toggle(modal.share, false),
  shareBundle: (values, id) => actions.history.share(values, id),
  reset: () => reset(forms.share),
};

function mergeProps(
  stateProps: IModalStateProps,
  dispatchProps: IModalDispatchProps,
  ownProps
  ): IModalProps {
  return {
    ...stateProps,
    ...ownProps,
    ...dispatchProps,

    share(values) {
        const { id } = stateProps.bundle;
        const emails: string[] = (values.emailList || []).map(email => (email || '').trim());
        if (emails.length > 100 || emails.some(email => !email || email.length > 255 || email.includes(','))) {
          throw new SubmissionError({ _error: 'Enter up to 100 email addresses, one per field, or remove all fields to clear sharing.' });
        }
        return dispatchProps.shareBundle({ emailList: emails.join(',') }, id)
          .then(() => dispatchProps.close())
          .catch(() => { throw new SubmissionError({ _error: 'Could not update sharing. Check the addresses and try again.' }); });
    },

  };
}

let ReduxModalWindow = reduxForm({ form: forms.share, enableReinitialize: true })<any>(ModalShare);
ReduxModalWindow =  ModalUtils.connect({ name: modal.share })(ReduxModalWindow);

export default connect<IModalStateProps, IModalDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)
(ReduxModalWindow);
