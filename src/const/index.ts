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

const authTokenName = 'Athena-Auth-Token';
const loginPath = '/auth/login';

/**
 * Shared target name for the single sign-on popup.
 *
 * Login and logout must use the same name so the browser reuses one window. Opening logout
 * under a different name leaves the login popup behind, still showing the identity provider,
 * and the next sign-in reuses that stale window instead of starting a new request.
 */
const ssoWindowName = 'athena-sso';
const ssoWindowFeatures = 'width=600,height=450,scrollbars=no';

export {
	authTokenName,
	loginPath,
	ssoWindowName,
	ssoWindowFeatures,
};
