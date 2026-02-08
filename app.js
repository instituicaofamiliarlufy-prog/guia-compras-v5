import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";


const listEl = document.getElementById("shoppingList");
const filterEl = document.getElementById("categoryFilter");
const searchEl = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearListBtn");

let data = {};
//let state = JSON.parse(localStorage.getItem("shopping-state") || "{}");

const listRef = doc(db, "lista-compras");
let state = {};

async function testarFirestore() {
  try {
    const snapshot = await getDocs(collection(db, "lista-compras"));

    console.log("📦 Total de documentos:", snapshot.size);

    snapshot.forEach(doc => {
      console.log("➡️", doc.id, doc.data());
    });

    if (snapshot.empty) {
      console.log("⚠️ Coleção existe mas está vazia");
    }
  } catch (err) {
    console.error("❌ Erro ao ligar ao Firestore:", err);
  }
}

/* =========================
   LOAD DATA
========================= */

fetch("data/items.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    populateFilters();
    render();
  })
  .catch(err => {
    console.error("Erro ao carregar items.json", err);
  });

/* =========================
   EVENTS
========================= */

filterEl.addEventListener("change", render);
searchEl.addEventListener("input", render);

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (confirm("Limpar toda a lista de compras?")) {
      state = {};
      localStorage.removeItem("shopping-state");
      render();
    }
  });
}

/* =========================
   HELPERS
========================= */

function populateFilters() {
  Object.keys(data).forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterEl.appendChild(opt);
  });
}

/* =========================
   RENDER
========================= */

function render() {
   testarFirestore();
   
  listEl.innerHTML = "";

  const selectedCategory = filterEl.value;
  const search = searchEl.value.toLowerCase();

  Object.entries(data).forEach(([category, items]) => {
    if (selectedCategory !== "all" && selectedCategory !== category) return;

    const filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(search)
    );

    if (!filteredItems.length) return;

    const categoryEl = document.createElement("div");
    categoryEl.className = "category";
    categoryEl.innerHTML = `<h2>${category}</h2>`;

    filteredItems.forEach(item => {
      const saved = state[item.name] || {
        checked: item.checked,
        qty: item.defaultQty
      };

      const isDefault = Number(saved.qty) === Number(item.defaultQty);

      const row = document.createElement("div");
      row.className = "item";

      row.innerHTML = `
        <input type="checkbox" ${saved.checked ? "checked" : ""}>
        <span>${item.name}</span>
        <input
          type="number"
          min="0"
          value="${saved.qty}"
          class="${isDefault ? "qty-default" : "qty-modified"}"
        >
        <span class="unit">${item.unit}</span>
      `;

      const inputs = row.querySelectorAll("input");
      const check = inputs[0];
      const qty = inputs[1];

      check.addEventListener("change", () => {
        save(item.name, check.checked, qty.value);
      });

      qty.addEventListener("input", () => {
        const value = Number(qty.value);

        if (value === item.defaultQty) {
          qty.classList.remove("qty-modified");
          qty.classList.add("qty-default");
        } else {
          qty.classList.remove("qty-default");
          qty.classList.add("qty-modified");
        }

        save(item.name, check.checked, value);
      });

      categoryEl.appendChild(row);
    });

    listEl.appendChild(categoryEl);
  });
}

/* =========================
   STATE
========================= */

function save(itemName, checked, qty) {
  state[itemName] = { checked, qty };
  localStorage.setItem("shopping-state", JSON.stringify(state));
}
