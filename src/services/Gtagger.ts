import { Gtagger } from 'gtagger';

const trackingId = 'UA-116831829-1';

export function StartAnalytics() {
  if (__DEV__ || /^\/auth\/(reset-password|confirm-email)\/?$/.test(window.location.pathname)) {
    return false;
  }
  Gtagger.initialize(trackingId);
}