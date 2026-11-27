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
 * Authors: Alexandr Saltykov, Pavel Grafkin, Vitaly Koulakov, Anton Gackovka
 * Created: March 3, 2017
 *
 */

import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { get } from 'lodash';
import { submissionError } from 'modules/Auth/accountFields';
import login from 'modules/Auth/actions/login';
import { forms, paths, messages } from 'modules/Auth/const';
import presenter from './presenter';

interface IResetStateProps {
  email: string;
  token: string;
}

interface IResetDispatchProps {
  goToLogin: Function;
}

interface IResetProps extends IResetStateProps, IResetDispatchProps {
  doSubmit: Function;
};

function mapStateToProps(state) {
  const fragment = new URLSearchParams(get(state, 'routing.locationBeforeTransitions.hash', '').slice(1));
  const email = fragment.get('email') || get(state, 'routing.locationBeforeTransitions.query.email', '');
  const token = fragment.get('token') || get(state, 'routing.locationBeforeTransitions.query.token', '');

  return {
    email,
    token,
  };
}

const mapDispatchToProps = () => ({
  // Reload the principal after a reset, including when another account is signed in.
  goToLogin: () => window.location.replace(paths.login({ message: messages.RESET_SUCCESS })),
});

function mergeProps(
  stateProps: IResetStateProps,
  dispatchProps: IResetDispatchProps,
  ownProps: {}
): IResetProps {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    doSubmit({ password }) {
      const promise = login.resetPassword({
        password,
        email: stateProps.email,
        token: stateProps.token,
      });
      return promise.payload.promise.then(() => dispatchProps.goToLogin()).catch(error => {
        throw submissionError(error, 'Could not reset your password.');
      });
    },
  };
}

const FormReset = reduxForm({
  form: forms.reset,
})(presenter);

export default connect<IResetStateProps, IResetDispatchProps, {}>(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)(FormReset);
