/*
 *
 * Copyright 2020 Odysseus Data Services, inc.
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
 * Authors: Alexandr Cumarav
 * Created: March 23, 2020
 *
 */

import * as React from 'react';
import {Link} from 'arachne-ui-components';
import BEMHelper from "../../../../services/BemHelper";

require('./style.scss');

interface IDownloadBundleStateProps {
    bundleUrl: string,
    bundleUuid: string,
    error?: string,
}

interface IDownloadBundleDispatch {
    checkBundleAvailabilityByUuid(uuid: String): any,
    saveBundle(): any
}

interface IDownloadBundle extends IDownloadBundleStateProps, IDownloadBundleDispatch {

}

function DownloadBundle(props: IDownloadBundle) {

    const classes = BEMHelper('download-bundle');

    return (
        <div {...classes()}>
            {!props.error && <div>
                <span>Your download should start automatically or </span>
                <Link onClick={props.saveBundle}>click to start</Link>
            </div>}

            {props.error && <div className={'error'} >{props.error}</div>}

        </div>
    );

}

export default DownloadBundle;
export {
    IDownloadBundle,
    IDownloadBundleStateProps,
    IDownloadBundleDispatch,
};