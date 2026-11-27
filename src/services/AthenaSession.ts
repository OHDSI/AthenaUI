/*
 * Copyright 2018 Odysseus Data Services, inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

const COOKIE_NAME = '__Host-athena_js_session_v11';
const COOKIE_MAX_AGE_SECONDS = 3 * 24 * 60 * 60;
const TOKEN_HEX_LENGTH = 32;

const PROTECTION_ERROR_CODE = 'ATHENA_BROWSER_CHECK_FAILED';
const PROTECTION_FAILURE_EVENT = 'athena:browser-check-failed';

let lifecycleListenersInstalled = false;
let protectionFailureDetected = false;

function getDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const prefix = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].replace(/^\s+/, '');
    if (cookie.indexOf(prefix) === 0) {
      return cookie.substring(prefix.length);
    }
  }

  return null;
}

function randomHex(bytesLength: number): string {
  const bytes = new Uint8Array(bytesLength);
  const browserCrypto = typeof window !== 'undefined' && window.crypto;

  if (browserCrypto && browserCrypto.getRandomValues) {
    browserCrypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let value = '';
  for (let i = 0; i < bytes.length; i++) {
    const part = bytes[i].toString(16);
    value += part.length === 1 ? `0${part}` : part;
  }
  return value;
}

function generateCookieValue(): string {
  return `${getDateString()}_${randomHex(TOKEN_HEX_LENGTH / 2)}`;
}

function isCurrentCookie(value: string | null): boolean {
  if (!value) {
    return false;
  }

  const pattern = new RegExp(`^${getDateString()}_[a-f0-9]{${TOKEN_HEX_LENGTH}}$`, 'i');
  return pattern.test(value);
}

function writeCookie(value: string): void {
  const expires = new Date(Date.now() + COOKIE_MAX_AGE_SECONDS * 1000);
  document.cookie = [
    `${COOKIE_NAME}=${value}`,
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    `Expires=${expires.toUTCString()}`,
    'Path=/',
    'SameSite=Lax',
    'Secure',
  ].join('; ');
}

function ensureAthenaSessionCookie(force: boolean = false): boolean {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  if (force || !isCurrentCookie(readCookie(COOKIE_NAME))) {
    writeCookie(generateCookieValue());
  }

  return isCurrentCookie(readCookie(COOKIE_NAME));
}

function getProtectionErrorCode(error: any, response?: any): string {
  if (error && error.data && error.data.errorCode) {
    return error.data.errorCode;
  }
  if (error && error.errorCode) {
    return error.errorCode;
  }

  const candidateResponse = response || (error && error.response);
  if (candidateResponse && candidateResponse.body) {
    const body = candidateResponse.body;
    const bodyCode = body.errorCode || (body.data && body.data.errorCode);
    if (bodyCode) {
      return bodyCode;
    }
  }

  // Apache's inline ErrorDocument is served as text/html even though its body
  // is JSON, so Superagent does not populate response.body before retrying.
  if (candidateResponse && candidateResponse.text) {
    try {
      const body = JSON.parse(candidateResponse.text);
      return body.errorCode || (body.data && body.data.errorCode) || '';
    } catch (e) {
      return '';
    }
  }

  return '';
}

function isAthenaProtectionError(error: any, response?: any): boolean {
  return getProtectionErrorCode(error, response) === PROTECTION_ERROR_CODE;
}

function notifyAthenaProtectionFailure(): void {
  if (typeof window === 'undefined') {
    return;
  }

  protectionFailureDetected = true;
  const event = document.createEvent('Event');
  event.initEvent(PROTECTION_FAILURE_EVENT, false, false);
  window.dispatchEvent(event);
}

function hasAthenaProtectionFailure(): boolean {
  return protectionFailureDetected;
}

function refreshWhenVisible(): void {
  if (typeof document === 'undefined' || !document.visibilityState || document.visibilityState === 'visible') {
    ensureAthenaSessionCookie();
  }
}

function initAthenaSessionProtection(): void {
  ensureAthenaSessionCookie();

  if (lifecycleListenersInstalled || typeof window === 'undefined') {
    return;
  }

  lifecycleListenersInstalled = true;
  window.addEventListener('focus', refreshWhenVisible);
  window.addEventListener('pageshow', refreshWhenVisible);
  window.addEventListener('online', refreshWhenVisible);
  document.addEventListener('visibilitychange', refreshWhenVisible);
}

export {
  PROTECTION_FAILURE_EVENT,
  ensureAthenaSessionCookie,
  hasAthenaProtectionFailure,
  initAthenaSessionProtection,
  isAthenaProtectionError,
  notifyAthenaProtectionFailure,
};
