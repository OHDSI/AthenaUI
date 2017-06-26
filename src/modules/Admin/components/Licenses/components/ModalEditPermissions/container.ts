import { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import actions from 'modules/Admin/actions';
import { ModalUtils } from 'arachne-components';
import { modal, forms } from 'modules/Admin/const';
import { get, difference } from 'lodash';
import presenter from './presenter';
import selectors from './selectors';
import { Vocabulary, User } from 'modules/Admin/components/Licenses/types';

interface IModalStateProps {
  vocabularies: Array<Vocabulary>;
  initialValues: {
    vocabularies: Array<string>;
  };
  user: User;
};
interface IModalDispatchProps {
  close: () => (dispatch: Function) => any;
  remove: (id: string) => (dispatch: Function) => any;
  loadLicenses: () => (dispatch: Function) => any;
};
interface IModalProps extends IModalStateProps, IModalDispatchProps {
  doSubmit: (vocabs: Array<Vocabulary>) => Promise<any>;
};

class ModalEditPermissions extends Component<IModalProps, {}> {
  render() {
    return presenter(this.props);
  }
}

function mapStateToProps(state: any): IModalStateProps {
  const vocabularies = selectors.getVocabularies(state);
  const user = get(state, 'modal.editPermission.data.user.name', {
    id: -1,
    name: 'Anonymous'
  });

	return {
    vocabularies,
    initialValues: {
      vocabularies: vocabularies.map(v => v.value.toString()),
    },
    user,
  };
}

const mapDispatchToProps = {
  close: () => ModalUtils.actions.toggle(modal.editPermission, false),
  remove: actions.licenses.remove,
  loadLicenses: actions.licenses.load,
};

function mergeProps(
  stateProps: IModalStateProps,
  dispatchProps: IModalDispatchProps,
  ownProps
  ) {
  return {
    ...stateProps,
    ...ownProps,
    ...dispatchProps,
    doSubmit: ({ vocabularies }) => {
      const promises = [];
      difference(stateProps.initialValues.vocabularies, vocabularies).forEach((licenseId) => {
        promises.push(dispatchProps.remove(licenseId));
      });
      const promise = Promise.all(promises);
      promise
        .then(() => dispatchProps.close())
        .then(() => dispatchProps.loadLicenses())
        .catch(() => {});

      return promise;
    },
  };
}

let ReduxModalWindow = reduxForm({
  form: forms.editPermission,
  enableReinitialize: true,
})(ModalEditPermissions);
ReduxModalWindow = ModalUtils.connect({ name: modal.editPermission })(ReduxModalWindow);

export default connect<IModalStateProps, IModalDispatchProps, {}>(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)
(ReduxModalWindow);
