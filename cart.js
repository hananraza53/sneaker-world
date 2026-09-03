/**
 * Sneaker World Cart Logic & UI
 */

class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('sneaker_cart')) || [];
        // Sanitize existing items' IDs to fix any that might have broken quotes
        this.items.forEach(item => {
            if (item.id) {
                // Ensure ID is a clean slug (alphanumeric and dashes only)
                item.id = item.id.replace(/[^a-zA-Z0-9-]/g, '');
            }
        });
        this.init();
    }

    init() {
        this.renderCart();
        this.updateCartCount();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.bg-white'); // Find the card container
                const product = {
                    id: productCard.querySelector('h2').innerText.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase(),
                    name: productCard.querySelector('h2').innerText,
                    price: parseFloat(productCard.querySelector('p').innerText.replace('Price: $', '')),
                    image: productCard.querySelector('img').src,
                    quantity: 1
                };
                this.addItem(product);
                this.openCart();
            });
        });

        // Buy Now buttons
        document.querySelectorAll('.buy-now-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.bg-white');
                const product = {
                    id: productCard.querySelector('h2').innerText.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase(),
                    name: productCard.querySelector('h2').innerText,
                    price: parseFloat(productCard.querySelector('p').innerText.replace('Price: $', '')),
                    image: productCard.querySelector('img').src,
                    quantity: 1
                };
                this.addItem(product);
                window.location.href = 'checkout.html';
            });
        });
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push(product);
        }
        this.save();
        this.renderCart();
        this.updateCartCount();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.renderCart();
        this.updateCartCount();
    }

    updateQuantity(productId, delta) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.save();
                this.renderCart();
                this.updateCartCount();
            }
        }
    }

    save() {
        localStorage.setItem('sneaker_cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const badges = document.querySelectorAll('.cart-count-badge');
        badges.forEach(badge => {
            badge.innerText = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    renderCart() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalElement = document.getElementById('cart-total');
        
        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-gray-500 my-10 text-xl">Your cart is empty</p>';
            cartTotalElement.innerText = '$0.00';
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="flex items-center justify-between border-b border-gray-100 py-4">
                <div class="flex items-center space-x-4">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded shadow-sm">
                    <div>
                        <h4 class="font-bold text-gray-800">${item.name}</h4>
                        <p class="text-green-600 font-semibold">$${item.price}</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <button onclick="cart.updateQuantity('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">-</button>
                            <span class="text-sm font-medium w-6 text-center">${item.quantity}</span>
                            <button onclick="cart.updateQuantity('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">+</button>
                        </div>
                    </div>
                </div>
                <button onclick="cart.removeItem('${item.id}')" class="text-red-500 hover:text-red-700 p-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `).join('');

        cartTotalElement.innerText = `$${this.getTotal().toFixed(2)}`;
    }

    openCart() {
        const panel = document.getElementById('cart-panel');
        const overlay = document.getElementById('cart-overlay');
        if (panel && overlay) {
            panel.classList.remove('translate-x-full');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const panel = document.getElementById('cart-panel');
        const overlay = document.getElementById('cart-overlay');
        if (panel && overlay) {
            panel.classList.add('translate-x-full');
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    clearCart() {
        this.items = [];
        this.save();
        this.renderCart();
        this.updateCartCount();
    }
}

// Global cart instance
const cart = new Cart();

// Utility function for the close button
window.toggleCart = (open) => {
    if (open) cart.openCart();
    else cart.closeCart();
};
