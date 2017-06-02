import API from 'services/Api';
import services from '../apiServices';

import { actionTypes } from 'modules/SearchTerms/const';
import { IAppAction } from 'actions';

type searchParams = {
  sort?: string;
  order?: string;

  pageSize: number;
  page?: number;

  query?: Array<string> | string;
  vocabulary?: Array<string> | string;
  domain?: Array<string> | string;
  conceptClass?: Array<string> | string;
  standardConcept?: Array<string> | string;
  invalidReason?: Array<string> | string;
};

function pageSizeUpdated(pageSize: number): IAppAction<{ pageSize: number }> {
  return {
    type: actionTypes.SEARCH_PAGE_SIZE_UPDATED,
    payload: {
      pageSize
    },
  };
}

function termFiltersChanged(termFilters: {}): IAppAction<{}> {
  return {
    type: actionTypes.SET_TERM_FILTERS,
    payload: termFilters,

  };
}

function changePageSize(pageSize: number) {
  return pageSizeUpdated(pageSize);
}

function load(params: searchParams) {
	return services.terms.find({ query: params });
}

function fetch(id: number) {
  return services.terms.get(id);
}

function fetchRelations(conceptId: number, levels = 10) {
  return services.relations.get(conceptId, {query: {depth: levels}});
}

function fetchRelationships(conceptId: number, standards = false) {
  return services.relationships.get(conceptId, {query: {std: standards}});
}

function setTermFilters(termFilters: Object) {
  console.log('setTermFilters', termFilters);
  return termFiltersChanged(termFilters);
}

export default {
  changePageSize,
  load,
  fetch,
  fetchRelations,
  fetchRelationships,
  setTermFilters,
};

export { searchParams };
