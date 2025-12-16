const form = document.getElementById("searchForm");
const input = document.getElementById("countryInput");
const msg = document.getElementById("msg");
const results = document.getElementById("results");
const clearBtn = document.getElementById("clearBtn");
const themeSelect = document.getElementById("themeSelect");

const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalFlag = document.getElementById("modalFlag");
const modalBody = document.getElementById("modalBody");
const copyBtn = document.getElementById("copyBtn");
const copyMsg = document.getElementById("copyMsg");
const mapsLink = document.getElementById("mapsLink");

let activeCountry = null;

function setMsg(text, type = "info") {
  msg.textContent = text;
  msg.className = "msg";
  if (type === "err") msg.classList.add("err");
  if (type === "ok") msg.classList.add("ok");
}

function clearResults() {
  results.innerHTML = "";
}

function normalizeQuery(q) {
  return q.trim().replace(/\s+/g, " ");
}

function pickCurrency(country) {
  const obj = country.currencies || {};
  const key = Object.keys(obj)[0];
  if (!key) return "N/A";
  const name = obj[key]?.name || "N/A";
  return `${name} (${key})`;
}

function pickLanguages(country) {
  const obj = country.languages || {};
  const langs = Object.values(obj);
  return langs.length ? langs.slice(0, 5).join(", ") : "N/A";
}

function pickTimezones(country) {
  const tz = country.timezones || [];
  return tz.length ? tz.slice(0, 4).join(", ") : "N/A";
}

function pickCallingCodes(country) {
  const root = country.idd?.root || "";
  const suffixes = country.idd?.suffixes || [];
  if (!root || !suffixes.length) return "N/A";
  return `${root}${suffixes[0]}`;
}

function pickMaps(country) {
  return country.maps?.googleMaps || "";
}

async function fetchCountries(name) {
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) throw new Error("No country found. Try another name.");
    throw new Error("API/network error. Please try again.");
  }
  return await res.json();
}

function makeBadge(text) {
  const span = document.createElement("span");
  span.className = "badge";
  span.textContent = text;
  return span;
}

function openModal(country) {
  activeCountry = country;

  const name = country.name?.common || "N/A";
  const official = country.name?.official || "N/A";
  const capital = (country.capital && country.capital[0]) ? country.capital[0] : "N/A";
  const region = country.region || "N/A";
  const subregion = country.subregion || "N/A";
  const population = typeof country.population === "number" ? country.population.toLocaleString() : "N/A";
  const currency = pickCurrency(country);
  const languages = pickLanguages(country);
  const timezones = pickTimezones(country);
  const calling = pickCallingCodes(country);
  const code = country.cca2 || country.cca3 || "N/A";
  const flagUrl = country.flags?.png || country.flags?.svg || "";
  const maps = pickMaps(country);

  modalTitle.textContent = name;
  copyMsg.textContent = "";
  modalFlag.style.display = flagUrl ? "block" : "none";
  modalFlag.src = flagUrl || "";
  modalFlag.alt = flagUrl ? `Flag of ${name}` : "";

  mapsLink.style.display = maps ? "inline-flex" : "none";
  if (maps) mapsLink.href = maps;

  modalBody.innerHTML = `
    <div class="modal__kv">
      <div><span><b>Official</b></span><span>${official}</span></div>
      <div><span><b>Capital</b></span><span>${capital}</span></div>
      <div><span><b>Region</b></span><span>${region}</span></div>
      <div><span><b>Subregion</b></span><span>${subregion}</span></div>
      <div><span><b>Population</b></span><span>${population}</span></div>
      <div><span><b>Currency</b></span><span>${currency}</span></div>
      <div><span><b>Languages</b></span><span>${languages}</span></div>
      <div><span><b>Timezones</b></span><span>${timezones}</span></div>
      <div><span><b>Calling code</b></span><span>${calling}</span></div>
      <div><span><b>Code</b></span><span>${code}</span></div>
    </div>
  `;

  modalOverlay.classList.add("open");
  modalOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.classList.remove("open");
  modalOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  activeCountry = null;
}

function buildFactsText(country) {
  const name = country.name?.common || "N/A";
  const official = country.name?.official || "N/A";
  const capital = (country.capital && country.capital[0]) ? country.capital[0] : "N/A";
  const region = country.region || "N/A";
  const subregion = country.subregion || "N/A";
  const population = typeof country.population === "number" ? country.population.toLocaleString() : "N/A";
  const currency = pickCurrency(country);
  const languages = pickLanguages(country);
  const timezones = pickTimezones(country);
  const calling = pickCallingCodes(country);
  const code = country.cca2 || country.cca3 || "N/A";

  return [
    `Country: ${name}`,
    `Official: ${official}`,
    `Capital: ${capital}`,
    `Region: ${region}`,
    `Subregion: ${subregion}`,
    `Population: ${population}`,
    `Currency: ${currency}`,
    `Languages: ${languages}`,
    `Timezones: ${timezones}`,
    `Calling code: ${calling}`,
    `Code: ${code}`
  ].join("\n");
}

async function copyFacts() {
  if (!activeCountry) return;
  const text = buildFactsText(activeCountry);
  try {
    await navigator.clipboard.writeText(text);
    copyMsg.textContent = "Copied to clipboard.";
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    copyMsg.textContent = "Copied to clipboard.";
  }
}

function renderCountry(country) {
  const name = country.name?.common || "N/A";
  const capital = (country.capital && country.capital[0]) ? country.capital[0] : "N/A";
  const region = country.region || "N/A";
  const population = typeof country.population === "number" ? country.population.toLocaleString() : "N/A";
  const currency = pickCurrency(country);
  const flagUrl = country.flags?.png || country.flags?.svg || "";
  const code = country.cca2 || country.cca3 || "N/A";

  const card = document.createElement("article");
  card.className = "card";
  card.tabIndex = 0;

  const img = document.createElement("img");
  img.className = "flag";
  img.alt = `Flag of ${name}`;
  if (flagUrl) img.src = flagUrl;

  const body = document.createElement("div");
  body.className = "card__body";

  const title = document.createElement("h2");
  title.className = "card__title";
  title.textContent = name;

  const badges = document.createElement("div");
  badges.className = "badges";
  badges.appendChild(makeBadge(region));
  badges.appendChild(makeBadge(code));

  const kv = document.createElement("div");
  kv.className = "kv";
  kv.innerHTML = `
    <div><span><b>Capital</b></span><span>${capital}</span></div>
    <div><span><b>Population</b></span><span>${population}</span></div>
    <div><span><b>Currency</b></span><span>${currency}</span></div>
  `;

  const small = document.createElement("p");
  small.className = "small";
  small.textContent = "Click for details.";

  body.appendChild(title);
  body.appendChild(badges);
  body.appendChild(kv);
  body.appendChild(small);

  if (flagUrl) card.appendChild(img);
  card.appendChild(body);

  card.addEventListener("click", () => openModal(country));

  card.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    card.remove();
    setMsg("Card removed.", "ok");
  });

  card.addEventListener("keyup", (e) => {
    if (e.key === "Enter") openModal(country);
  });

  results.appendChild(card);
}

function applyTheme(value) {
  document.body.classList.remove("light");
  if (value === "light") document.body.classList.add("light");
  if (value === "dark") document.body.classList.remove("light");
  if (value === "system") {
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    if (prefersLight) document.body.classList.add("light");
  }
}

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
  setMsg(`Theme set to ${themeSelect.value}.`, "ok");
});

clearBtn.addEventListener("click", () => {
  clearResults();
  setMsg("Results cleared.", "ok");
});

input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") form.requestSubmit();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const q = normalizeQuery(input.value);
  if (!q) {
    setMsg("Please enter a country name.", "err");
    return;
  }

  setMsg("Loading...", "info");
  clearResults();

  try {
    const list = await fetchCountries(q);
    const top = list.slice(0, 6);
    top.forEach(renderCountry);
    setMsg(`Found ${top.length} result(s). Click a card for details.`, "ok");
  } catch (err) {
    setMsg(err.message, "err");
  }
});

modalClose.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("open")) closeModal();
});

copyBtn.addEventListener("click", copyFacts);

applyTheme(themeSelect.value);
setMsg("Ready. Search for a country to begin.", "info");
