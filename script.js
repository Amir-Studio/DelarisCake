/* ================================================================
   اسپلش اسکرین
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const splash = document.getElementById('splash');
        if (splash) splash.classList.add('hidden');
    }, 1200);

    renderCakes();
    renderIdeas();
    renderReviews();
    updateCartCount();
    renderCart();

    // ===== ثبت‌نام =====
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('fullName').value.trim();
            const age = document.getElementById('age').value.trim();
            const email = document.getElementById('email').value.trim();
            if (name && age && email) {
                localStorage.setItem('user', JSON.stringify({ name, age, email }));
                window.location.href = 'dashboard.html';
            } else {
                alert('لطفاً همه فیلدها را پر کنید.');
            }
        });
    }

    // ===== سایدبار =====
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const menuIcon = document.getElementById('menuIcon');
        if (sidebar && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !menuIcon.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // ===== مودال اطلاعات فروشنده =====
    const infoModal = document.getElementById('infoModal');
    if (infoModal) {
        infoModal.addEventListener('click', function(e) {
            if (e.target === this) closeInfoModal();
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeInfoModal();
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('active');
        }
    });
});

/* ================================================================
   داده‌های کیک‌ها (با لینک‌های اصلاح‌شده)
   ================================================================ */

const cakes = [
    { id: 1, name: 'کیک شکوفه', price: 650000, desc: 'شکلات تلخ بلژیکی با خامه طبیعی و برش‌های طلایی', img: 'https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/75612c98-f883-417e-a2e6-26ffb256e771.jpg' },
    { id: 2, name: 'کیک رویایی', price: 680000, desc: 'طراحی سه‌طبقه با گل‌های طبیعی و فوندانت لوکس', img: 'https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/01305b06-e1f1-45c9-b02d-98814c9fbba2.jpg' },
    { id: 3, name: 'کیک بامزه', price: 550000, desc: 'اسفنج وانیلی با توت‌فرنگی تازه و خامه گل‌بهی', img: 'https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/eb0f40a7-4e83-425a-be88-e11c59343653.jpg' },
    { id: 4, name: 'کیک میوه‌ای', price: 640000, desc: 'لایه‌های اسفنجی با میوه‌های تازه و خامه سبک', img: 'https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/eb0f40a7-4e83-425a-be88-e11c59343653.jpg' },
    { id: 5, name: 'کیک یاس سفید', price: 700000, desc: 'طراحی مینیمال با گل یاس سفید و خامه وانیلی', img: 'https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/0094fa55-dc95-48de-9800-c74823d8d1c2.jpg' },
];

const ideaCakes = [
    { id: 101, name: 'کیک رمانتیک', price: 800000, desc: 'طراحی عاشقانه با گل‌های رز و خامه تمشک', img: 'https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/fb6430b5-b573-49ee-99bf-09907c2578bc.jpg' },
    { id: 102, name: 'کیک توت‌فرنگی', price: 900000, desc: 'اسفنج نرم با توت‌فرنگی تازه و خامه طبیعی', img: 'https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/750116b6-6f0c-4b8b-b2ca-1ffa0da15e21.jpg' },
];

const reviewsData = [
    { name: 'سارا محمدی', text: 'بهترین کیکی که تا حالا خوردم! طراحی و طعم فوق‌العاده بود.', stars: 5, avatar: 'https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/75612c98-f883-417e-a2e6-26ffb256e771.jpg' },
    { name: 'رضا کریمی', text: 'ارسال سریع و بسته‌بندی بسیار لوکس. قطعاً دوباره سفارش می‌دم.', stars: 5, avatar: 'https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/01305b06-e1f1-45c9-b02d-98814c9fbba2.jpg' },
    { name: 'نرگس شیری', text: 'کیک تولد دخترم رو از اینجا گرفتم، همه مهمون‌ها شگفت‌زده شدن.', stars: 5, avatar: 'https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/d08d8f3c-45d9-481a-80f5-0a4a1b5382d4.png' },
];

/* ================================================================
   رندر گالری، ایده، نظرات
   ================================================================ */

function renderCakes() {
    const grid = document.getElementById('cakeGrid');
    if (!grid) return;
    grid.innerHTML = cakes.map(cake => `
        <div class="cake-card" data-id="${cake.id}" onclick="toggleCake(${cake.id})">
            <img src="${cake.img}" alt="${cake.name}" loading="lazy" />
            <h3>${cake.name}</h3>
            <p class="price">${cake.price.toLocaleString()} تومان</p>
            <p class="cake-desc">${cake.desc}</p>
            <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${cake.id})">افزودن به سبد</button>
        </div>
    `).join('');
}

function renderIdeas() {
    const grid = document.getElementById('ideaGrid');
    if (!grid) return;
    grid.innerHTML = ideaCakes.map(cake => `
        <div class="cake-card" data-id="${cake.id}" onclick="toggleCake(${cake.id})">
            <img src="${cake.img}" alt="${cake.name}" loading="lazy" />
            <h3>${cake.name}</h3>
            <p class="price">${cake.price.toLocaleString()} تومان</p>
            <p class="cake-desc">${cake.desc}</p>
            <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${cake.id})">افزودن به سبد</button>
        </div>
    `).join('');
}

function renderReviews() {
    const slider = document.getElementById('reviewsSlider');
    if (!slider) return;
    const doubled = [...reviewsData, ...reviewsData];
    slider.innerHTML = doubled.map(review => `
        <div class="review-card">
            <img src="${review.avatar}" alt="${review.name}" class="review-avatar" loading="lazy" />
            <p class="review-name">${review.name}</p>
            <p class="review-text">"${review.text}"</p>
            <p class="review-stars">${'★'.repeat(review.stars)}${'☆'.repeat(5 - review.stars)}</p>
        </div>
    `).join('');

    // اسکرول اتوماتیک نظرات
    let scrollPos = 0;
    const slideWidth = 320 + 24;
    setInterval(() => {
        if (!slider) return;
        scrollPos += slideWidth;
        if (scrollPos >= slider.scrollWidth / 2) {
            scrollPos = 0;
        }
        slider.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }, 3000);
}

/* ================================================================
   سبد خرید
   ================================================================ */

let cart = JSON.parse(localStorage.getItem('delaris-cart')) || [];

function saveCart() {
    localStorage.setItem('delaris-cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const countEl = document.getElementById('cartCount');
    if (countEl) {
        const total = cart.reduce((s, i) => s + i.quantity, 0);
        countEl.textContent = total;
        countEl.style.display = total > 0 ? 'inline' : 'none';
    }
}

function addToCart(id) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, quantity: 1 });
    }
    saveCart();
    showToast('به سبد خرید اضافه شد 🎂');
}

function renderCart() {
    const root = document.getElementById('cartItems');
    if (!root) return;
    const totalEl = document.getElementById('cartTotal');
    const allCakes = [...cakes, ...ideaCakes];
    const validItems = cart.map(item => ({
        ...item,
        cake: allCakes.find(cake => cake.id === Number(item.id))
    })).filter(item => item.cake && Number(item.quantity) > 0);

    if (!validItems.length) {
        root.innerHTML = '<div class="empty-cart" style="padding:28px;text-align:center;color:#aaa">سبد خریدت خالی است. از منوی فروشگاه یک کیک انتخاب کن.</div>';
        if (totalEl) totalEl.textContent = '۰ تومان';
        return;
    }

    root.innerHTML = validItems.map(item => `
        <article class="cart-item" style="display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.08)">
            <img src="${item.cake.img}" alt="${item.cake.name}" loading="lazy" style="width:82px;height:82px;object-fit:cover;border-radius:12px">
            <div style="flex:1;min-width:0;text-align:right">
                <h3 style="font-size:15px;margin:0 0 4px">${item.cake.name}</h3>
                <p style="font-size:12px;color:#aaa;margin:0">تعداد: ${Number(item.quantity)}</p>
                <p style="font-size:13px;margin:5px 0 0">${(item.cake.price * item.quantity).toLocaleString('fa-IR')} تومان</p>
            </div>
            <button type="button" onclick="removeFromCart(${item.cake.id})" style="padding:8px 10px;border:1px solid rgba(255,255,255,.15);color:#e8c97a;border-radius:8px">حذف</button>
        </article>
    `).join('');

    const total = validItems.reduce((sum, item) => sum + item.cake.price * item.quantity, 0);
    if (totalEl) totalEl.textContent = total.toLocaleString('fa-IR') + ' تومان';
}

function removeFromCart(id) {
    cart = cart.filter(item => Number(item.id) !== Number(id));
    saveCart();
    renderCart();
}

function clearCart() {
    if (!cart.length) return;
    if (!confirm('سبد خرید پاک شود؟')) return;
    cart = [];
    saveCart();
    renderCart();
}

function goToCart() { window.location.href = 'cart.html'; }

function goToPayment() {
    if (!cart.length) {
        alert('سبد خرید خالی است.');
        return;
    }
    window.location.href = 'payment.html';
}

function processPayment() {
    alert('پرداخت آنلاین هنوز به درگاه واقعی متصل نشده است؛ هیچ پرداخت یا سفارشی ثبت نشد. برای سفارش، لطفاً با فروشنده هماهنگ کن.');
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = msg;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(15,15,16,0.9)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212,175,55,0.1)', color: '#f8f5ef',
        padding: '14px 28px', borderRadius: '60px', fontFamily: 'Vazirmatn, sans-serif',
        fontSize: '1rem', zIndex: '3000', boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        animation: 'fadeUp 0.5s ease forwards'
    });
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = '0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

/* ================================================================
   توابع اصلی
   ================================================================ */

function goToMenu() { window.location.href = 'menu.html'; }
function goToDashboard() { window.location.href = 'dashboard.html'; }

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('active');
}

function toggleInfoModal() {
    document.getElementById('infoModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeInfoModal() {
    document.getElementById('infoModal').classList.remove('active');
    document.body.style.overflow = '';
}

function logout() {
    if (confirm('آیا از خروج از حساب خود مطمئن هستید؟')) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

/* ================================================================
   افکت بزرگ‌نمایی کیک
   ================================================================ */

let activeCakeId = null;

function toggleCake(id) {
    const allCards = document.querySelectorAll('.cake-card');
    const target = document.querySelector(`.cake-card[data-id="${id}"]`);
    if (!target) return;

    if (activeCakeId === id) {
        allCards.forEach(card => card.classList.remove('active'));
        activeCakeId = null;
        return;
    }

    allCards.forEach(card => card.classList.remove('active'));
    target.classList.add('active');
    activeCakeId = id;
}

/* ================================================================
   مودال کیک
   ================================================================ */

function openModal(id) {
    const allCakes = [...cakes, ...ideaCakes];
    const cake = allCakes.find(c => c.id === id);
    if (!cake) return;
    document.getElementById('modalImage').src = cake.img;
    document.getElementById('modalName').textContent = cake.name;
    document.getElementById('modalDesc').textContent = cake.desc;
    document.getElementById('modalPrice').textContent = cake.price.toLocaleString() + ' تومان';
    document.getElementById('cakeModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('cakeModal').classList.remove('active');
    document.body.style.overflow = '';
}

function addToCartFromModal() {
    if (activeCakeId) {
        addToCart(activeCakeId);
        closeModal();
    }
}

/* ================================================================
   برندینگ در کنسول
   ================================================================ */

console.log('%c 🍰 Delaris Cake ', 'font-size:20px; font-weight:bold; color:#D4AF37;');
console.log('%c تماس: 09179131037 | delaris0cake@gmail.com ', 'font-size:12px; color:#B8B8B8;');
console.log('%c آدرس: قشم، دولاب ', 'font-size:12px; color:#B8B8B8;');
