/*
 *
 * Copyright 2018 Odysseus Data Services, inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 * Company: Odysseus Data Services, Inc.
 * Product Owner/Architecture: Gregory Klebanov
 * Authors: Alexandr Saltykov
 * Created: July 4, 2018
 *
 */

import { Component } from 'react';
import { connect } from 'react-redux';
import actions from 'modules/Vocabulary/actions';
import { ModalUtils } from 'arachne-ui-components';
import { modal, paths, forms } from 'modules/Vocabulary/const';
import { get } from 'lodash';
import presenter from './presenter';
import { IModalProps, IModalStateProps, IModalDispatchProps } from './presenter';
import * as URI from "urijs";
import { reduxForm, reset } from 'redux-form';

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
    const emailList = get(state, `modal.${modal.share}.data.bundle.downloadShareDTO.email`, '');
    const emails = emailList.split(', ');
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
        const { emailList } = values;
        const data = { emailList: emailList.filter(i => !!i).join(',') }
        dispatchProps.shareBundle(data, id);
        dispatchProps.close();
    },

  };
}

let ReduxModalWindow = reduxForm({ form: forms.share, enableReinitialize: true })(ModalShare);
ReduxModalWindow =  ModalUtils.connect({ name: modal.share })(ReduxModalWindow);

export default connect<IModalStateProps, IModalDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)
(ReduxModalWindow);
