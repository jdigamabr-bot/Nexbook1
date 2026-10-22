const STORAGE_KEY = "nexbook_entries_v1";
let entries = [];

try {
entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
if (!Array.isArray(entries)) entries = [];
} catch {
entries = [];
}

const $ = id => document.getElementById(id);

function saveData() {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
return true;
} catch {
alert("Data save zala nahi. Browser storage check kar.");
return false;
}
}

function addEntry() {
const type = $("entryType").value;
const title = $("entryTitle").value.trim();
const details = $("entryDetails").value.trim();
const amountText = $("entryAmount").value;

if (!title) {
alert("Pahile title lih bhau!");
return;
}

if (type === "Expense" &&
(amountText === "" || !Number.isFinite(Number(amountText)) ||
Number(amountText) < 0)) {
alert("Valid expense amount enter kar.");
return;
}

const entry = {
id: Date.now().toString() + Math.random().toString(16).slice(2),
type,
title,
details,
amount: type === "Expense" ? Number(amountText) : 0,
done: false,
date: new Date().toISOString()
};

entries.unshift(entry);

if (!saveData()) {
entries.shift();
return;
}

$("entryTitle").value = "";
$("entryDetails").value = "";
$("entryAmount").value = "";

renderEntries();
}

function deleteEntry(id) {
if (!confirm("Entry delete karaychi ka?")) return;

const oldEntries = entries;
entries = entries.filter(e => e.id !== id);

if (!saveData()) {
entries = oldEntries;
return;
}

renderEntries();
}

function toggleTask(id) {
const entry = entries.find(e => e.id === id);
if (!entry) return;

entry.done = !entry.done;

if (!saveData()) {
entry.done = !entry.done;
return;
}

renderEntries();
}

function editEntry(id) {
const entry = entries.find(e => e.id === id);
if (!entry) return;

const title = prompt("Edit title:", entry.title);
if (title === null) return;

if (!title.trim()) {
alert("Title empty thevu nako.");
return;
}

const details = prompt("Edit details:", entry.details);
if (details === null) return;

const oldTitle = entry.title;
const oldDetails = entry.details;

entry.title = title.trim();
entry.details = details.trim();

if (!saveData()) {
entry.title = oldTitle;
entry.details = oldDetails;
return;
}

renderEntries();
}

function renderEntries() {
const query = $("search").value.trim().toLowerCase();
const filtered = entries.filter(e =>
e.title.toLowerCase().includes(query) ||
e.details.toLowerCase().includes(query) ||
e.type.toLowerCase().includes(query)
);

$("noteCount").textContent =
entries.filter(e => e.type === "Note").length;

$("taskCount").textContent =
entries.filter(e => e.type === "Task").length;

const total = entries
.filter(e => e.type === "Expense")
.reduce((sum, e) => sum + Number(e.amount || 0), 0);

$("expenseTotal").textContent =
"₹" + total.toLocaleString("en-IN");

const list = $("entryList");
list.replaceChildren();

if (!filtered.length) {
const empty = document.createElement("p");
empty.textContent = "Entries nahi. Pahili entry add kar!";
list.appendChild(empty);
return;
}

filtered.forEach(entry => {
const card = document.createElement("article");
card.className = "entry";

const title = document.createElement("h3");
title.textContent = (entry.done ? "✅ " : "") + entry.title;
card.appendChild(title);

const meta = document.createElement("small");
meta.textContent = entry.type + " • " +
  new Date(entry.date).toLocaleString();
card.appendChild(meta);

if (entry.details) {
  const details = document.createElement("p");
  details.textContent = entry.details;
  card.appendChild(details);
}

if (entry.type === "Expense") {
  const amount = document.createElement("p");
  amount.textContent = "Amount: ₹" +
    Number(entry.amount).toLocaleString("en-IN");
  card.appendChild(amount);
}

if (entry.type === "Task") {
  const taskButton = document.createElement("button");
  taskButton.textContent = entry.done
    ? "Mark Incomplete" : "Mark Complete";
  taskButton.style.marginRight = "8px";
  taskButton.onclick = () => toggleTask(entry.id);
  card.appendChild(taskButton);
}

const editButton = document.createElement("button");
editButton.textContent = "Edit";
editButton.style.marginRight = "8px";
editButton.onclick = () => editEntry(entry.id);
card.appendChild(editButton);

const deleteButton = document.createElement("button");
deleteButton.textContent = "Delete";
deleteButton.className = "delete-btn";
deleteButton.onclick = () => deleteEntry(entry.id);
card.appendChild(deleteButton);

list.appendChild(card);

});
}

$("today").textContent = new Date().toLocaleDateString();

$("entryType").addEventListener("change", () => {
$("entryAmount").style.display =
$("entryType").value === "Expense" ? "block" : "none";
});

$("search").addEventListener("input", renderEntries);

renderEntries();
