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

const getRawVocs = (state: Object) => get(state, 'modal.editPermission.data.vocabularies', []) || [];

const newestFirst = (field: string) => (left: any, right: any) =>
  (Date.parse(right[field]) || 0) - (Date.parse(left[field]) || 0);

const getVocabularies = createSelector(
    getRawVocs,
    (rawResults: Array<any>) => rawResults
      .filter(voc => voc.status === licenseStatuses.APPROVED)
      .sort(newestFirst('grantedAt'))
      .map((voc) => ({
        label: voc.code,
        value: voc.licenseId,
        grantedAt: voc.grantedAt,
        grantedBy: voc.grantedBy,
      })),
  );
const getPendingVocabularies = createSelector(
  getRawVocs,
  (rawResults: Array<any>) => rawResults
    .filter(voc => voc.status === licenseStatuses.PENDING)
    .sort(newestFirst('requestDate'))
    .map((voc) => ({
      ...voc,
      name: voc.code,
    })),
);

export default {
  getVocabularies,
  getPendingVocabularies,
};
