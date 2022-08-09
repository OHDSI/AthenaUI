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

import { createSelector } from 'reselect';
import { get } from 'lodash';
import { licenseStatuses } from 'const/vocabulary';
import moment from 'moment';
import { commonDateFormat } from 'const/formats';

const getRawVocs = (state: Object) => get(state, 'modal.editPermission.data.vocabularies', []) || [];

const getVocabularies = createSelector(
    getRawVocs,
    (rawResults: Array<any>) => rawResults
      .filter(voc => voc.status === licenseStatuses.APPROVED)
      .map((voc) => ({
        label: `${voc.code}${voc.expiredDate ? ' (Expired date: ' + moment(voc.expiredDate).format(commonDateFormat) + ')' : ''}`,
        value: voc.licenseId,
      })),
  );
const getPendingVocabularies = createSelector(
  getRawVocs,
  (rawResults: Array<any>) => rawResults
    .filter(voc => voc.status === licenseStatuses.PENDING)
    .map((voc) => ({
      ...voc,
      name: voc.code,
    })),
);

export default {
  getVocabularies,
  getPendingVocabularies,
};
