/**
 * Author: Simon Studen
 *
 * This is the JS file that controls the responsiveness of the classes.html page.
 * It includes handling clicks on certain elements, toggling the hamburger
 * menu for small screens and phones, and handling fetch requests to the app.js web server.
 */

'use strict';
(function() {

  window.addEventListener('load', init);

  /** intitialize event handlers necessary at page load */
  function init() {
    toggleNavMenu();
    initFilterButton();
    initInputBehavior();
    makeQuartersListRequest();
    renderClassCards();
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
   * Initializes button for filtering classes, which clears and rerenders
   * class cards when clicked
   */
  function initFilterButton() {
    id('apply-filters-btn').addEventListener('click', () => {
      id('cards-container').innerHTML = '';
      renderClassCards();
    });
  }

  /**
   * Initializes
   */
  function initInputBehavior() {
    id('class-code-input').addEventListener('input', () => {
      if (id('class-code-input').value) {
        toggleOtherFilter(true);
      } else {
        toggleOtherFilter(false);
      }
    });
  }

  /**
   * toggles the choose a quarter dropdown based on if there is
   * text in the class code input or not
   * @param {boolean} isDisabled - flag for if the dropdown should be disabled
   */
  function toggleOtherFilter(isDisabled) {
    id('quarter-selector').disabled = isDisabled;
  }

  /**
   * makes a fetch request to the classcode list endpoint
   * @return {Array} - array of classcode strings
   */
  function makeClasscodeListRequest() {
    let data = fetch('/classcodes')
      .then(statusCheck)
      .then(resp => resp.text())
      .then(processClasscodeList)
      .catch(handleError);
    return data;
  }

  /**
   * splits the plaintext string by newlines and returns a list of strings
   * @param {*} responseData - plaintext data passed in from the fetch request
   * @return {Array} - array of classcode strings
   */
  function processClasscodeList(responseData) {
    return responseData.split('\n');
  }

  /**
   * makes a fetch reqeust to the quarters list endpoint
   */
  function makeQuartersListRequest() {
    fetch('/quarters')
      .then(statusCheck)
      .then(resp => resp.text())
      .then(processQuartersList)
      .catch(handleError);
  }

  /**
   * splits the data from the fetch request into a list of strings
   * and populates the select a quarter dropdowm
   * @param {string} responseData - data from the fetch request
   */
  function processQuartersList(responseData) {
    let quartersList = responseData.split('\n');
    for (let i = 0; i < quartersList.length; i++) {
      let quarterNames = quartersList[i].split(':');
      let selectOption = gen('option');
      selectOption.value = quarterNames[0];
      selectOption.textContent = quarterNames[1];
      id('quarter-selector').appendChild(selectOption);
    }
  }

  /**
   * makes a request to the class object endpoint
   * @param {string} classcode - code of the class we want to fetch
   * @param {string} selectedQuarter - selected quarter we want to fetch classes for,
   * empty string if unspecified
   */
  function makeClassObjectRequest(classcode, selectedQuarter) {
    fetch(`/classes/${classcode}`)
      .then(statusCheck)
      .then(resp => resp.json())
      .then((res) => {
        renderClassObject(res, selectedQuarter);
      })
      .catch(handleError);
  }

  /**
   * renders the class object from the fetch reuest as a card element on the DOM
   * @param {JSON} responseData - data from the fetch request
   * @param {string} selectedQuarter - - selected quarter we want to fetch classes for,
   * empty string if unspecified
   */
  function renderClassObject(responseData, selectedQuarter) {
    if (selectedQuarter === responseData.quarter || !selectedQuarter) {

      let card = gen('div');
      card.classList.add('card');
      card.classList.add('class-card');

      let cardHeader = gen('header');
      cardHeader.classList.add('card-header');
      card.appendChild(cardHeader);

      let title = gen('p');
      title.classList.add('card-header-title');
      title.classList.add('uw-text');

      title.textContent = `${responseData['course-name']} (${responseData.credits} credits)`;
      cardHeader.appendChild(title);
      card.appendChild(cardHeader);

      let cardContent = gen('div');
      cardContent.classList.add('card-content');

      let content = gen('div');
      content.classList.add('content');

      let qtrTaken = gen('p');
      qtrTaken.textContent = `Quarter Taken: ${responseData.quarter}`;
      content.appendChild(qtrTaken);

      let classDescription = gen('p');
      classDescription.textContent = responseData.description;
      content.appendChild(classDescription);
      cardContent.appendChild(content);
      card.appendChild(cardContent);

      id('cards-container').appendChild(card);
    }
  }

  /**
   * renders multiple class cards on the DOM based on selected filters
   */
  async function renderClassCards() {
    let inputValue = id('class-code-input').value;
    let selectedQuarter = '';
    if (inputValue) {
      makeClassObjectRequest(inputValue, '');
    } else {
      let selector = id('quarter-selector');
      if (selector.selectedIndex !== 0) {
        selectedQuarter = selector.options[selector.selectedIndex].value;
      }

      let classcodeList = await makeClasscodeListRequest();

      for (let i = 0; i < classcodeList.length; i++) {
        makeClassObjectRequest(classcodeList[i], selectedQuarter);
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
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * handles errors thrown from invalid fetch requests,
   * displaying a message to the user that an error occured
   * @param {string} message - error message
   */
  function handleError(message) {
    let notificationContainer = gen('div');
    notificationContainer.id = "error-alert";
    notificationContainer.classList.add('notification');
    notificationContainer.classList.add('is-danger');
    let exitButton = gen('button');
    exitButton.classList.add('delete');
    notificationContainer.appendChild(exitButton);
    notificationContainer.textContent = message;
    id('cards-container').insertAdjacentElement('beforebegin', notificationContainer);
    setTimeout(() => {
      qs('main').removeChild(id('error-alert'));
    }, 5000);
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