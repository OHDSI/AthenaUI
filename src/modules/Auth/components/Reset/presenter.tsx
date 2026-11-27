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

import * as React from 'react';
import {
  Button,
  Panel,
  FormError,
  LoadingPanel,
} from 'arachne-ui-components';
import { AccountForm, newPassword, reminderEmail } from 'modules/Auth/accountFields';
import BEMHelper from 'services/BemHelper';
import { paths } from 'modules/Auth/const';

require('./style.scss');

function Reset(props) {
  const classes = BEMHelper('reset');
  const {
    isLoading,
  } = props;
  const hasLink = !reminderEmail.validate(props.email) && props.token && props.token.trim();
  const submitBtn = {
    label: 'Save new password',
    loadingLabel: 'Saving…',
  };

  return (
    <div {...classes()}>
      <Panel
        {...classes('form-panel')}
        title="Reset password"
      >
        <div {...classes('form-container')}>          
          {hasLink ? <AccountForm
            fields={[newPassword]}
            submitBtn={submitBtn}
            {...props}
          /> : <div role="alert">
            <FormError error="This reset link is invalid or incomplete. Request a new link." />
            <Button link={paths.remindPassword()}>Request a reset link</Button>
          </div>}
          <Button {...classes('back-btn')} link={paths.login()}>Back to login</Button>
          <LoadingPanel active={isLoading} />
        </div>
      </Panel>
    </div>
  );
}

export default Reset;


