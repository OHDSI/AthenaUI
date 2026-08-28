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

import * as feathers from 'feathers/client';
import * as hooks from 'feathers-hooks';
import * as rest from 'feathers-rest-arachne/client';
import * as superagent from 'superagent';
import { get, set } from 'lodash';
import { SubmissionError } from 'redux-form';
import Auth from 'services/Auth';
import { Api as OhdsiApi } from 'ohdsi-ui-toolbox';

import { authTokenName } from 'const';

const corePath = '/api/v1';
let API = feathers();

// `String({})`, i.e. "[object Object]". feathers-errors builds the error with
// `new Error(body.message || body)`, so a response body carrying no `message`
// field gets stringified whole and the message degrades to this literal. That
// is what a plain Spring error body produces, which is why `error.message` is
// not trustworthy on its own.
const STRINGIFIED_OBJECT = String({});

/**
 * Pull a human-readable message out of an API error, across the response
 * shapes this backend can return:
 *
 *   {errorCode, errorMessage, ...}          legacy JsonResult, sent with HTTP 200
 *   {timestamp, status, error, path}        Spring's default error body
 *   {..., message}                          Spring with server.error.include-message
 */
function readErrorMessage(hook): string {
  const wrapped = get(hook, 'error.errorMessage', '');
  if (wrapped) {
    return wrapped;
  }
  const message = get(hook, 'error.message', '');
  if (message && message !== STRINGIFIED_OBJECT) {
    return message;
  }
  // `error` holds the reason phrase - "Forbidden", "Bad Request".
  return get(hook, 'error.error', '');
}

interface ApiConfig {
  getAuthToken: Function;
  onAccessDenied: Function;
};

function configure(props: ApiConfig): Promise<any> {
  /*const auth = authentication({
    header: authTokenName,
    storage: window.localStorage,
    tokenKey: authTokenName,
    // cookie: authTokenName,
    localEndpoint: '/auth/login',
    tokenEndpoint: '/auth/token',
  });*/
  const {
    getAuthToken,
    onAccessDenied
  } = props;

  API = API
    .configure(rest(corePath).superagent(superagent, {withCredentials: true}))
    .configure(hooks());
    //.configure(auth);

  API.hooks(<any>{
    before(hook) {
      const token = getAuthToken(authTokenName);
      if (token) {
        hook.params.headers = {
          ...hook.params.headers,
          [authTokenName]: token,
        }
      }
    },

    after(hook) {
      const errorMessage = get(hook, 'result.errorMessage', '');
      if (errorMessage) {
        throw new Error(errorMessage);
      }
    },

    error(hook) {
      // NB: Spring Security answers an unauthenticated request with 403, not 401,
      // so in practice this branch does not fire and there is no automatic login
      // redirect. Do not "fix" that by treating 403 as access-denied: public pages
      // call auth-gated endpoints and ignore the failure (the search start page
      // requests vocabularies/release-version), so redirecting on 403 would bounce
      // anonymous users off pages they are allowed to see. Routing already guards
      // the private pages via Auth.requireOnPathEnter.
      if (hook.error.status === 401) {
        onAccessDenied();
      } else {
        const validationErrors: any = get(hook, 'error.validatorErrors');
        if (validationErrors) {
          const errors = {
            _error: get(hook, 'error.errorMessage', ''),
          };
          Object.keys(validationErrors).forEach(reKey => set(errors, reKey, validationErrors[reKey]));
          throw new SubmissionError(errors);
        }
        // Mirror the `after` hook for non-validation failures.
        //
        // The API historically answered *every* error with HTTP 200 and an `errorMessage`
        // in the body, so the `after` hook above was the only place errors were turned
        // into a readable message. As the backend moves to real status codes, that hook
        // stops running, and without this the licence explanation in the download modal
        // would degrade to "[object Object]" - `errorMessage` is absent from a plain
        // Spring error body, and so is `message`, so feathers-errors stringifies the
        // whole body. See readErrorMessage for the shapes involved.
        //
        // This is backwards compatible: while the API still returns 200 the `after`
        // hook keeps handling errors and this branch is not reached.
        // Rewrite the message on the original error rather than throwing a new
        // one, so callers keep the rest of the error contract (status, code,
        // data, response) - the branch above relies on `status` being there.
        const errorMessage = readErrorMessage(hook);
        if (errorMessage) {
          hook.error.message = errorMessage;
          throw hook.error;
        }
      }
    }
  });

  return new Promise<void>((resolve) => {resolve();}); //API.authenticate({ strategy: 'token' }).catch(() => {}); // 
}

const ohdsiApi = new OhdsiApi();
ohdsiApi.setApiHost(corePath);
ohdsiApi.setAuthTokenHeader(authTokenName);
ohdsiApi.setUserTokenGetter(() => Auth.getAuthToken());
ohdsiApi.handleUnexpectedError = er => console.error('Oooops!.. Something went wrong :(');

export default API;
export {
  configure,
  ohdsiApi,
};