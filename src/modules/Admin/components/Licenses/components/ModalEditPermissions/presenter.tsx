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
import BEMHelper from 'services/BemHelper';
import {
	Modal,
  TabbedPane,
  RadioButton,
  Button,
} from 'arachne-ui-components';
import { Vocabulary } from 'modules/Admin/components/Licenses/types';
import { Field } from 'redux-form';
import * as moment from 'moment';
import { fullDateFormat } from 'const/formats';

require('./style.scss');

function VocRadioButton ({ options, input }) {
  const classes = BEMHelper('pending-radio-btn');

  return <RadioButton
    {...classes()}
    isChecked={input.value === options.value}
    onChange={() => input.onChange(options.value)}
  />;
}

function GrantedPermission({ input, option }) {
  const selected = input.value || [];
  const value = option.value.toString();
  const checked = selected.indexOf(value) >= 0;

  return <div {...BEMHelper('granted-permission')()}>
    <input
      type='checkbox'
      checked={checked}
      onChange={() => input.onChange(checked
        ? selected.filter(item => item !== value)
        : selected.concat(value))}
    />
    <span {...BEMHelper('granted-permission')('name')}>{option.label}</span>
    <span {...BEMHelper('granted-permission')('date')}>
      {option.grantedAt ? moment(option.grantedAt).format(fullDateFormat) : 'Unknown'}
    </span>
    <span {...BEMHelper('granted-permission')('grantor')}>
      {option.grantedBy
        ? `#${option.grantedBy.id} - ${option.grantedBy.name}`
        : 'Unknown (legacy record)'}
    </span>
  </div>;
}

function ModalEditPermissions(props) {
  const {
    modal,
    vocabularies,
    user,
    doSubmit,
    pendingVocabularies,
    handleSubmit,
    cancelPendingRequest,
  } = props;
  const classes = BEMHelper('edit-permissions');

  const sections = [
    {
      label: `Granted (${vocabularies.length})`,
      content: <div {...classes('tab-content')}>
        <div {...classes('granted-header')}>
          <span {...classes('granted-name')}>Vocabulary</span>
          <span {...classes('granted-date')}>Granted at</span>
          <span {...classes('granted-by')}>Granted by</span>
        </div>
        {vocabularies.map(vocabulary =>
          <Field
            key={vocabulary.value}
            component={GrantedPermission}
            name='vocabularies'
            option={vocabulary}
          />
        )}
      </div>,
    },
    {
      label: `Pending (${pendingVocabularies.length})`,
      content: <div {...classes('tab-content')}>
        <div {...classes('pending-voc')}>
          <span {...classes('pending-voc-name')}></span>
          <div {...classes('pending-date')}>Requested at</div>
          <div {...classes('pending-button')}>Allow</div>
          <div {...classes('pending-button')}>Forbid</div>
          <div {...classes('pending-cancel')}></div>
        </div>
        {pendingVocabularies.map((voc: Vocabulary) =>
          <div {...classes('pending-voc')} key={voc.licenseId}>
            <span {...classes('pending-voc-name')}>{voc.name}</span>
            <div {...classes('pending-date')}>
              {voc.requestDate ? moment(voc.requestDate).format(fullDateFormat) : 'Unknown'}
            </div>
            <div {...classes('pending-button')}>
              <Field
                component={VocRadioButton}
                name={`pendingVocabs[${voc.licenseId}]`}
                options={{ value: true }}
              />
            </div>
            <div {...classes('pending-button')}>
              <Field
                component={VocRadioButton}
                name={`pendingVocabs[${voc.licenseId}]`}
                options={{ value: false }}
              />
            </div>
            <div {...classes('pending-cancel')}>
              <Button type='button' onClick={() => cancelPendingRequest(voc)}>Cancel request</Button>
            </div>
          </div>
        )}
      </div>
    },
  ];

  return (
    <div {...classes()}>
      <Modal modal={modal} title={`Edit permissions for ${user.name} (#${user.id})`} mods={['no-padding']}>
        <form
          onSubmit={handleSubmit(doSubmit)}
          {...props}
        >
          {pendingVocabularies.length > 0
            ? <TabbedPane sections={sections} />
            : sections[0].content
          }
          <div {...classes('submit-button-wrapper')}>
            <Button {...classes('submit-button')} type='submit' mods={['submit', 'rounded']}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>);
}

export default ModalEditPermissions;
