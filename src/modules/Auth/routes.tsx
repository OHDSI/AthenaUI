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
import { PlainRoute } from 'react-router';

function rootRoute(path: string): PlainRoute {
  return {
    path,
    component: ({ children }) => children,
    indexRoute: {
      onEnter: (nextState, replace) => {
        replace(path + '/login');
      }
    },
    childRoutes: [
      {
        path: 'login',
        component: require('./components/Login').default,
      },
      {
        path: 'complete',
        component: require('./components/LoginComplete').default,
      },
      {
        path: 'register',
        component: require('./components/Register').default,
      },
      {
        path: 'welcome',
        component: require('./components/Welcome').default,
      },
      {
        path: 'remind-password',
        component: require('./components/Remind').default,
      },
      {
        path: 'reset-password',
        component: require('./components/Reset').default,
      },
    ],
  };
}

export default rootRoute;
