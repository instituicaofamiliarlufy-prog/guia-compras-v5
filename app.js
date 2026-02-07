const listEl = document.getElementById("shoppingList");
const filterEl = document.getElementById("categoryFilter");
const searchEl = document.getElementById("searchInput");

let data = {};
let state = JSON.parse(localStorage.getItem("shopping-state") || "{}");

fetch("data/items.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    populateFilters();
    render();
  });

filterEl.addEventListener("change", render);
searchEl.addEventListener("input", render);

function populateFilters() {
  Object.keys(data).forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterEl.appendChild(opt);
  });
}

function getUnit(item) {
  console.log('DISPLAYING ITEMS: ');
  console.log(item.toLowerCase());
  const i = item.toLowerCase();
  if (i.includes("leite") || i.includes("gasosa") || i.includes("óleo"))
    return "L";
  if (i.includes("arroz") || i.includes("fuba") || i.includes("farinha"))
    return "kg";
  if (i.includes("carne") || i.includes("bife") || i.includes("pescada"))
    return "kg";
  return "un";
}

function render() {
  listEl.innerHTML = "";
  const category = filterEl.value;
  const search = searchEl.value.toLowerCase();

  Object.entries(data).forEach(([cat, items]) => {
    if (category !== "all" && category !== cat) return;

    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(search)
    );
    if (!filtered.length) return;

    const catEl = document.createElement("div");
    catEl.className = "category";
    catEl.innerHTML = `<h2>${cat}</h2>`;

    filtered.forEach(item => {
      
      // const s = state[item] || {};
      // const row = document.createElement("div");
      // row.className = "item";

      // row.innerHTML = `
      //   <input type="checkbox" ${s.checked ? "checked" : ""}>
      //   <span>${item}</span>
      //   <input type="number" min="0" value="${s.qty || ""}">
      //   <span class="unit">${getUnit(item)}</span>
      // `;

      const s = state[item.name] || {
        checked: false,
        qty: item.defaultQty
      };

      const row = document.createElement("div");
      row.className = "item";
      
      row.innerHTML = `
      <input type="checkbox" ${s.checked ? "checked" : ""}>
          <span>${item.name}</span>
          <input type="number" min="0" value="${s.qty}">
          <span class="unit">${item.unit}</span>
          `;

      const inputs = row.querySelectorAll("input");
      const check = inputs[0];
      const qty = inputs[1];

      check.addEventListener("change", () => {
        save(item, check.checked, qty.value);
      });

      qty.addEventListener("input", () => {
        save(item, check.checked, qty.value);
      });

      catEl.appendChild(row);
    });

    listEl.appendChild(catEl);
  });
}

function save(itemName, checked, qty) {
  state[itemName] = { checked, qty };
  localStorage.setItem("shopping-state", JSON.stringify(state));
}

const clearBtn = document.getElementById("clearListBtn");

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (confirm("Limpar toda a lista de compras?")) {
      state = {};
      localStorage.removeItem("shopping-state");
      render();
    }
  });
}
