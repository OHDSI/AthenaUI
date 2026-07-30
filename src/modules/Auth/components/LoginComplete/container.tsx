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
import { Component } from 'react';
import { connect } from 'react-redux';
import * as get from 'lodash/get';
import actions from 'modules/Auth/actions';
import { readTokenFromHash } from './token';

interface ILoginCompleteDispatch {
	setAuthToken: Function;
}

interface ILoginCompleteProps extends ILoginCompleteDispatch {};

interface ILoginCompleteState {
	authToken: string;
}

/**
 * Landing page of the SSO popup. The back end redirects here with the token in the URL
 * fragment; this hands it to the opener and closes the window.
 *
 * The token arrives after the '#', not as a query parameter, because a fragment is never sent
 * to a server — see readTokenFromHash. It is therefore read from window.location.hash rather
 * than from the router state, which only carries what the server could see.
 */
class LoginComplete extends Component<ILoginCompleteProps, ILoginCompleteState> {

	constructor(props: ILoginCompleteProps) {
		super(props);
		this.state = { authToken: '' };
	}

	componentWillMount() {
		const authToken = readTokenFromHash(get(window, 'location.hash', ''));
		this.setState({ authToken });

		if (!authToken) {
			return;
		}

		this.props.setAuthToken(authToken);

		// Drop the token from the address bar so it does not sit in this window's history
		// entry. Best effort: replaceState is unavailable in very old browsers, and losing
		// the cosmetic cleanup must not prevent the login from completing.
		try {
			window.history.replaceState(null, '', get(window, 'location.pathname', ''));
		} catch (e) {
			// ignored on purpose
		}

		// The popup is opened by the main window, which is waiting for this message. Guard
		// the opener: someone reaching this URL directly has no window to post to, and an
		// exception here would replace the message below with a blank page.
		if (window.opener) {
			window.opener.postMessage({
				data: authToken,
				type: 'loginResult',
			}, get(window, 'location.origin'));
			window.close();
		}
	}

	render() {
		return (
			<div>
				{this.state.authToken ?
					<span>You have successfuly logged in. Close the window and refresh page.</span>
					:
					<span>An error occured. Try once more.</span>
				}
			</div>
		);
	}
}

const mapDispatchToProps = {
	setAuthToken: actions.core.setToken,
};

export default connect<{}, ILoginCompleteDispatch, {}>(
	null,
	mapDispatchToProps
)(LoginComplete);
