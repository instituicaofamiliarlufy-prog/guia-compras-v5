let data = {};
const list = document.getElementById("adminList");

fetch("data/items.json")
  .then(r => r.json())
  .then(j => {
    data = j;
    render();
  });

function render() {
  list.innerHTML = "";
  Object.entries(data).forEach(([cat, items]) => {
    const h = document.createElement("h3");
    h.textContent = cat;
    list.appendChild(h);

    items.forEach((item, idx) => {
      const div = document.createElement("div");
      div.textContent = `${item.name} (${item.defaultQty} ${item.unit})`;
      div.style.cursor = "pointer";
      div.onclick = () => {
        if (confirm("Remover item?")) {
          data[cat].splice(idx, 1);
          render();
        }
      };
      list.appendChild(div);
    });
  });
}

function addItem() {
  const name = newName.value;
  const qty = Number(newQty.value);
  const unit = newUnit.value;
  const cat = newCat.value;

  if (!data[cat]) data[cat] = [];

  data[cat].push({ name, defaultQty: qty, unit });
  render();
}