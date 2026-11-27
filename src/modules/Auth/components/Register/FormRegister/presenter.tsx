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
  Link,
  FormSelect,
  FormAutocomplete,
  LoadingPanel,
} from 'arachne-ui-components';
import { AccountForm, registrationFields as text } from 'modules/Auth/accountFields';
import { paths } from 'modules/Auth/const';
import BEMHelper from 'services/BemHelper';

require('./style.scss');

function StatefulFormAutocomplete(props) {
  const input = {
    ...props.input,
    onChange: (option) => {
      props.storeSelectedOption(option);
      return props.input.onChange(option);
    }
  };
  return <FormAutocomplete
    {...props}
    input={input}
  />;
}

const requireCountry = value => value ? undefined : 'Select a country.';
const requireProfession = value => value ? undefined : 'Select a professional type.';

function FormRegister(props) {
  const fields = [
    text.firstname,
    text.address,
    text.middlename,
    text.city,
    text.lastname,
    text.zipCode,
    text.email,
    {
      name: 'address.country',
      validate: requireCountry,
      InputComponent: {
        component: StatefulFormAutocomplete,
        props: {
          mods: ['bordered'],
          placeholder: 'Country',
          required: true,
          options: props.countries,
          fetchOptions: props.searchCountries,
          clearable: false,
          onSelectResetsInput: true,
          onBlurResetsInput: true,
          storeSelectedOption: props.storeCountry,
          tabindex: 12,
        }
      }
    },
    text.password,
    {
      name: 'address.stateProvince',
      InputComponent: {
        component: StatefulFormAutocomplete,
        props: {
          mods: ['bordered'],
          placeholder: 'State/Province',
          options: props.provinces,
          disabled: !props.countryId,
          fetchOptions: props.searchProvinces,
          clearable: false,
          onSelectResetsInput: true,
          onBlurResetsInput: true,
          storeSelectedOption: props.storeProvince,
          tabindex: 13,
        }
      }
    },
    text.organization,
    text.mobile,
    text.department,
    {
      name: 'professionalTypeId',
      validate: requireProfession,
      InputComponent: {
        component: FormSelect,
        props: {
          mods: ['bordered'],
          placeholder: 'Professional type',
          options: props.professionalTypes,
          required: true,
          tabindex: 8,
        },
      },
    },
  ];
  const submitBtn = {
    label: 'Register',
    loadingLabel: 'Registering...',
  };
  const classes = BEMHelper('form-register');

  return (
    <div {...classes()}>
      <div {...classes('title-pane')}>
        <div {...classes('column-title')}>General</div>
        <div {...classes('column-title')}>Contact Info</div>
      </div>
      <AccountForm
        fields={fields}
        submitBtn={submitBtn}
        {...props}
      />
      <span {...classes('login-caption')}>
        Already Registered? <Link to={paths.login()}>Login here</Link>
      </span>
      <LoadingPanel active={props.isLoading} />
    </div>
  );
}

export default FormRegister;
