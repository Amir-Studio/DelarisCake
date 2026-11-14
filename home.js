/* Lightweight homepage behavior: keep the gallery transition without loading dashboard code. */
document.addEventListener('DOMContentLoaded', function () {
    // Anonymous, daily-deduplicated analytics. No direct personal data is sent.
    const cfg=window.DELARIS_SUPABASE_CONFIG;
    if(cfg){
      try{
        let visitorId=localStorage.getItem('delaris_visitor_id');
        if(!visitorId){visitorId=crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('delaris_visitor_id',visitorId);}
        fetch(cfg.url+'/functions/v1/delaris-admin',{method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.publishableKey},body:JSON.stringify({action:'track_visit',visitor_id:visitorId,page_path:location.pathname}),keepalive:true}).then(r=>{if(!r.ok)console.warn('Delaris visit tracking failed:',r.status);}).catch(e=>console.warn('Delaris visit tracking unavailable:',e));
      }catch(e){console.warn('Delaris visit tracking unavailable:',e);}
      // Public brand settings also apply to the landing page.
      fetch(cfg.url+'/functions/v1/delaris-admin',{method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.publishableKey},body:JSON.stringify({action:'get_public_settings'})})
        .then(r=>r.ok?r.json():Promise.reject(new Error('settings '+r.status)))
        .then(({item})=>{
          if(!item)return;
          document.querySelectorAll('a[href*="instagram.com"]').forEach(a=>{a.href=item.instagram_url||a.href;a.hidden=!item.show_instagram;a.style.display=item.show_instagram?'':'none';});
          document.querySelectorAll('a[href^="tel:"]').forEach(a=>{if(item.phone)a.href='tel:'+String(item.phone).replace(/[^+0-9]/g,'');a.hidden=!item.show_phone;a.style.display=item.show_phone?'':'none';});
          document.querySelectorAll('a[href*="google.com/maps"]').forEach(a=>{if(item.address)a.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(item.address);a.hidden=!item.show_address;a.style.display=item.show_address?'':'none';});
        }).catch(e=>console.warn('Delaris public settings unavailable:',e));
    }

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
