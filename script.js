/* ==========================================================
   WATER BILLING STATEMENT SYSTEM
   Demonstrates: functions, conditionals (if/else + switch),
   loops, input validation, DOM access methods, and
   recording data to Google Sheets via Google Apps Script.
   ========================================================== */

/* 🔴 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE (Step E) */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbz8ByAVkkc0y1_pE6sMPxZpYr2XDj7cjm7PR95Hz6nfjxh_4t2C5WmsA3DrGKfzbrSkHQ/exec";

/* Running total of how many bills have been generated */
let transactionCount = 0;

/* ---------- Rate table (flat rate per bracket) ---------- */
const rateTable = [
  { min: 1,  max: 20,       rate: 25 },
  { min: 21, max: 40,       rate: 35 },
  { min: 41, max: 60,       rate: 45 },
  { min: 61, max: Infinity, rate: 60 }
];

/* ==========================================================
   FUNCTION 1 — decide the rate using a LOOP + CONDITIONAL
   Loops through each bracket until the consumption fits.
   ========================================================== */
function getRate(consumption) {
  for (let i = 0; i < rateTable.length; i++) {
    if (consumption >= rateTable[i].min && consumption <= rateTable[i].max) {
      return rateTable[i].rate;
    }
  }
  return 0;
}

/* ==========================================================
   FUNCTION 2 — decide the discount using a SWITCH statement
   ========================================================== */
function getDiscountRate(customerType) {
  let discount;
  switch (customerType) {
    case "Senior Citizen":
      discount = 0.25; // 25%
      break;
    case "Solo Parent":
      discount = 0.15; // 15%
      break;
    default:
      discount = 0;    // Regular = no discount
  }
  return discount;
}

/* ==========================================================
   FUNCTION 3 — build a divider line using a LOOP
   ========================================================== */
function makeLine(symbol, length) {
  let line = "";
  for (let i = 0; i < length; i++) {
    line += symbol;
  }
  return line;
}

/* ==========================================================
   FUNCTION 4 — the main routine that runs on button click
   ========================================================== */
function generateBill() {
  // DOM ACCESS METHODS — read the input values
  const name = document.getElementById("customerName").value.trim();
  const consumption = Number(document.getElementById("consumption").value);
  const type = document.getElementById("customerType").value;
  const output = document.getElementById("output");

  /* ---------- INPUT VALIDATION (if / else if) ---------- */
  if (name === "") {
    showError(output, "⚠ Please enter the customer name.");
    return;
  } else if (isNaN(consumption) || consumption <= 0) {
    showError(output, "⚠ Please enter a valid water consumption (greater than 0).");
    return;
  }

  /* ---------- COMPUTATION ---------- */
  const rate = getRate(consumption);
  const amount = consumption * rate;
  const discountRate = getDiscountRate(type);
  const discount = amount * discountRate;
  const total = amount - discount;

  /* ---------- BUILD THE RECEIPT ---------- */
  const doubleLine = makeLine("=", 30);
  const singleLine = makeLine("-", 30);

  const receipt =
    doubleLine + "\n" +
    "        WATER BILLING\n" +
    doubleLine + "\n" +
    "Customer Name : " + name + "\n" +
    "Customer Type : " + type + "\n" +
    "Water Usage   : " + consumption + " cu.m\n" +
    "Rate          : ₱" + rate.toFixed(2) + " / cu.m\n" +
    singleLine + "\n" +
    "Amount        : ₱" + amount.toFixed(2) + "\n" +
    "Discount      : ₱" + discount.toFixed(2) + "\n" +
    singleLine + "\n" +
    "TOTAL BILL    : ₱" + total.toFixed(2) + "\n" +
    doubleLine;

  // DOM ACCESS METHOD — show the receipt on the page
  output.className = "output";
  output.textContent = receipt;

  /* ---------- UPDATE THE TRANSACTION COUNTER ---------- */
  transactionCount++;
  document.getElementById("counter").textContent =
    "Transactions Processed : " + transactionCount;

  /* ---------- SAVE TO GOOGLE SHEETS ---------- */
  saveToSheet({
    name: name,
    type: type,
    consumption: consumption,
    rate: rate,
    amount: amount,
    discount: discount,
    total: total
  });

  /* ---------- CLEAR THE FIELDS FOR THE NEXT ENTRY ---------- */
  document.getElementById("customerName").value = "";
  document.getElementById("consumption").value = "";
  document.getElementById("customerType").value = "Regular";
}

/* Helper — show a red error message */
function showError(output, message) {
  output.className = "output error";
  output.textContent = message;
}

/* ==========================================================
   FUNCTION 5 — send one transaction to the Google Sheet
   ========================================================== */
function saveToSheet(data) {
  if (SHEET_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
    return; // no URL set yet — skip silently
  }
  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data)
  }).catch(function (err) {
    console.log("Could not save to sheet:", err);
  });
}

/* ---------- Wire the button (DOM access + event) ---------- */
document.getElementById("generateBtn").addEventListener("click", generateBill);
