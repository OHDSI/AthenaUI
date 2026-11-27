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

import { Component } from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import { push } from 'react-router-redux';
import { get } from 'lodash';
import { forms } from 'modules/Auth/const';
import professionalTypes from 'modules/Auth/actions/professionalTypes';
import countries from 'modules/Auth/actions/countries';
import provinces from 'modules/Auth/actions/provinces';
import presenter from './presenter';
import selectors from './selectors';

interface Option {
  value: string;
  label: string;
}

interface Props {
  isUserAuthed: boolean;
  countries: Option[];
  countryId: string;
  loadProfessionalTypes: Function;
  goToRoot: Function;
  clearProvince: Function;
  searchCountries: Function;
}

class Register extends Component<Props, { country: Option; province: Option; suggestions: Option[] }> {
  state = { country: null as Option, province: null as Option, suggestions: [] as Option[] };
  private provinceRequest = 0;

  componentWillMount() {
    if (this.props.isUserAuthed) this.props.goToRoot();
    this.props.loadProfessionalTypes();
  }

  componentDidUpdate(previous: Props) {
    if (this.props.countryId !== previous.countryId) this.searchProvinces({});
  }

  componentWillUnmount() {
    this.provinceRequest++;
  }

  searchProvinces = ({ query = '' }) => {
    const request = ++this.provinceRequest;
    const countryId = this.props.countryId;
    if (!countryId) return;
    // A late response for a previous country or search must not populate the dropdown.
    return provinces.query({ countryId, query: query || '' }).payload.promise.then(response => {
      if (request === this.provinceRequest) {
        this.setState({ suggestions: response.result.map(p => ({ label: p.name, value: p.isoCode })) });
      }
    }).catch(() => {
      if (request === this.provinceRequest) this.setState({ suggestions: [] });
    });
  };

  storeCountry = (id: string) => {
    if (id === this.props.countryId) return;
    this.provinceRequest++;
    this.props.clearProvince();
    this.setState({
      country: this.props.countries.find(c => c.value === id),
      province: null,
      suggestions: [],
    });
  };

  render() {
    const { country, province, suggestions } = this.state;
    return presenter({
      ...this.props,
      countries: withSelection(this.props.countries, country),
      provinces: withSelection(suggestions, province),
      storeCountry: this.storeCountry,
      storeProvince: id => this.setState({ province: suggestions.find(p => p.value === id) }),
      searchProvinces: this.searchProvinces,
    });
  }
}

function withSelection(options: Option[], selected: Option) {
  return selected && !options.some(option => option.value === selected.value) ? [selected, ...options] : options;
}

export default connect(state => ({
  isUserAuthed: !!get(state, 'auth.core.token'),
  countries: selectors.getCountries(state),
  countryId: get(state, 'form.' + forms.register + '.values.address.country'),
}), {
  goToRoot: () => push('/'),
  loadProfessionalTypes: professionalTypes.load,
  searchCountries: ({ query }) => countries.query({ query: query || '' }),
  clearProvince: () => change(forms.register, 'address.stateProvince', null),
})(Register);
