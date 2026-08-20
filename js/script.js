/* ==========================================================================
   GREEN TECHNOLOGY CLUB - script.js
   One shared JavaScript file loaded by all six pages.

   IMPORTANT
   Because this file runs on every page, an element such as the cookie
   banner may not exist on the page currently being viewed. Every block
   below therefore checks that an element exists before using it. Without
   that check the browser would stop running the whole file at the first
   missing element.

   SECTIONS
   00. Shared helpers          (Member 1)
   01. Cookies                 (Member 1)
   02. Local storage           (Member 2 - added later)
   03. Session storage and API (Member 3 - added later)
   ========================================================================== */


/* ==========================================================================
   00. SHARED HELPERS - Member 1
   Small pieces of behaviour that every page needs.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Footer year
   Writes the current year into the footer so it never has to be edited
   by hand.
   -------------------------------------------------------------------------- */
function setFooterYear() {
  var yearSpan = document.getElementById("footerYear");

  if (yearSpan) {
    var today = new Date();
    yearSpan.textContent = today.getFullYear();
  }
}


/* --------------------------------------------------------------------------
   Mobile menu auto-close
   On a phone the Bootstrap menu stays open after a link is tapped. This
   closes it so the visitor immediately sees the page they chose.
   -------------------------------------------------------------------------- */
function setUpMobileMenuAutoClose() {
  var navMenu = document.getElementById("gtcNavMenu");
  var navToggler = document.querySelector(".navbar-toggler");

  if (!navMenu || !navToggler) {
    return;
  }

  var navLinks = navMenu.querySelectorAll(".nav-link, .btn-gtc-accent");

  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function () {
      // The menu is only open when Bootstrap has added the "show" class.
      if (navMenu.classList.contains("show")) {
        navToggler.click();
      }
    });
  }
}


/* ==========================================================================
   01. COOKIES - Member 1
   Responsibility: remember the visitor's cookie choice and their name.

   Two cookies are used:
     gtcCookieConsent  ->  "accepted"      (proof the notice was accepted)
     gtcVisitorName    ->  the visitor's name, if they chose to give one

   Both cookies expire after 30 days.
   ========================================================================== */

var COOKIE_CONSENT_NAME = "gtcCookieConsent";
var COOKIE_VISITOR_NAME = "gtcVisitorName";
var COOKIE_LIFETIME_DAYS = 30;


/* --------------------------------------------------------------------------
   setCookie(name, value, days)
   Creates or overwrites a cookie.

   A cookie is one text string in the form:
     name=value; expires=DATE; path=/

   encodeURIComponent() is used on the value because a cookie string is
   separated by semicolons. If a visitor typed a name containing ";" or
   a space, the cookie would break. Encoding turns those characters into
   safe codes such as %3B and %20.
   -------------------------------------------------------------------------- */
function setCookie(name, value, days) {
  var expiryDate = new Date();

  // Convert days into milliseconds and add them to the current time.
  expiryDate.setTime(expiryDate.getTime() + (days * 24 * 60 * 60 * 1000));

  document.cookie = name + "=" + encodeURIComponent(value)
                  + "; expires=" + expiryDate.toUTCString()
                  + "; path=/";
}


/* --------------------------------------------------------------------------
   getCookie(name)
   Reads one cookie and returns its value, or "" if it does not exist.

   document.cookie returns every cookie in a single string, for example:
     "gtcCookieConsent=accepted; gtcVisitorName=Jun%20Yang"

   The string is split on ";" and each piece is checked for the name.
   decodeURIComponent() reverses the encoding done in setCookie().
   -------------------------------------------------------------------------- */
function getCookie(name) {
  var allCookies = document.cookie.split(";");
  var searchFor = name + "=";

  for (var i = 0; i < allCookies.length; i++) {
    var oneCookie = allCookies[i].trim();

    if (oneCookie.indexOf(searchFor) === 0) {
      return decodeURIComponent(oneCookie.substring(searchFor.length));
    }
  }

  return "";
}


/* --------------------------------------------------------------------------
   deleteCookie(name)
   A cookie cannot be removed directly. Setting its expiry date to a time
   in the past tells the browser it has already expired, so the browser
   deletes it.
   -------------------------------------------------------------------------- */
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
}


/* --------------------------------------------------------------------------
   Cookie notice
   Shown only when no consent cookie is found. Because the cookie is stored
   for the whole site, accepting it on one page also hides the notice on
   the other five pages.
   -------------------------------------------------------------------------- */
function setUpCookieBanner() {
  var banner = document.getElementById("cookieBanner");
  var acceptBtn = document.getElementById("cookieAcceptBtn");
  var dismissBtn = document.getElementById("cookieDismissBtn");

  if (!banner || !acceptBtn) {
    return;
  }

  // Show the notice only if the visitor has not accepted it before.
  if (getCookie(COOKIE_CONSENT_NAME) !== "accepted") {
    banner.hidden = false;
  }

  acceptBtn.addEventListener("click", function () {
    setCookie(COOKIE_CONSENT_NAME, "accepted", COOKIE_LIFETIME_DAYS);
    banner.hidden = true;

    // The visitor is NOT interrupted with a question here. The welcome bar
    // simply appears and offers to personalise the site, and nothing else
    // happens unless they choose to use it.
    showWelcomeBar();
  });

  // "Not now" hides the notice without saving anything, so it appears
  // again on the next page load. This is a useful contrast to show during
  // the presentation.
  if (dismissBtn) {
    dismissBtn.addEventListener("click", function () {
      banner.hidden = true;
    });
  }
}


/* --------------------------------------------------------------------------
   askForVisitorName()
   Runs only when the visitor selects "Add your name" in the welcome bar.
   The name is optional: cancelling or leaving the box empty saves nothing.
   -------------------------------------------------------------------------- */
function askForVisitorName() {
  var enteredName = prompt(
    "Enter your name to personalise this site. (You can leave this blank.)"
  );

  // prompt() returns null when Cancel is pressed.
  if (enteredName === null) {
    return;
  }

  enteredName = enteredName.trim();

  if (enteredName === "") {
    return;
  }

  // Keep the name short so the welcome bar always fits on one line.
  if (enteredName.length > 20) {
    enteredName = enteredName.substring(0, 20);
  }

  setCookie(COOKIE_VISITOR_NAME, enteredName, COOKIE_LIFETIME_DAYS);
  showWelcomeBar();
}


/* --------------------------------------------------------------------------
   Welcome bar
   Appears once the cookie notice has been accepted, and has two states:

     no name saved  ->  offers to personalise the site
     name saved     ->  greets the visitor and offers to forget the name

   Because the name lives in a cookie, the greeting follows the visitor
   across all six pages.
   -------------------------------------------------------------------------- */
function setUpWelcomeBar() {
  var nameBtn = document.getElementById("gtcNameBtn");
  var forgetBtn = document.getElementById("gtcForgetBtn");

  if (nameBtn) {
    nameBtn.addEventListener("click", askForVisitorName);
  }

  if (forgetBtn) {
    forgetBtn.addEventListener("click", function () {
      deleteCookie(COOKIE_VISITOR_NAME);
      showWelcomeBar();
    });
  }

  showWelcomeBar();
}


function showWelcomeBar() {
  var welcomeBar = document.getElementById("gtcWelcome");
  var welcomeText = document.getElementById("gtcWelcomeText");
  var nameBtn = document.getElementById("gtcNameBtn");
  var forgetBtn = document.getElementById("gtcForgetBtn");

  if (!welcomeBar || !welcomeText || !nameBtn || !forgetBtn) {
    return;
  }

  // Nothing is shown until the cookie notice has been accepted.
  if (getCookie(COOKIE_CONSENT_NAME) !== "accepted") {
    welcomeBar.hidden = true;
    return;
  }

  var savedName = getCookie(COOKIE_VISITOR_NAME);

  if (savedName === "") {
    welcomeText.textContent =
      "Cookies accepted. Add your name and this site will greet you on every page.";
    nameBtn.hidden = false;
    forgetBtn.hidden = true;
  } else {
    welcomeText.textContent = "Welcome back, " + savedName + ".";
    nameBtn.hidden = true;
    forgetBtn.hidden = false;
  }

  welcomeBar.hidden = false;
}


/* --------------------------------------------------------------------------
   Reset link in the footer
   Deletes both cookies and reloads the page, which brings the notice back.
   This makes the cookie feature easy to demonstrate repeatedly during the
   presentation without clearing the whole browser.
   -------------------------------------------------------------------------- */
function setUpCookieReset() {
  var resetBtn = document.getElementById("cookieResetBtn");

  if (!resetBtn) {
    return;
  }

  resetBtn.addEventListener("click", function () {
    var confirmed = confirm(
      "Reset your cookie preferences? The cookie notice will appear again."
    );

    if (confirmed) {
      deleteCookie(COOKIE_CONSENT_NAME);
      deleteCookie(COOKIE_VISITOR_NAME);
      location.reload();
    }
  });
}


/* ==========================================================================
   02. LOCAL STORAGE - Member 2
   Reusable registration and favourite functions used by ev.html and
   events.html will be added here.
   ========================================================================== */

/* --- MEMBER 2 CODE STARTS HERE --- */

/* --------------------------------------------------------------------------
   HOW LOCAL STORAGE IS USED ON THIS SITE

   localStorage can only hold text. To store a list of items we turn the
   list into text with JSON.stringify() before saving, and turn it back
   into a real array with JSON.parse() after reading.

   The four functions below are generic: they work for any list on any
   page. Member 3 reuses them on events.html instead of writing new ones.
   -------------------------------------------------------------------------- */

/* Read a list. Returns an empty array when nothing has been saved yet. */
function getStorageList(storageKey) {
  var savedText = localStorage.getItem(storageKey);

  if (savedText === null) {
    return [];
  }

  // If the stored text is somehow damaged, start again with an empty list
  // instead of letting the page break.
  try {
    return JSON.parse(savedText);
  } catch (error) {
    return [];
  }
}

/* Write a whole list back to localStorage. */
function saveStorageList(storageKey, list) {
  localStorage.setItem(storageKey, JSON.stringify(list));
}

/* Add one item to the end of a list and save it. */
function addToStorageList(storageKey, newItem) {
  var list = getStorageList(storageKey);
  list.push(newItem);
  saveStorageList(storageKey, list);
  return list;
}

/* Remove one item by its position in the list. When the list becomes
   empty the whole key is removed so no leftover data stays behind. */
function removeFromStorageList(storageKey, index) {
  var list = getStorageList(storageKey);
  list.splice(index, 1);

  if (list.length === 0) {
    localStorage.removeItem(storageKey);
  } else {
    saveStorageList(storageKey, list);
  }

  return list;
}

/* Delete an entire list. */
function clearStorageList(storageKey) {
  localStorage.removeItem(storageKey);
}


/* --------------------------------------------------------------------------
   REGISTRATION FUNCTIONS FOR MEMBER 3

   Member 2 writes these; the registration form on events.html calls them.
   Keeping them here means the storage logic exists in one place only.
   -------------------------------------------------------------------------- */

var STORAGE_KEY_REGISTRATIONS = "gtcRegistrations";

function saveRegistration(name, email, eventName) {
  var newRegistration = {
    name: name,
    email: email,
    event: eventName,
    savedOn: new Date().toLocaleDateString()
  };

  return addToStorageList(STORAGE_KEY_REGISTRATIONS, newRegistration);
}

function getRegistrations() {
  return getStorageList(STORAGE_KEY_REGISTRATIONS);
}

function removeRegistration(index) {
  return removeFromStorageList(STORAGE_KEY_REGISTRATIONS, index);
}

function clearRegistrations() {
  clearStorageList(STORAGE_KEY_REGISTRATIONS);
}


/* ==========================================================================
   SOLAR SAVINGS CALCULATOR - renewable.html
   Estimates how much a rooftop solar system could save each year, then
   lets the visitor keep the estimate in localStorage.
   ========================================================================== */

/* Fixed assumptions. They are also printed on the page so the visitor can
   see exactly where the numbers come from. */
var SOLAR_TARIFF = 0.50;             // RM per kWh
var SOLAR_AREA_PER_KWP = 6;          // square metres of roof per 1 kWp
var SOLAR_KWH_PER_KWP_MONTH = 120;   // kWh generated per kWp per month
var GRID_CO2_PER_KWH = 0.585;        // kg of CO2 per kWh from the grid

var STORAGE_KEY_ESTIMATES = "gtcSolarEstimates";


function setUpSolarCalculator() {
  // jQuery selector. If the form is not on this page the length is 0.
  if ($("#solarForm").length === 0) {
    return;
  }

  showSavedEstimates();

  // jQuery event handling
  $("#solarForm").on("submit", function (event) {
    event.preventDefault();   // stop the browser from reloading the page
    calculateSolarSaving();
  });

  $("#solarClearBtn").on("click", function () {
    if (confirm("Delete all saved estimates?")) {
      clearStorageList(STORAGE_KEY_ESTIMATES);
      showSavedEstimates();
    }
  });
}


function calculateSolarSaving() {
  // parseFloat turns the typed text into a decimal number.
  var monthlyBill = parseFloat($("#solarBill").val());
  var roofArea = parseFloat($("#solarRoof").val());

  // isNaN checks for "not a number" (empty or letters).
  // isFinite rejects Infinity, which appears if a huge number is typed.
  if (isNaN(monthlyBill) || isNaN(roofArea)) {
    alert("Please enter a number in both boxes.");
    return;
  }

  if (!isFinite(monthlyBill) || !isFinite(roofArea)) {
    alert("Those numbers are too large. Please enter a realistic value.");
    return;
  }

  if (monthlyBill <= 0 || roofArea <= 0) {
    alert("Both values must be greater than zero.");
    return;
  }

  // How large a system fits on the roof, and how much it would generate.
  var systemSize = roofArea / SOLAR_AREA_PER_KWP;
  var monthlyGeneration = systemSize * SOLAR_KWH_PER_KWP_MONTH;

  // How much electricity the household actually uses each month.
  var monthlyUsage = monthlyBill / SOLAR_TARIFF;

  // Only the electricity that is actually used counts as a saving.
  var usefulEnergy = Math.min(monthlyGeneration, monthlyUsage);

  var monthlySaving = usefulEnergy * SOLAR_TARIFF;
  var yearlySaving = monthlySaving * 12;
  var yearlyCo2 = (usefulEnergy * 12 * GRID_CO2_PER_KWH) / 1000; // tonnes

  // jQuery DOM manipulation - write the numbers into the page.
  $("#solarSize").text(systemSize.toFixed(1) + " kWp");
  $("#solarGeneration").text(Math.round(monthlyGeneration) + " kWh");
  $("#solarMonthly").text("RM " + monthlySaving.toFixed(2));
  $("#solarYearly").text("RM " + yearlySaving.toFixed(2));
  $("#solarCo2").text(yearlyCo2.toFixed(2) + " t");

  $("#solarResult").show();

  // Keep this estimate so the visitor can compare different roof sizes.
  addToStorageList(STORAGE_KEY_ESTIMATES, {
    bill: monthlyBill.toFixed(2),
    roof: roofArea.toFixed(1),
    yearly: yearlySaving.toFixed(2),
    savedOn: new Date().toLocaleDateString()
  });

  showSavedEstimates();
}


function showSavedEstimates() {
  var list = getStorageList(STORAGE_KEY_ESTIMATES);
  var $listBox = $("#solarSavedList");

  $listBox.empty();   // clear whatever is on screen before rebuilding it

  if (list.length === 0) {
    $listBox.append(
      '<li><p class="gtc-empty">No estimates saved yet. ' +
      'Run a calculation to save one.</p></li>'
    );
    $("#solarClearBtn").hide();
    return;
  }

  $("#solarClearBtn").show();

  for (var i = 0; i < list.length; i++) {
    var item = list[i];

    // jQuery .append() builds each row of the saved list.
    $listBox.append(
      '<li class="gtc-saved-item">' +
        '<span class="gtc-saved-item__main">' +
          '<strong>RM ' + item.yearly + ' saved per year</strong>' +
          '<small>Bill RM ' + item.bill + ' &middot; Roof ' + item.roof +
          ' m&sup2; &middot; ' + item.savedOn + '</small>' +
        '</span>' +
        '<button type="button" class="gtc-remove-btn" ' +
                'data-index="' + i + '" aria-label="Remove this estimate">' +
          'Remove' +
        '</button>' +
      '</li>'
    );
  }

  // The Remove buttons are created above, so their click handler has to be
  // attached after they exist.
  $listBox.find(".gtc-remove-btn").on("click", function () {
    var index = parseInt($(this).data("index"), 10);
    removeFromStorageList(STORAGE_KEY_ESTIMATES, index);
    showSavedEstimates();
  });
}


/* ==========================================================================
   RUNNING COST CALCULATOR - ev.html
   Compares the monthly fuel cost of an electric car with a petrol car.
   ========================================================================== */

var PETROL_LITRES_PER_100KM = 8;   // typical compact petrol car
var EV_KWH_PER_100KM = 16;         // typical compact electric car


function setUpEvCalculator() {
  if ($("#evForm").length === 0) {
    return;
  }

  $("#evForm").on("submit", function (event) {
    event.preventDefault();
    calculateEvCost();
  });
}


function calculateEvCost() {
  // parseInt is used for distance because part of a kilometre is not useful
  // here. The 10 tells JavaScript to read the text as a base-10 number.
  var monthlyKm = parseInt($("#evDistance").val(), 10);

  var petrolPrice = parseFloat($("#evPetrolPrice").val());
  var electricityPrice = parseFloat($("#evElectricPrice").val());

  var $error = $("#evError");
  $error.hide();

  if (isNaN(monthlyKm) || isNaN(petrolPrice) || isNaN(electricityPrice)) {
    $error.text("Please fill in all three boxes with numbers.").show();
    return;
  }

  if (!isFinite(monthlyKm) || monthlyKm <= 0 ||
      petrolPrice <= 0 || electricityPrice <= 0) {
    $error.text("All three values must be greater than zero.").show();
    return;
  }

  var petrolCost = (monthlyKm / 100) * PETROL_LITRES_PER_100KM * petrolPrice;
  var evCost = (monthlyKm / 100) * EV_KWH_PER_100KM * electricityPrice;
  var monthlyDifference = petrolCost - evCost;

  $("#evPetrolCost").text("RM " + petrolCost.toFixed(2));
  $("#evElectricCost").text("RM " + evCost.toFixed(2));
  $("#evMonthlyDiff").text("RM " + monthlyDifference.toFixed(2));
  $("#evYearlyDiff").text("RM " + (monthlyDifference * 12).toFixed(2));

  $("#evResult").show();
}


/* ==========================================================================
   EV SHORTLIST - ev.html
   Lets a visitor keep the EV types they want to read about later.
   Uses the same generic localStorage functions written above.
   ========================================================================== */

var STORAGE_KEY_SHORTLIST = "gtcEvShortlist";


function setUpEvShortlist() {
  if ($("#evShortlist").length === 0) {
    return;
  }

  showEvShortlist();

  // Every "Save to shortlist" button on the page shares one handler.
  $(".gtc-shortlist-btn").on("click", function () {
    var evType = $(this).data("ev");
    var list = getStorageList(STORAGE_KEY_SHORTLIST);

    // indexOf returns -1 when the item is not already in the list.
    if (list.indexOf(evType) !== -1) {
      $("#evShortlistMsg")
        .text(evType + " is already in your shortlist.")
        .show();
      return;
    }

    addToStorageList(STORAGE_KEY_SHORTLIST, evType);
    $("#evShortlistMsg").text(evType + " added to your shortlist.").show();
    showEvShortlist();
  });

  $("#evShortlistClearBtn").on("click", function () {
    if (confirm("Remove every item from your shortlist?")) {
      clearStorageList(STORAGE_KEY_SHORTLIST);
      $("#evShortlistMsg").hide();
      showEvShortlist();
    }
  });
}


function showEvShortlist() {
  var list = getStorageList(STORAGE_KEY_SHORTLIST);
  var $listBox = $("#evShortlist");

  $listBox.empty();

  if (list.length === 0) {
    $listBox.append(
      '<li><p class="gtc-empty">Your shortlist is empty. ' +
      'Save an EV type above to start one.</p></li>'
    );
    $("#evShortlistClearBtn").hide();
    return;
  }

  $("#evShortlistClearBtn").show();

  for (var i = 0; i < list.length; i++) {
    $listBox.append(
      '<li class="gtc-saved-item">' +
        '<span class="gtc-saved-item__main">' +
          '<strong>' + list[i] + '</strong>' +
        '</span>' +
        '<button type="button" class="gtc-remove-btn" ' +
                'data-index="' + i + '" aria-label="Remove from shortlist">' +
          'Remove' +
        '</button>' +
      '</li>'
    );
  }

  $listBox.find(".gtc-remove-btn").on("click", function () {
    var index = parseInt($(this).data("index"), 10);
    removeFromStorageList(STORAGE_KEY_SHORTLIST, index);
    showEvShortlist();
  });
}


/* ==========================================================================
   03. SESSION STORAGE AND REST API - Member 3
   Form draft saving, the selected event, and the air quality API request
   will be added here.
   ========================================================================== */

/* --- MEMBER 3 CODE STARTS HERE --- */

/* ==========================================================================
   REST API - smart-city.html
   Open-Meteo Air Quality API.

   What it is    : a free public REST API that returns current air quality
                   readings for a set of coordinates.
   Why this one  : a smart city runs on sensor data, so showing a live
                   environmental reading demonstrates the data layer of a
                   smart city rather than just describing it. The
                   coordinates below are Kampar, Perak.
   Why it suits  : no API key, no sign-up, no backend, and the server allows
   a student site   browser requests, so jQuery can call it directly.
   What it returns: JSON containing a "current" object with pm10, pm2_5 and
                   us_aqi values plus the time of the reading.
   ========================================================================== */

var KAMPAR_LATITUDE = 4.3167;
var KAMPAR_LONGITUDE = 101.1500;


function setUpAirQuality() {
  if ($("#aqiPanel").length === 0) {
    return;
  }

  loadAirQuality();

  $("#aqiRefreshBtn").on("click", function () {
    loadAirQuality();
  });
}


function loadAirQuality() {
  // encodeURIComponent() is required here. The timezone value contains a
  // "/" character, which has a special meaning inside a URL, so it has to
  // be turned into %2F before it is sent.
  var apiUrl = "https://air-quality-api.open-meteo.com/v1/air-quality"
             + "?latitude=" + KAMPAR_LATITUDE
             + "&longitude=" + KAMPAR_LONGITUDE
             + "&current=" + encodeURIComponent("pm10,pm2_5,us_aqi")
             + "&timezone=" + encodeURIComponent("Asia/Singapore");

  $("#aqiStatus").text("Loading...");
  $("#aqiError").hide();

  // jQuery $.get() sends the request. The function inside runs when the
  // reply arrives; .fail() runs instead if the request does not succeed.
  $.get(apiUrl, function (data) {
    showAirQuality(data);
  }).fail(function () {
    $("#aqiStatus").text("Unavailable");
    $("#aqiResult").hide();
    $("#aqiError")
      .text("The air quality service could not be reached. " +
            "Please check your internet connection and try again.")
      .show();
  });
}


function showAirQuality(data) {
  // Guard against a reply that arrives but has no reading inside it.
  if (!data || !data.current) {
    $("#aqiStatus").text("No data");
    $("#aqiError")
      .text("The service replied but did not include a reading for this location.")
      .show();
    return;
  }

  var reading = data.current;
  var aqi = reading.us_aqi;

  // Write the values into the page using jQuery.
  $("#aqiValue").text(aqi);
  $("#aqiPm25").text(reading.pm2_5 + " ug/m3");
  $("#aqiPm10").text(reading.pm10 + " ug/m3");
  $("#aqiTime").text(reading.time.replace("T", " "));
  $("#aqiStatus").text("Live reading");

  // Turn the number into a category using the US AQI bands.
  var band = describeAqi(aqi);
  $("#aqiBand")
    .text(band.label)
    .removeClass("gtc-aqi__band--good gtc-aqi__band--moderate " +
                 "gtc-aqi__band--sensitive gtc-aqi__band--unhealthy " +
                 "gtc-aqi__band--severe")
    .addClass(band.cssClass);

  $("#aqiAdvice").text(band.advice);
  $("#aqiResult").show();
}


/* Converts a US AQI number into a category and a short piece of advice. */
function describeAqi(aqi) {
  if (aqi <= 50) {
    return {
      label: "Good",
      cssClass: "gtc-aqi__band--good",
      advice: "Air quality is satisfactory and outdoor activity carries little risk."
    };
  }

  if (aqi <= 100) {
    return {
      label: "Moderate",
      cssClass: "gtc-aqi__band--moderate",
      advice: "Acceptable for most people, though unusually sensitive individuals may notice it."
    };
  }

  if (aqi <= 150) {
    return {
      label: "Unhealthy for sensitive groups",
      cssClass: "gtc-aqi__band--sensitive",
      advice: "People with asthma or heart conditions should limit long periods outdoors."
    };
  }

  if (aqi <= 200) {
    return {
      label: "Unhealthy",
      cssClass: "gtc-aqi__band--unhealthy",
      advice: "Everyone may begin to feel effects. Reduce prolonged outdoor exertion."
    };
  }

  return {
    label: "Very unhealthy or worse",
    cssClass: "gtc-aqi__band--severe",
    advice: "Avoid outdoor activity where possible and keep windows closed."
  };
}


/* ==========================================================================
   SESSION STORAGE - events.html

   Two things are kept for the current browser tab only:

     gtcSelectedEvent  the event chosen from a card, used to pre-select the
                       dropdown when the visitor reaches the form
     gtcFormDraft      whatever has been typed into the form so far

   Why sessionStorage and not localStorage:
   the draft holds a real name and email address. localStorage would keep
   that on the device after the browser closes, which is a privacy problem
   on a shared computer such as one in a library. sessionStorage clears
   itself the moment the tab is closed, so the data cannot be left behind.
   ========================================================================== */

var SESSION_KEY_SELECTED = "gtcSelectedEvent";
var SESSION_KEY_DRAFT = "gtcFormDraft";


function setUpEventsPage() {
  if ($("#registrationForm").length === 0) {
    return;
  }

  restoreSelectedEvent();
  restoreFormDraft();
  showRegistrations();

  // Clicking "Register" on an event card stores the event name for this tab
  // and moves the visitor down to the form.
  $(".gtc-register-btn").on("click", function () {
    var eventName = $(this).data("event");

    sessionStorage.setItem(SESSION_KEY_SELECTED, eventName);
    $("#regEvent").val(eventName);
    saveFormDraft();
    showSessionPanel();
  });

  // Every keystroke and dropdown change updates the draft.
  $("#regName, #regEmail, #regEvent").on("input change", function () {
    saveFormDraft();
  });

  // event.preventDefault() stops the browser from reloading the page, which
  // is what a form normally does when it is submitted.
  $("#registrationForm").on("submit", function (event) {
    event.preventDefault();
    handleRegistration();
  });

  $("#regClearDraftBtn").on("click", function () {
    sessionStorage.removeItem(SESSION_KEY_DRAFT);
    sessionStorage.removeItem(SESSION_KEY_SELECTED);
    $("#registrationForm")[0].reset();
    showSessionPanel();
  });

  $("#regClearAllBtn").on("click", function () {
    if (confirm("Delete every registration saved in this browser?")) {
      clearRegistrations();
      showRegistrations();
    }
  });
}


/* Writes the current contents of the form into sessionStorage. */
function saveFormDraft() {
  var draft = {
    name: $("#regName").val(),
    email: $("#regEmail").val(),
    event: $("#regEvent").val(),
    savedAt: new Date().toLocaleTimeString()
  };

  sessionStorage.setItem(SESSION_KEY_DRAFT, JSON.stringify(draft));
  showSessionPanel();
}


/* Puts a saved draft back into the form when the visitor returns. */
function restoreFormDraft() {
  var savedText = sessionStorage.getItem(SESSION_KEY_DRAFT);

  if (savedText === null) {
    showSessionPanel();
    return;
  }

  var draft;

  try {
    draft = JSON.parse(savedText);
  } catch (error) {
    showSessionPanel();
    return;
  }

  $("#regName").val(draft.name);
  $("#regEmail").val(draft.email);

  if (draft.event) {
    $("#regEvent").val(draft.event);
  }

  showSessionPanel();
}


/* Applies an event chosen on a card before the page was reloaded. */
function restoreSelectedEvent() {
  var selected = sessionStorage.getItem(SESSION_KEY_SELECTED);

  if (selected !== null) {
    $("#regEvent").val(selected);
  }
}


/* Shows what is currently held in sessionStorage, so the feature can be
   demonstrated without opening the browser developer tools. */
function showSessionPanel() {
  var selected = sessionStorage.getItem(SESSION_KEY_SELECTED);
  var savedText = sessionStorage.getItem(SESSION_KEY_DRAFT);

  $("#sessionSelected").text(selected === null ? "none yet" : selected);

  if (savedText === null) {
    $("#sessionDraft").text("nothing saved");
    return;
  }

  try {
    var draft = JSON.parse(savedText);
    var typed = draft.name || draft.email ? "yes" : "empty";
    $("#sessionDraft").text(typed + " (last saved " + draft.savedAt + ")");
  } catch (error) {
    $("#sessionDraft").text("nothing saved");
  }
}


/* --------------------------------------------------------------------------
   Registration
   The storage functions used here were written by Member 2 and are shared
   with the other pages, so the storage logic exists in one place only.
   -------------------------------------------------------------------------- */
function handleRegistration() {
  var name = $("#regName").val().trim();
  var email = $("#regEmail").val().trim();
  var eventName = $("#regEvent").val();

  var $message = $("#regMessage");
  $message.hide();

  if (name === "") {
    $message.text("Please enter your name.").show();
    return;
  }

  // A simple check: an address needs an "@" with text on both sides.
  if (email.indexOf("@") < 1 || email.indexOf("@") === email.length - 1) {
    $message.text("Please enter a valid email address.").show();
    return;
  }

  if (eventName === "") {
    $message.text("Please choose an event.").show();
    return;
  }

  // localStorage, through Member 2's shared function.
  saveRegistration(name, email, eventName);

  // The draft has served its purpose, so it is cleared from sessionStorage.
  sessionStorage.removeItem(SESSION_KEY_DRAFT);
  sessionStorage.removeItem(SESSION_KEY_SELECTED);

  $("#registrationForm")[0].reset();
  showSessionPanel();
  showRegistrations();

  $message
    .text("Thank you " + name + ". Your place at " + eventName +
          " has been saved in this browser.")
    .show();
}


/* Draws the list of saved registrations. */
function showRegistrations() {
  var list = getRegistrations();
  var $listBox = $("#regList");

  if ($listBox.length === 0) {
    return;
  }

  $listBox.empty();

  if (list.length === 0) {
    $listBox.append(
      '<li><p class="gtc-empty">No registrations saved yet.</p></li>'
    );
    $("#regClearAllBtn").hide();
    return;
  }

  $("#regClearAllBtn").show();

  for (var i = 0; i < list.length; i++) {
    var item = list[i];

    $listBox.append(
      '<li class="gtc-saved-item">' +
        '<span class="gtc-saved-item__main">' +
          '<strong>' + item.event + '</strong>' +
          '<small>' + item.name + ' &middot; ' + item.email +
          ' &middot; saved ' + item.savedOn + '</small>' +
        '</span>' +
        '<button type="button" class="gtc-remove-btn" ' +
                'data-index="' + i + '" aria-label="Remove this registration">' +
          'Remove' +
        '</button>' +
      '</li>'
    );
  }

  $listBox.find(".gtc-remove-btn").on("click", function () {
    var index = parseInt($(this).data("index"), 10);
    removeRegistration(index);
    showRegistrations();
  });
}


/* ==========================================================================
   SHARE LINKS - events.html

   These are built by hand rather than loaded from a sharing service, so no
   extra library is needed and nothing tracks the visitor.

   Every social network expects the link and the message as URL parameters.
   encodeURIComponent() converts characters that have a special meaning in a
   URL into safe codes: a space becomes %20, ":" becomes %3A and "/" becomes
   %2F. Without it a message containing "&" would cut the link in half.
   ========================================================================== */

function setUpShareButtons() {
  if ($("#shareModal").length === 0) {
    return;
  }

  $(".gtc-share-btn").on("click", function () {
    var eventName = $(this).data("event");
    buildShareLinks(eventName);
  });
}


function buildShareLinks(eventName) {
  // Strip any "#section" from the end of the current address.
  var pageUrl = window.location.href.split("#")[0];
  var message = "Join me at " + eventName + " - Green Technology Club";

  var encodedUrl = encodeURIComponent(pageUrl);
  var encodedMessage = encodeURIComponent(message);

  $("#shareFacebook").attr("href",
    "https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl);

  $("#shareX").attr("href",
    "https://twitter.com/intent/tweet?text=" + encodedMessage +
    "&url=" + encodedUrl);

  $("#shareWhatsapp").attr("href",
    "https://wa.me/?text=" + encodeURIComponent(message + " " + pageUrl));

  $("#shareTelegram").attr("href",
    "https://t.me/share/url?url=" + encodedUrl +
    "&text=" + encodedMessage);

  $("#shareModalLabel").text("Share this event");
  $("#shareEventName").text(eventName);

  // Showing the encoded text makes the effect of encodeURIComponent visible.
  $("#shareEncoded").text(encodedMessage);
}


/* ==========================================================================
   START EVERYTHING
   DOMContentLoaded fires once the HTML has been read by the browser, which
   guarantees that every element the functions look for already exists.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  // Member 1 - shared behaviour and cookies
  setFooterYear();
  setUpMobileMenuAutoClose();
  setUpCookieBanner();
  setUpWelcomeBar();
  setUpCookieReset();

  // Member 2 - local storage, calculators and jQuery
  setUpSolarCalculator();
  setUpEvCalculator();
  setUpEvShortlist();

  // Member 3 - session storage, REST API and social sharing
  setUpAirQuality();
  setUpEventsPage();
  setUpShareButtons();
});
