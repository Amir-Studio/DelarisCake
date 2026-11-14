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
    loadCloudCakes();
    loadDelarisPublicSettings();
    loadPublicReviews();
    setupReviewForm();

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

let INSTAGRAM_URL = 'https://www.instagram.com/delaris_cake07/';
let DELARIS_PUBLIC_SETTINGS = null;

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


async function loadCloudCakes(){
 const db=window.delarisSupabase,grid=document.getElementById('cakeGrid');
 if(!db||!grid||grid.dataset.cloudImagesLoading==='true'||grid.dataset.cloudImagesLoaded==='true')return;
 grid.dataset.cloudImagesLoading='true';
 try{
  const {data,error}=await db.from('delaris_gallery_images').select('id,file_path,alt_text,sort_order').order('sort_order',{ascending:true}).order('created_at',{ascending:true});
  if(error)throw error;
  grid.innerHTML='';
  (data||[]).forEach(item=>{
   const url=String(item.file_path).startsWith('legacy:')?'https://amir-studio.github.io/DelarisCake/'+String(item.file_path).slice(7):db.storage.from('delaris-cakes').getPublicUrl(item.file_path).data.publicUrl;
   const card=document.createElement('article');card.className='cake-card portfolio-cake-card';card.dataset.cloudId=String(item.id);
   const img=document.createElement('img');img.src=url;img.alt=item.alt_text||'نمونه کیک دلاریس کیک';img.width=720;img.height=540;img.style.aspectRatio='4 / 3';img.style.objectFit='cover';img.style.width='100%';img.style.height='auto';img.style.display='block';img.loading='lazy';img.decoding='async';
   card.append(img);
   if(DELARIS_PUBLIC_SETTINGS?.show_instagram!==false){const link=document.createElement('a');link.className='cake-inquiry';link.href=INSTAGRAM_URL;link.target='_blank';link.rel='noopener noreferrer';link.textContent='هماهنگی سفارش در اینستاگرام ↗';card.append(link);}
   grid.append(card);
  });
  grid.dataset.cloudImagesLoaded='true';
 }catch(error){console.warn('Delaris cloud gallery could not be loaded:',error);}
 finally{grid.dataset.cloudImagesLoading='false';}
}

function reviewEsc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function loadPublicReviews(){
 const host=document.getElementById('publicReviews');if(!host)return;
 const db=window.delarisSupabase;if(!db){host.innerHTML='<div class="reviews-empty">اتصال نظرات در حال حاضر در دسترس نیست.</div>';return;}
 try{
  const {data,error}=await db.from('delaris_reviews').select('id,display_name,rating,comment,created_at').eq('status','approved').order('created_at',{ascending:false}).limit(12);
  if(error)throw error;
  if(!data?.length){host.innerHTML='<div class="reviews-empty">هنوز نظری منتشر نشده است؛ خوشحال می‌شویم اولین تجربه را شما ثبت کنید.</div>';return;}
  host.innerHTML=data.map(item=>'<article class="public-review-card"><div class="public-review-top"><strong class="public-review-name">'+reviewEsc(item.display_name)+'</strong><span class="public-review-stars" aria-label="'+item.rating+' از ۵ ستاره">'+('★'.repeat(item.rating))+'<span style="color:#625d52">'+('☆'.repeat(5-item.rating))+'</span></span></div><p class="public-review-text">'+reviewEsc(item.comment)+'</p><time class="public-review-date" datetime="'+reviewEsc(item.created_at)+'">'+new Date(item.created_at).toLocaleDateString('fa-IR')+'</time></article>').join('');
 }catch(error){console.warn('Delaris reviews could not be loaded:',error);host.innerHTML='<div class="reviews-empty">بارگذاری نظرها موقتاً ممکن نیست؛ لطفاً کمی بعد دوباره تلاش کنید.</div>';}
}
function setupReviewForm(){
 const form=document.getElementById('reviewForm');if(!form)return;
 form.addEventListener('submit',async event=>{
  event.preventDefault();const button=document.getElementById('reviewSubmit'),feedback=document.getElementById('reviewFeedback');
  const cfg=window.DELARIS_SUPABASE_CONFIG;if(!cfg){feedback.textContent='اتصال سرور در دسترس نیست.';feedback.className='review-feedback error';return;}
  const payload={action:'submit_review',display_name:document.getElementById('reviewName').value.trim(),rating:Number(document.getElementById('reviewRating').value),comment:document.getElementById('reviewComment').value.trim(),website:document.getElementById('reviewWebsite').value};
  if(payload.comment.length<10||payload.comment.length>500){feedback.textContent='متن نظر باید بین ۱۰ تا ۵۰۰ نویسه باشد.';feedback.className='review-feedback error';return;}
  button.disabled=true;button.textContent='در حال ارسال…';feedback.textContent='در حال ثبت نظر شما…';feedback.className='review-feedback';
  try{
   const response=await fetch(cfg.url+'/functions/v1/delaris-admin',{method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.publishableKey},body:JSON.stringify(payload)});
   const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||'ارسال نظر انجام نشد.');
   form.reset();feedback.textContent=result.message||'نظر ثبت شد و پس از تأیید نمایش داده می‌شود.';feedback.className='review-feedback success';
  }catch(error){feedback.textContent=error.message||'ارتباط با سرور برقرار نشد.';feedback.className='review-feedback error';}
  finally{button.disabled=false;button.innerHTML='ارسال نظر برای بررسی <span>↗</span>';}
 });
}

async function loadDelarisPublicSettings(){
 const db=window.delarisSupabase;if(!db)return;
 try{
  const {data,error}=await db.from('delaris_site_settings').select('instagram_url,phone,address,show_instagram,show_phone,show_address').eq('id',1).single();
  if(error)throw error;DELARIS_PUBLIC_SETTINGS=data;INSTAGRAM_URL=data.instagram_url||INSTAGRAM_URL;
  document.querySelectorAll('a[href*="instagram.com"]').forEach(a=>{a.href=INSTAGRAM_URL;a.hidden=!data.show_instagram;if(!data.show_instagram)a.style.display='none';});
  document.querySelectorAll('a[href^="tel:"]').forEach(a=>{a.href='tel:'+String(data.phone||'').replace(/[^+0-9]/g,'');a.hidden=!data.show_phone;if(!data.show_phone)a.style.display='none';const strong=a.querySelector('strong');if(strong&&data.phone)strong.textContent=data.phone;});
  document.querySelectorAll('a[href*="google.com/maps"],a.address-feature').forEach(a=>{a.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(data.address||'');a.hidden=!data.show_address;if(!data.show_address)a.style.display='none';const strong=a.querySelector('strong');if(strong&&data.address)strong.textContent=data.address;});
  document.querySelectorAll('a[href*="instagram.com"]').forEach(a=>{const strong=a.querySelector('strong');if(strong){try{strong.textContent='@'+new URL(INSTAGRAM_URL).pathname.split('/').filter(Boolean)[0];}catch(_){}}});
 }catch(error){console.warn('Delaris public settings unavailable:',error);}
}

