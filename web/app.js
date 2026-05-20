// Menu Data with rich metadata, descriptions, categories, and recommendation tags
const menuItems = [
    { id: 1, name: '沙朗牛排', price: 160, isSteak: true, category: 'steak', tag: '熱銷', description: '嚴選紐澳沙朗，油花分布均勻，口感鮮嫩' },
    { id: 2, name: '豬排', price: 160, isSteak: false, needsSauce: true, category: 'other', tag: '經典', description: '厚切里肌豬排，多汁彈牙，無筋口感好' },
    { id: 3, name: '鄉村脆皮雞腿排', price: 160, isSteak: false, needsSauce: true, category: 'other', tag: '人氣', description: '去骨雞腿肉慢火煎至外皮金黃酥脆' },
    { id: 4, name: '嫩煎雪花牛排', price: 170, isSteak: true, category: 'steak', tag: '推薦', description: '豐富大理石油花，肉質細嫩，飽滿多汁' },
    { id: 5, name: '法蘭克菲力牛排', price: 220, isSteak: true, category: 'steak', tag: '老饕首選', description: '牛腰脊最軟嫩部位，油脂極低，極致細嫩' },
    { id: 6, name: '美國原塊嫩牛排', price: 220, isSteak: true, category: 'steak', tag: '原肉', description: '安格斯高品質熟成原肉切片，肉香四溢' },
    { id: 7, name: '美國紐約客牛排', price: 280, isSteak: true, category: 'steak', tag: '有嚼勁', description: '肉質扎實、油花帶筋，嚼勁極佳風味十足' },
    { id: 8, name: '12oz超大牛排', price: 240, isSteak: true, category: 'steak', tag: '大份量', description: '厚切雙倍分量，肉食愛好者的超級首選' },
    { id: 9, name: '22oz大胃王牛排', price: 460, isSteak: true, category: 'steak', tag: '雙人激推', description: '震撼霸氣巨無霸分量，肉香多汁的極致挑戰' },
    { id: 10, name: '鐵板麵', price: 70, isSteak: false, needsSauce: true, category: 'side', tag: '必點副食', description: 'Q彈鐵板麵條沾裹香濃特調醬汁' },
    { id: 11, name: '麵包', price: 10, isSteak: false, needsSauce: false, category: 'side', tag: '經典', description: '抹上自製香蒜奶油，烤至外酥內軟' }
];

// State Management
let cart = [];
let currentSelectedItem = null;
let currentCategory = 'all';
let searchQuery = '';

// DOM Elements
const menuGrid = document.getElementById('menu-grid');
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const tableNumberInput = document.getElementById('table-number');

// Modal Option Elements
const modalOverlay = document.getElementById('options-modal');
const modalItemName = document.getElementById('modal-item-name');
const modalItemPrice = document.getElementById('modal-item-price');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');
const donenessGroup = document.getElementById('doneness-group');
const sauceGroup = document.getElementById('sauce-group');

// Receipt Modal Elements
const receiptModal = document.getElementById('receipt-modal');
const receiptTableNum = document.getElementById('receipt-table-num');
const receiptTime = document.getElementById('receipt-time');
const receiptItemsList = document.getElementById('receipt-items-list');
const receiptTotal = document.getElementById('receipt-total');
const receiptCloseBtn = document.getElementById('receipt-close-btn');

// Initialize Application
function init() {
    renderMenu();
    setupEventListeners();
    updateCartUI();
}

// Render Menu Items with filtering & search conditions
function renderMenu() {
    menuGrid.innerHTML = '';
    
    // Filter items based on active tab and search query
    const filteredItems = menuItems.filter(item => {
        const matchCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (item.tag && item.tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchCategory && matchSearch;
    });

    if (filteredItems.length === 0) {
        menuGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔎</div>
                <h3>找不到符合的餐點</h3>
                <p>請嘗試其他關鍵字或變更分類</p>
            </div>
        `;
        return;
    }

    filteredItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        
        const tagHtml = item.tag ? `<span class="menu-item-tag">${item.tag}</span>` : '';
        const descHtml = item.description ? `<p class="menu-item-desc">${item.description}</p>` : '';
        
        div.innerHTML = `
            <div class="menu-item-content">
                <div class="menu-item-header">
                    ${tagHtml}
                    <h3 class="menu-item-name">${item.name}</h3>
                </div>
                ${descHtml}
            </div>
            <div class="menu-item-footer">
                <span class="menu-item-price">$${item.price}</span>
                <span class="add-button-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </span>
            </div>
        `;
        div.addEventListener('click', () => handleItemClick(item));
        menuGrid.appendChild(div);
    });
}

// Attach Event Listeners
function setupEventListeners() {
    // Custom Options Modal
    modalCancel.addEventListener('click', closeModal);
    modalConfirm.addEventListener('click', addToCartFromModal);
    
    // Receipt Modal Close
    receiptCloseBtn.addEventListener('click', closeReceiptModal);
    
    // Checkout Button
    checkoutBtn.addEventListener('click', handleCheckout);
    
    // Category Tabs Filter
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderMenu();
        });
    });

    // Search Bar Input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderMenu();
        });
    }
}

// Toast Notifications System (Replaces ugly browser alerts)
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);
    
    // Small delay to trigger smooth transition
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);

    // Fade out and auto remove
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Handle Menu Card Clicks
function handleItemClick(item) {
    if (item.isSteak || item.needsSauce) {
        currentSelectedItem = item;
        openModal(item);
    } else {
        addToCart({
            ...item,
            id: Date.now() + Math.random(), // Unique item key inside current order cart
            originalId: item.id,
            qty: 1
        });
        showToast(`已將 ${item.name} 加入點餐單！`, 'success');
    }
}

// Open Options Customize Overlay Dialog
function openModal(item) {
    modalItemName.textContent = item.name;
    modalItemPrice.textContent = `$${item.price}`;
    
    // Hide doneness controls if it's not a steak
    donenessGroup.style.display = item.isSteak ? 'block' : 'none';
    
    // Auto reset selection pills to standard default options
    const sauceRadios = document.querySelectorAll('input[name="sauce"]');
    if (sauceRadios.length > 0) sauceRadios[0].checked = true; // Preset sauce
    
    const donenessRadios = document.querySelectorAll('input[name="doneness"]');
    donenessRadios.forEach(radio => {
        if (radio.value === '7分') {
            radio.checked = true; // Preset steak doneness to 70% cooked
        }
    });

    modalOverlay.classList.add('active');
}

// Close Modal
function closeModal() {
    modalOverlay.classList.remove('active');
    currentSelectedItem = null;
}

// Process modal selections & add item to cart
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
    showToast(`已將 ${cartItem.name} 加入點餐單！`, 'success');
}

// Cart States & Logic Actions
function addToCart(item) {
    cart.push(item);
    updateCartUI();
}

function removeFromCart(id) {
    const matched = cart.find(item => item.id === id);
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
    if (matched) {
        showToast(`已移除 ${matched.name}`, 'warning');
    }
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

// Render updated Cart items onto side view
function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let totalQty = 0;

    const cartCountEl = document.getElementById('cart-count-badge');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <p>尚未點選任何餐點</p>
                <span>點擊左側餐點即可加入訂單</span>
            </div>
        `;
        totalPriceEl.textContent = '$0';
        if (cartCountEl) cartCountEl.textContent = '0';
        return;
    }

    cart.forEach(item => {
        total += item.price * item.qty;
        totalQty += item.qty;
        
        let badgesHtml = '';
        if (item.sauce) badgesHtml += `<span class="option-badge">${item.sauce}</span>`;
        if (item.doneness) badgesHtml += `<span class="option-badge doneness-badge">${item.doneness}</span>`;
        
        const optionsHtml = badgesHtml 
            ? `<div class="cart-item-options">${badgesHtml}</div>` 
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
                    <button class="qty-btn minus" onclick="updateQty(${item.id}, -1)">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <span class="qty-num">${item.qty}</span>
                    <button class="qty-btn plus" onclick="updateQty(${item.id}, 1)">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    <span>移除</span>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    totalPriceEl.textContent = `$${total}`;
    if (cartCountEl) cartCountEl.textContent = totalQty;
}

// Handle Order Checkout Submission
function handleCheckout() {
    if (cart.length === 0) {
        showToast('購物車目前是空的，請先點選餐點！', 'warning');
        return;
    }

    const table = tableNumberInput.value.trim();
    if (!table) {
        showToast('請先輸入桌號再結帳送出！', 'error');
        tableNumberInput.classList.add('error-pulse');
        tableNumberInput.focus();
        setTimeout(() => {
            tableNumberInput.classList.remove('error-pulse');
        }, 1500);
        return;
    }

    // Populate Receipt Details
    receiptTableNum.textContent = table;
    
    // Format Current Time (Locale Standard)
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    receiptTime.textContent = timeStr;
    
    // Populate Receipt Items
    receiptItemsList.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        
        let specStr = '';
        if (item.sauce || item.doneness) {
            const specs = [];
            if (item.sauce) specs.push(item.sauce);
            if (item.doneness) specs.push(item.doneness);
            specStr = `<div class="receipt-item-specs">${specs.join(' / ')}</div>`;
        }

        const div = document.createElement('div');
        div.className = 'receipt-item-row';
        div.innerHTML = `
            <div class="receipt-item-info">
                <span class="receipt-item-title">${item.name}</span>
                ${specStr}
            </div>
            <span class="receipt-item-qty">x${item.qty}</span>
            <span class="receipt-item-price">$${itemTotal}</span>
        `;
        receiptItemsList.appendChild(div);
    });

    receiptTotal.textContent = `$${total}`;
    
    // Show Receipt overlay
    openReceiptModal();
}

function openReceiptModal() {
    if (receiptModal) {
        receiptModal.classList.add('active');
    }
}

function closeReceiptModal() {
    if (receiptModal) {
        receiptModal.classList.remove('active');
    }
    // Automatically clear cart & reset UI states on confirmation
    cart = [];
    tableNumberInput.value = '';
    updateCartUI();
    showToast('訂單已順利送往廚房製作！', 'success');
}

// Expose internal functional triggers globally for inline onclick event tags
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;

// Start Application Loop
init();
