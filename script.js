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

const cakes = [{"id":2,"img":"https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/01305b06-e1f1-45c9-b02d-98814c9fbba2.jpg"},{"id":3,"img":"https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/eb0f40a7-4e83-425a-be88-e11c59343653.jpg"},{"id":10,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004053604.jpg"},{"id":11,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004116618.jpg"},{"id":12,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004134269.jpg"},{"id":13,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004150436.jpg"},{"id":14,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004206076.jpg"},{"id":15,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004232074.jpg"},{"id":16,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004252675.jpg"},{"id":17,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004337861.jpg"},{"id":18,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004355798.jpg"},{"id":19,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004410992.jpg"},{"id":20,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004428443.jpg"},{"id":21,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004446722.jpg"},{"id":22,"img":"https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/InShot_20261105_004503430.jpg"}].map((item, index) => ({ ...item, name: '', desc: '' }));

const ideaCakes = [
    {id:101,img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85",name:"",desc:""},
    {id:102,img:"https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=85",name:"",desc:""},
    {id:103,img:"https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=85",name:"",desc:""},
    {id:104,img:"https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1200&q=85",name:"",desc:""},
    {id:105,img:"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=85",name:"",desc:""}
];

const INSTAGRAM_URL = 'https://www.instagram.com/delaris_cake07/';

const reviewsData = []; // نظرات واقعی پس از اتصال سامانه ثبت نظر نمایش داده می‌شوند.

/* ================================================================
   رندر گالری، ایده، نظرات
   ================================================================ */

function cakeCard(cake, isIdea = false) {
    return `
        <article class="cake-card ${isIdea ? 'idea-card' : 'portfolio-cake-card'}">
            <img src="${cake.img}" alt="${isIdea ? 'ایده طراحی کیک' : 'نمونه کیک Delaris Cake'}" loading="lazy" />
            ${isIdea ? '' : `<a class="cake-inquiry" href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">مشاهده در پیج اینستاگرام ↗</a>`}
        </article>
    `;
}
function renderCakes() {
    const grid = document.getElementById('cakeGrid');
    if (grid) grid.innerHTML = cakes.map(cake => cakeCard(cake, false)).join('');
}
function renderIdeas() {
    const grid = document.getElementById('ideaGrid');
    if (grid) grid.innerHTML = ideaCakes.map(cake => cakeCard(cake, true)).join('');
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
    const cake = [...cakes, ...ideaCakes].find(item => item.id === id);
    if (!cake) return;
    document.getElementById('modalImage').src = cake.img;
    document.getElementById('modalDesc').textContent = 'برای سفارش و اطلاع از جزئیات، از طریق اینستاگرام با ما در ارتباط باشید.';
    document.getElementById('cakeModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('cakeModal').classList.remove('active');
    document.body.style.overflow = '';
}

/* ================================================================
   برندینگ در کنسول
   ================================================================ */

console.log('%c 🍰 Delaris Cake ', 'font-size:20px; font-weight:bold; color:#D4AF37;');

