export function updateInventoryUI(inventory) {
    let el = document.getElementById('inventory');
    if (!el) {
        el = document.createElement('div');
        el.id = 'inventory';
        el.style.position = 'absolute';
        el.style.top = '10px';
        el.style.left = '10px';
        el.style.padding = '10px';
        el.style.background = 'rgba(255,255,255,0.7)';
        el.style.fontFamily = 'sans-serif';
        el.style.fontSize = '14px';
        document.body.appendChild(el);
    }
    el.innerHTML = `Wood: ${inventory.wood} <br> Stone: ${inventory.stone}`;
}
