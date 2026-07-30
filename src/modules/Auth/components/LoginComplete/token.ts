/*
 *
 * Copyright 2026 Odysseus Data Services, Inc. (EPAM Systems company)
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
 * Created: July 30, 2026
 *
 */

/**
 * The key the back end writes the token under. Must match TOKEN_FRAGMENT_KEY in
 * SamlAuthenticationSuccessHandler.
 */
export const tokenFragmentKey = 'token';

/**
 * Reads the auth token out of a URL fragment, e.g. '#token=eyJhbGci...'.
 *
 * The back end used to pass the token as a query parameter, which put the JWT into the
 * server's access log, into any proxy log, and into the Referer header of requests this page
 * made. A fragment is never sent to a server, so it is delivered after the '#' instead.
 *
 * Split on the *first* '=' only: a JWT is base64url, whose alphabet has no '=' except as
 * padding, but a padded segment would otherwise be truncated.
 *
 * Kept apart from the component so it can be exercised on its own.
 */
export function readTokenFromHash(hash: string): string {
	if (!hash) {
		return '';
	}

	const parts = hash.replace(/^#/, '').split('&');

	for (const part of parts) {
		const separator = part.indexOf('=');
		if (separator < 0) {
			continue;
		}
		if (part.substring(0, separator) === tokenFragmentKey) {
			const value = part.substring(separator + 1);
			// A JWT needs no escaping in a fragment, so this is normally a no-op. It matters
			// only if the value ever gains a character that does.
			try {
				return decodeURIComponent(value);
			} catch (e) {
				return value;
			}
		}
	}

	return '';
}
