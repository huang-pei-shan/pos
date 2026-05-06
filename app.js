// Menu Data
const menuItems = [
    { id: 1, name: '沙朗牛排', price: 160, isSteak: true },
    { id: 2, name: '豬排', price: 160, isSteak: false, needsSauce: true },
    { id: 3, name: '鄉村脆皮雞腿排', price: 160, isSteak: false, needsSauce: true },
    { id: 4, name: '嫩煎雪花牛排', price: 170, isSteak: true },
    { id: 5, name: '法蘭克菲力牛排', price: 220, isSteak: true },
    { id: 6, name: '美國原塊嫩牛排', price: 220, isSteak: true },
    { id: 7, name: '美國紐約客牛排', price: 280, isSteak: true },
    { id: 8, name: '12oz超大牛排', price: 240, isSteak: true },
    { id: 9, name: '22oz大胃王牛排', price: 460, isSteak: true },
    { id: 10, name: '鐵板麵', price: 70, isSteak: false, needsSauce: true },
    { id: 11, name: '麵包', price: 10, isSteak: false, needsSauce: false }
];

// State
let cart = [];
let currentSelectedItem = null;

// DOM Elements
const menuGrid = document.getElementById('menu-grid');
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const tableNumberInput = document.getElementById('table-number');

// Modal Elements
const modalOverlay = document.getElementById('options-modal');
const modalItemName = document.getElementById('modal-item-name');
const modalItemPrice = document.getElementById('modal-item-price');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');
const donenessGroup = document.getElementById('doneness-group');
const sauceGroup = document.getElementById('sauce-group');

// Initialize
function init() {
    renderMenu();
    setupEventListeners();
    updateCartUI();
}

function renderMenu() {
    menuItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-price">$${item.price}</div>
        `;
        div.addEventListener('click', () => handleItemClick(item));
        menuGrid.appendChild(div);
    });
}

function setupEventListeners() {
    modalCancel.addEventListener('click', closeModal);
    modalConfirm.addEventListener('click', addToCartFromModal);
    
    checkoutBtn.addEventListener('click', handleCheckout);
}

function handleItemClick(item) {
    if (item.isSteak || item.needsSauce) {
        currentSelectedItem = item;
        openModal(item);
    } else {
        addToCart({
            ...item,
            id: Date.now() + Math.random(), // unique cart item id
            originalId: item.id,
            qty: 1
        });
    }
}

function openModal(item) {
    modalItemName.textContent = item.name;
    modalItemPrice.textContent = `$${item.price}`;
    
    // Show/hide doneness based on if it's a steak
    donenessGroup.style.display = item.isSteak ? 'block' : 'none';
    
    // Reset radio buttons to default
    const sauceRadios = document.querySelectorAll('input[name="sauce"]');
    if(sauceRadios.length > 0) sauceRadios[0].checked = true; // default to first sauce
    
    const donenessRadios = document.querySelectorAll('input[name="doneness"]');
    donenessRadios.forEach(r => {
        if(r.value === '7分') r.checked = true;
    });

    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    currentSelectedItem = null;
}

function addToCartFromModal() {
    if (!currentSelectedItem) return;

    const sauceChecked = document.querySelector('input[name="sauce"]:checked');
    const donenessChecked = document.querySelector('input[name="doneness"]:checked');

    const sauce = sauceChecked ? sauceChecked.value : '';
    const doneness = (currentSelectedItem.isSteak && donenessChecked) ? donenessChecked.value : '';

    const cartItem = {
        ...currentSelectedItem,
        id: Date.now() + Math.random(),
        originalId: currentSelectedItem.id,
        qty: 1,
        sauce,
        doneness
    };

    addToCart(cartItem);
    closeModal();
}

function addToCart(item) {
    cart.push(item);
    updateCartUI();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">尚未點餐</div>';
        totalPriceEl.textContent = '$0';
        return;
    }

    cart.forEach(item => {
        total += item.price * item.qty;
        
        let optionsText = [];
        if (item.sauce) optionsText.push(item.sauce);
        if (item.doneness) optionsText.push(item.doneness);
        
        const optionsHtml = optionsText.length > 0 
            ? `<div class="cart-item-options">${optionsText.join(' / ')}</div>` 
            : '';

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-header">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${item.price * item.qty}</span>
            </div>
            ${optionsHtml}
            <div class="cart-item-actions">
                <div class="qty-controls">
                    <button class="qty-btn minus" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn plus" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">移除</button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    totalPriceEl.textContent = `$${total}`;
}

function handleCheckout() {
    if (cart.length === 0) {
        alert('購物車是空的，請先點餐！');
        return;
    }

    const table = tableNumberInput.value.trim();
    if (!table) {
        alert('請輸入桌號！');
        tableNumberInput.focus();
        return;
    }

    let receipt = `===== 地6攤牛排 結帳單 =====\n`;
    receipt += `桌號: ${table}\n`;
    receipt += `-------------------------\n`;
    
    let total = 0;
    cart.forEach(item => {
        let options = [];
        if(item.sauce) options.push(item.sauce);
        if(item.doneness) options.push(item.doneness);
        let optionsStr = options.length > 0 ? ` (${options.join(',')})` : '';
        
        receipt += `${item.name}${optionsStr} x${item.qty} ... $${item.price * item.qty}\n`;
        total += item.price * item.qty;
    });
    
    receipt += `-------------------------\n`;
    receipt += `總計: $${total}\n`;
    receipt += `=========================\n`;

    alert(`點餐成功！\n\n${receipt}`);
    
    // Clear cart and table
    cart = [];
    tableNumberInput.value = '';
    updateCartUI();
}

// Start the app
init();
