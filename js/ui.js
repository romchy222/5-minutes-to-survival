export function updateInventoryUI(inventory) {
    let el = document.getElementById('inventory');
    if (!el) {
        el = document.createElement('div');
        el.id = 'inventory';
        el.style.position = 'absolute';
        el.style.bottom = '10px';
        el.style.left = '10px';
        el.style.padding = '10px';
        el.style.background = 'rgba(0,0,0,0.5)';
        el.style.fontFamily = 'Arial, sans-serif';
        el.style.fontSize = '16px';
        el.style.color = 'white';
        el.style.borderRadius = '5px';
        document.body.appendChild(el);
    }
    el.innerHTML = `
        <div>🌲 Wood: ${inventory.wood}</div>
        <div>🪨 Stone: ${inventory.stone}</div>
        <div>⚙️ Iron: ${inventory.iron}</div>
    `;
}
