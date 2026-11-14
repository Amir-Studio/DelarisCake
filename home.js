/* Lightweight homepage behavior: keep the gallery transition without loading dashboard code. */
document.addEventListener('DOMContentLoaded', function () {
    // Homepage analytics uses a random browser token; no personal data is sent.
    try { const cfg=window.DELARIS_SUPABASE_CONFIG; if(cfg){let visitorId=localStorage.getItem('delaris_visitor_id');if(!visitorId){visitorId=crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('delaris_visitor_id',visitorId);}fetch(cfg.url+'/functions/v1/delaris-admin',{method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.publishableKey},body:JSON.stringify({action:'track_visit',visitor_id:visitorId,page_path:location.pathname}),keepalive:true}).catch(()=>{});} } catch(_) {}

    const splash = document.getElementById('splash');
    const galleryLink = document.querySelector('.hero-buttons .btn-primary');
    let openingGallery = false;

    if (!splash || !galleryLink) return;

    galleryLink.addEventListener('click', function (event) {
        if (openingGallery) {
            event.preventDefault();
            return;
        }

        openingGallery = true;
        event.preventDefault();
        splash.classList.remove('hidden');
        splash.setAttribute('aria-hidden', 'false');

        window.setTimeout(function () {
            window.location.assign(galleryLink.href);
        }, 1200);
    });
});
