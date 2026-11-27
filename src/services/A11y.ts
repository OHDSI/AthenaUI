import * as React from 'react';

/**
 * Props that make a non-button element (a <div>, <span>, or an <a> without
 * href) reachable with Tab and operable with Enter and Space, the same as a
 * native <button>. Spread them next to the element's existing onClick.
 */
function buttonProps(onActivate: Function) {
  return {
    role: 'button',
    tabIndex: 0,
    onKeyDown: (event: React.KeyboardEvent<any>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        // Space would otherwise scroll the page.
        event.preventDefault();
        onActivate(event);
      }
    },
  };
}

export { buttonProps };
