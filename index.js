/**
 * Author: Simon Studen
 *
 * This is the JS file that controls the responsiveness of my porfolio
 * website's home page. It includes handling clicks on certain elements
 * and toggling the hamburger menu for small screens and phones.
 */

'use strict';
(function() {

  window.addEventListener('load', init);

  /** intitialize event handlers necessary at page load */
  function init() {
    toggleNavMenu();
  }

  /**
   * open or close the navbar hamburger menu when visible
   * Note: only visible on small windows/screens and mobile devices
   */
  function toggleNavMenu() {
    qs('.navbar-burger').addEventListener('click', () => {
      qs('.navbar-menu').classList.toggle('is-active');
      qs('.navbar-burger').classList.toggle('is-active');
    });
  }

  /**
   * shorthand for querySelector function
   * @param {string} selector - selector to query for
   * @return {object} first dom object matching passed selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();