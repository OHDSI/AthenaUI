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

import {connect} from 'react-redux';

import actions from 'modules/Vocabulary/actions';
import Presenter, {IDownloadBundleStateProps, IDownloadBundle, IDownloadBundleDispatch} from "./presenter";
import {ohdsiApi} from 'services/Api';
import {Component} from "react";

interface IDownloadBundleRoute {
    routeParams: {
        uuid: string;
    };
}


const apiRoot = ohdsiApi.apiHost;

class DownloadBundle extends Component<IDownloadBundle, { error: string }> {
    constructor() {
        super();
        this.state = {
            error: null
        };

        this.showError = this.showError.bind(this);
        this.saveBundle = this.saveBundle.bind(this);
    }

    componentDidMount(): void {
        this.saveBundle();
    }

    showError(errorMessage) {
        this.setState({
            error: errorMessage
        });
    }

    saveBundle() {
        const bundleUuid = this.props.bundleUuid;
        this.props.checkBundleAvailabilityByUuid(bundleUuid).then(({accessible}) => {
            if (accessible) {
                window.open(this.props.bundleUrl, '_blank');
            } else {
                this.showError("Sorry, but your account does not have all the required licenses for this bundle");
            }
        });
    }

    render() {
        return Presenter({
            ...this.props,
            error: this.state.error,
            saveBundle: this.saveBundle,
        })
    }

}

const mapDispatchToProps = {
    checkBundleAvailabilityByUuid: actions.download.checkBundleAvailabilityByUuid,
};

function mapStateToProps(state: Object, ownProps: IDownloadBundleRoute): IDownloadBundleStateProps {
    const bundleUuid = ownProps.routeParams.uuid;
    const bundleUrl = `${apiRoot}/vocabularies/zipped/${bundleUuid}`;
    return {bundleUuid, bundleUrl};
}

function mergeProps(stateProps: IDownloadBundleStateProps, dipatchProps: IDownloadBundleDispatch, ownProps): IDownloadBundle {
    return {
        ...stateProps,
        ...dipatchProps,
    }
}

export default connect<IDownloadBundleStateProps, IDownloadBundleDispatch, {}>(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(DownloadBundle);