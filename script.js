/* ================================================================
   اسپلش اسکرین
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {
    // اسپلش Delaris فقط پس از انتخاب «مشاهده نمونه‌کیک‌ها» نمایش داده می‌شود.
    const splash = document.getElementById('splash');
    const viewCakesLink = document.querySelector('.hero-buttons .btn-primary');
    let openingGallery = false;

    if (splash && viewCakesLink) {
        viewCakesLink.addEventListener('click', function(event) {
            if (openingGallery) {
                event.preventDefault();
                return;
            }
            openingGallery = true;
            event.preventDefault();
            splash.classList.remove('hidden');
            splash.setAttribute('aria-hidden', 'false');
            window.setTimeout(function() {
                window.location.href = viewCakesLink.href;
            }, 1200);
        });
    }

    renderCakes();
    renderIdeas();

    // ===== سایدبار =====
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const menuIcon = document.getElementById('menuIcon');
        if (sidebar && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !(menuIcon && menuIcon.contains(e.target)) && !(e.target.closest && e.target.closest('#sidebarBackdrop'))) {
                closeSidebar();
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
            closeSidebar();
        }
    });
});

/* ================================================================
   داده‌های کیک‌ها (با لینک‌های اصلاح‌شده)
   ================================================================ */

const cakes = [{"id":2,"img":"assets/optimized/cakes/cake-2.webp"},{"id":3,"img":"assets/optimized/cakes/cake-3.webp"},{"id":10,"img":"assets/optimized/cakes/InShot_20261105_004053604.webp"},{"id":11,"img":"assets/optimized/cakes/InShot_20261105_004116618.webp"},{"id":12,"img":"assets/optimized/cakes/InShot_20261105_004134269.webp"},{"id":13,"img":"assets/optimized/cakes/InShot_20261105_004150436.webp"},{"id":14,"img":"assets/optimized/cakes/InShot_20261105_004206076.webp"},{"id":15,"img":"assets/optimized/cakes/InShot_20261105_004232074.webp"},{"id":16,"img":"assets/optimized/cakes/InShot_20261105_004252675.webp"},{"id":17,"img":"assets/optimized/cakes/InShot_20261105_004337861.webp"},{"id":18,"img":"assets/optimized/cakes/InShot_20261105_004355798.webp"},{"id":19,"img":"assets/optimized/cakes/InShot_20261105_004410992.webp"},{"id":20,"img":"assets/optimized/cakes/InShot_20261105_004428443.webp"},{"id":21,"img":"assets/optimized/cakes/InShot_20261105_004446722.webp"},{"id":22,"img":"assets/optimized/cakes/InShot_20261105_004503430.webp"}].map((item, index) => ({ ...item, name: '', desc: '' }));

const ideaCakes = [
    {id:101,img:"assets/optimized/ideas/idea-101.webp",name:"",desc:""},
    {id:102,img:"assets/optimized/ideas/idea-102.webp",name:"",desc:""},
    {id:103,img:"assets/optimized/ideas/idea-103.webp",name:"",desc:""},
    {id:104,img:"assets/optimized/ideas/idea-104.webp",name:"",desc:""},
    {id:105,img:"assets/optimized/ideas/idea-105.webp",name:"",desc:""}
];

const INSTAGRAM_URL = 'https://www.instagram.com/delaris_cake07/';

const reviewsData = []; // نظرات واقعی پس از اتصال سامانه ثبت نظر نمایش داده می‌شوند.

/* ================================================================
   رندر گالری، ایده، نظرات
   ================================================================ */

function cakeCard(cake, isIdea = false, index = 0) {
    const imageAlt = isIdea
        ? `تصویر الهام‌بخش برای طراحی کیک، شماره ${index + 1}؛ نمونه‌کار دلاریس کیک نیست`
        : `نمونه‌کار واقعی کیک دلاریس کیک در دولاب قشم، تصویر ${index + 1}`;
    return `
        <article class="cake-card ${isIdea ? 'idea-card' : 'portfolio-cake-card'}">
            <img src="${cake.img}" alt="${imageAlt}" loading="lazy" decoding="async" />
            ${isIdea ? '' : `<a class="cake-inquiry" href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">مشاهده در پیج اینستاگرام ↗</a>`}
        </article>
    `;
}
function renderCakes() {
    const grid = document.getElementById('cakeGrid');
    if (grid && !grid.children.length) grid.innerHTML = cakes.map((cake, index) => cakeCard(cake, false, index)).join('');
}
function renderIdeas() {
    const grid = document.getElementById('ideaGrid');
    if (grid && !grid.children.length) grid.innerHTML = ideaCakes.map((cake, index) => cakeCard(cake, true, index)).join('');
}


/* ================================================================
   ارتباط سفارش با اینستاگرام
   ================================================================ */

function addToCart() {
    window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
}
function goToCart() {
    window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
}
function goToPayment() {
    window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
}
function processPayment() {
    window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
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

function syncPageScrollLock() {
    const sidebarOpen = document.getElementById('sidebar')?.classList.contains('active');
    const infoModalOpen = document.getElementById('infoModal')?.classList.contains('active');
    const cakeModalOpen = document.getElementById('cakeModal')?.classList.contains('active');
    document.body.style.overflow = sidebarOpen || infoModalOpen || cakeModalOpen ? 'hidden' : '';
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!sidebar) return;

    const willOpen = !sidebar.classList.contains('active');
    sidebar.classList.toggle('active', willOpen);
    if (backdrop) backdrop.classList.toggle('active', willOpen);
    syncPageScrollLock();
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    syncPageScrollLock();
}

function toggleInfoModal() {
    const modal = document.getElementById('infoModal');
    if (!modal) return;
    modal.classList.add('active');
    syncPageScrollLock();
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    if (modal) modal.classList.remove('active');
    syncPageScrollLock();
}

function logout() { if (window.delarisLogout) window.delarisLogout(); }

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
    const cake = [...cakes, ...ideaCakes].find(item => item.id === id);
    if (!cake) return;
    document.getElementById('modalImage').src = cake.img;
    document.getElementById('modalDesc').textContent = 'برای سفارش و اطلاع از جزئیات، از طریق اینستاگرام با ما در ارتباط باشید.';
    const modal = document.getElementById('cakeModal');
    if (!modal) return;
    modal.classList.add('active');
    syncPageScrollLock();
}

function closeModal() {
    const modal = document.getElementById('cakeModal');
    if (modal) modal.classList.remove('active');
    syncPageScrollLock();
}

/* ================================================================
   برندینگ در کنسول
   ================================================================ */

console.log('%c 🍰 Delaris Cake ', 'font-size:20px; font-weight:bold; color:#D4AF37;');

