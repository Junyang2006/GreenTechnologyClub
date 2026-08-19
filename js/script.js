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
});
