import { Component } from 'react';
import { connect } from 'react-redux';
import { push as goToPage } from 'react-router-redux';
import actions from 'modules/Vocabulary/actions';
import { reduxForm, change as reduxFormChange, SubmissionError } from 'redux-form';
import { ModalUtils } from 'arachne-components';
import { modal, forms, paths } from 'modules/Vocabulary/const';
import { get } from 'lodash';
import selectors from 'modules/Vocabulary/components/List/components/Results/selectors';
import presenter from './presenter';
import { IModalProps, IModalStateProps, IModalDispatchProps } from './presenter';

class ModalConfirmDownload extends Component<IModalProps, {}> {
  render() {
    return presenter(this.props);
  }
}

function mapStateToProps(state: any): IModalStateProps {
  const formSelectedVocabularies = get(state, `form.${forms.download}.values.vocabulary`, []);
  const selectedVocabIds = [];
  formSelectedVocabularies.map((voc: any, id: number) => {
    if (voc === true) {
      selectedVocabIds.push(id);
    }
  });
  const vocabs = selectors.getVocabs(state);
  const selectedVocabs = vocabs.filter(voc => selectedVocabIds.includes(voc.id));
  const cdmVersion = get(state, `form.${forms.downloadSettings}.values.cdmVersion`, '4.5') || '4.5';
  const bundleName = get(state, 'form.bundle.values.bundleName', '');

	return {
    selectedVocabs,
    selectedVocabIds,
    cdmVersion,
    bundleName,
  };
}

const mapDispatchToProps = {
  requestDownload: actions.download.requestDownload,
  remove: (id: number) => reduxFormChange(forms.download, `vocabulary[${id}]`, false),
  close: () => ModalUtils.actions.toggle(modal.download, false),
  showResult: () => ModalUtils.actions.toggle(modal.downloadResult, true),
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
    removeVocabulary: (id: number) => {
      dispatchProps.remove(id);
      if (stateProps.selectedVocabs.length === 1) {
        dispatchProps.close();
      }
    },
    download: () => {
      const promise = dispatchProps.requestDownload({
        cdmVersion: stateProps.cdmVersion,
        ids: stateProps.selectedVocabIds.join(','),
        name: stateProps.bundleName,
      })
      .then(() => dispatchProps.close())
      .then(() => dispatchProps.showResult())
      .catch(({ message }) => {
        throw new SubmissionError({
          _error: message,
        });
      });

      return promise;
    },
  };
}

let ReduxModalWindow = reduxForm({ form: forms.bundle })(ModalConfirmDownload);
ReduxModalWindow = ModalUtils.connect({ name: modal.download })(ReduxModalWindow);

export default connect<IModalStateProps, IModalDispatchProps, {}>(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)
(ReduxModalWindow);
