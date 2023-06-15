/**
 * Author: Simon Studen
 *
 * This is the JS file that controls the responsiveness of my Random Artwork
 * Generator webpage. It includes handling clicks on certain elements, toggling
 * the hamburger menu for small screens and phones, and fetching data from The
 * Metropolitan Museum of Art Collection API.
 */

'use strict';
(function() {

  const OBJ_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';
  const DPMT_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/departments';
  const SEARCH_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search?';

  const TOTAL_ART_OBJECTS = 471581;

  let queriedID = 0;

  window.addEventListener('load', init);

  /** intitialize event handlers necessary at page load */
  function init() {
    toggleNavMenu();
    initRequestButtonEvent();
    fetchDepartmentOptions();
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
   * initializes the event that fetchs data from the The Metropolitan
   * Museum of Art Collection API when the "Show Me a New Piece" button
   * is clicked
   */
  function initRequestButtonEvent() {
    id('request-btn').addEventListener('click', makeObjectRequest);
  }

  /**
   * initalizes the event that fetches the department options when the
   * "Choose a department" dropdown is selected
   */
  function fetchDepartmentOptions() {
    id('department-selector').addEventListener('click', makeDepartmentRequest);
  }

  /**
   * fetches a list of department names and ids from the Departments Endpoint
   * of The Metropolitan Museum of Art Collection API to populate the
   * "Choose a department" dropdown
   */
  function makeDepartmentRequest() {
    fetch(DPMT_BASE_URL)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(processDepartmentData)
      .catch(handleError);
  }

  /**
   * processes the JSON returned from the request from the Departments Endpoint
   * @param {JSON} responseData - JSON data from the Departments Endpoint
   */
  function processDepartmentData(responseData) {
    let departments = responseData.departments;
    for (let i = 0; i < departments.length; i++) {
      let selectOption = gen('option');
      selectOption.textContent = departments[i].displayName;
      selectOption.value = departments[i].departmentId;
      id('department-selector').appendChild(selectOption);
    }

    // only want the fetch to occur the first time the user clicks on the select element
    id('department-selector').removeEventListener('click', makeDepartmentRequest);
  }

  /**
   * makes a fetch request to the Objects Endpoint of The Metropolitan
   * Museum of Art Collection API. Chooses a random art object given the
   * selected department and/or inputted query string.
   */
  function makeObjectRequest() {
    let selector = id('department-selector');
    let queryInput = id('query-input');
    let fetchURL = '';

    // if a department hasn't been selected, select a random art object from the entire collection
    if (selector.selectedIndex === 0) {
      if (queryInput.value) {
        makeSearchRequest(0, queryInput.value);
        fetchURL = OBJ_BASE_URL + queriedID;
      } else {
        /*
         * if a department hasn't been selected and the query value is unset,
         * elect a random art object from the entire collection
         */
        fetchURL = OBJ_BASE_URL + (Math.floor(Math.random() * TOTAL_ART_OBJECTS));
      }
    } else {
      if (queryInput.value) {
        let selectedDepartmentID = selector.options[selector.selectedIndex].value;
        makeSearchRequest(selectedDepartmentID, queryInput.value);
        fetchURL = OBJ_BASE_URL + queriedID;
      } else {
        return;
      }
    }
    fetch(fetchURL)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(processObjectData)
      .catch(handleError);
  }

  /**
   * processes the JSON returned from the request from the Objects Endpoint
   * @param {JSON} responseData - JSON data fetched from Objects Endpoint
   */
  function processObjectData(responseData) {
    if (responseData.primaryImage) {
      id('artwork').src = responseData.primaryImageSmall;
      id('artwork').alt = responseData.title;

      renderNonEmptyData('artwork', responseData.title);
      renderNonEmptyData('artwork-title', responseData.title);
      renderNonEmptyData('artist', responseData.artistDisplayName);
      renderNonEmptyData('dimensions', responseData.dimensions);
      renderNonEmptyData('date-created', responseData.objectDate);
      renderNonEmptyData('medium', responseData.medium);

      let artistLifespanString = '';
      if (responseData.artistBeginDate && responseData.artistEndDate) {
        artistLifespanString = `(${responseData.artistBeginDate} - ${responseData.artistEndDate})`;
      }
      renderNonEmptyData('artist-lifespan', artistLifespanString);
    } else {
      makeObjectRequest();
    }
  }

  /**
   * renders the information about the artwork on the page, handling
   * cases where data might be missing
   * @param {string} elementID - id of the element to render data on
   * @param {string} responseDataValue - data to render on the element
   */
  function renderNonEmptyData(elementID, responseDataValue) {
    if (responseDataValue) {
      if (elementID === 'date-created') {
        id(elementID).textContent = `(${responseDataValue})`;
      } else {
        id(elementID).textContent = responseDataValue;
      }
    } else {
      if (elementID === "artist") {
        id(elementID).textContent = 'Unknown artist';
      } else if (elementID === "medium") {
        id(elementID).textContent = 'Unknown medium';
      } else if (elementID === "dimensions") {
        id(elementID).textContent = 'Unknown dimensions';
      } else {
        id(elementID).textContent = '';
      }
    }
  }

  /**
   * checks the status code returned from fetch requests and
   * throws an error if the status code is not ok
   * @param {Promise} res - result of call to fetch
   * @return {Promise} - result of the fetch request if the status was ok
   */
  async function statusCheck(res) {
    if (!res.ok) {
      makeObjectRequest();
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * makes a fetch request to the Search Endpoint of The Metropolitan
   * Museum of Art Collection API with the given departmentID and query string
   * @param {string} departmentID - id od the selected department
   * @param {string} query - user inputted query string
   */
  function makeSearchRequest(departmentID, query) {
    let fetchURL = '';
    if (departmentID) {
      fetchURL = SEARCH_BASE_URL + `hasImages=true&departmentId=${departmentID}&q=${query}`;
    } else {
      fetchURL = SEARCH_BASE_URL + `hasImages=true&q=${query}`;
    }

    fetch(fetchURL)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(processSearchData)
      .catch(handleError);
  }

  /**
   * processes the response data from the fetch request to the
   * Search Endpoint, saving a randomly selected elementID in a
   * particular subset ot the module global variable queriedID
   * @param {JSON} responseData - JSON data returnd from call to fetch
   */
  function processSearchData(responseData) {
    let objectIDs = responseData.objectIDs;
    let randomIndex = Math.floor(Math.random() * objectIDs.length);
    let randomObjectID = objectIDs[randomIndex];
    queriedID = randomObjectID;
  }

  /**
   * handles errors thrown from invalid fetch requests,
   * displaying a message to the user that an error occured
   */
  function handleError() {
    let notificationContainer = gen('div');
    notificationContainer.id = "error-alert";
    notificationContainer.classList.add('notification');
    notificationContainer.classList.add('is-danger');
    let exitButton = gen('button');
    exitButton.classList.add('delete');
    notificationContainer.textContent = "An error occured when fetching data. Retrying...";
    if (!id('error-alert')) {
      id('art-container').appendChild(notificationContainer);
      setTimeout(() => {
        id('art-container').removeChild(id('error-alert'));
      }, 2000);
    }
  }

  /**
   * shorthand for getElementById function
   * @param {string} id - id to query for
   * @return {object} dom object with the passed id
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * shorthand for querySelector function
   * @param {string} selector - selector to query for
   * @return {object} first dom object matching passed selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * shorthand for createElement function
   * @param {string} tagName - name of HTML tag to create
   * @return {object} dom object specified
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();