import { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { ModalUtils } from 'arachne-ui-components';
import actions from 'modules/Vocabulary/actions';
import { modal } from 'modules/Vocabulary/const';
import presenter, { IRestoreAvailability } from './presenter';

interface IStateProps {
  bundle: { id?: number };
  availability: IRestoreAvailability;
  isOpened: boolean;
}

interface IDispatchProps {
  close: () => any;
  regenerateCurrent: (id: number) => Promise<any>;
  load: () => any;
}

interface IContainerProps extends IStateProps, IDispatchProps {
  modal: string;
}

const emptyAvailability: IRestoreAvailability = {
  originalVersionAvailable: false,
  originalVersion: '',
  currentVersion: '',
  delta: false,
};

class ModalRestoreUnavailable extends Component<IContainerProps, { isSaving: boolean; error: string }> {
  state = {
    isSaving: false,
    error: '',
  };

  constructor(props) {
    super(props);
    this.generateCurrent = this.generateCurrent.bind(this);
  }

  componentDidUpdate(previousProps: IContainerProps) {
    if (this.props.isOpened && !previousProps.isOpened) {
      this.setState({ isSaving: false, error: '' });
    }
  }

  generateCurrent() {
    if (!this.props.bundle.id) {
      return;
    }
    this.setState({ isSaving: true, error: '' });
    return this.props.regenerateCurrent(this.props.bundle.id)
      .then(() => {
        this.props.close();
        this.setState({ isSaving: false });
        return this.props.load();
      }, error => {
        this.setState({
          isSaving: false,
          error: error && error.message
            ? error.message
            : 'The current-version package could not be generated. Please try again.',
        });
      });
  }

  render() {
    return presenter({
      modal: this.props.modal,
      availability: this.props.availability,
      close: this.props.close,
      generateCurrent: this.generateCurrent,
      isSaving: this.state.isSaving,
      error: this.state.error,
    });
  }
}

function mapStateToProps(state: any): IStateProps {
  return {
    bundle: get(state, `modal.${modal.restoreUnavailable}.data.bundle`, {}),
    availability: get(state, `modal.${modal.restoreUnavailable}.data.availability`, emptyAvailability),
    isOpened: get(state, `modal.${modal.restoreUnavailable}.isOpened`, false),
  };
}

const mapDispatchToProps = {
  close: () => ModalUtils.actions.toggle(modal.restoreUnavailable, false),
  regenerateCurrent: actions.history.regenerateCurrent,
  load: actions.history.load,
};

const ReduxModalWindow = ModalUtils.connect({ name: modal.restoreUnavailable })(ModalRestoreUnavailable);

export default connect<IStateProps, IDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(ReduxModalWindow);
