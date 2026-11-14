(function(){
'use strict';
const cfg=window.DELARIS_SUPABASE_CONFIG;
const $=id=>document.getElementById(id);
if(!cfg){$('loginFeedback').textContent='تنظیمات اتصال پیدا نشد.';return;}
const endpoint=cfg.url+'/functions/v1/delaris-admin';
let adminPassword=null,orders=[],gallery=[],customers=[],reviews=[],activeFilter='all',activeReviewFilter='all',idleTimer=null;
function resetIdle(){if(!adminPassword)return;clearTimeout(idleTimer);idleTimer=setTimeout(()=>{logout();alert('به دلیل ۳۰ دقیقه عدم فعالیت، از پنل خارج شدی.');},30*60*1000);}
const titles={overview:['نمای کلی کسب‌وکار','خلاصه‌ای از وضعیت فعلی دلاریس کیک'],analytics:['آمار و تحلیل','بازدیدها و روند عملکرد سایت در ۳۰ روز اخیر'],orders:['درخواست‌های سفارش','مدیریت و پیگیری درخواست‌های مشتریان'],gallery:['گالری نمونه‌کارها','انتشار، ترتیب و مدیریت تصاویر دلاریس'],customers:['دفتر مشتریان','اطلاعات مشتریان و سابقه درخواست‌ها'],reviews:['نظرات مشتریان','بررسی و انتشار تجربه مشتریان'],settings:['تنظیمات دلاریس','اطلاعات عمومی سایت، پیامک و امنیت مدیر']};
const labels={pending:'در انتظار بررسی',reviewing:'در حال بررسی',approved:'تأیید شده',rejected:'رد شده',completed:'تکمیل شده'};
const faNum=n=>Number(n||0).toLocaleString('fa-IR');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=v=>v?new Date(v).toLocaleString('fa-IR',{dateStyle:'medium',timeStyle:'short'}):'—';
const say=(id,msg,type='')=>{const el=$(id);if(el){el.textContent=msg;el.className='feedback'+(type?' '+type:'');}};
async function api(action,extra={},file=null,onProgress=null){
 const headers={apikey:cfg.publishableKey};let body;
 if(file){body=new FormData();body.append('action',action);body.append('password',adminPassword);body.append('file',file);body.append('alt_text',extra.alt_text||'نمونه کیک دلاریس کیک');}
 else{headers['Content-Type']='application/json';body=JSON.stringify({action,password:adminPassword,...extra});}
 if(file&&onProgress){return await new Promise((resolve,reject)=>{const xhr=new XMLHttpRequest();xhr.open('POST',endpoint);xhr.setRequestHeader('apikey',cfg.publishableKey);xhr.timeout=90000;xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress(Math.round(e.loaded/e.total*100));};xhr.onload=()=>{let r={};try{r=JSON.parse(xhr.responseText||'{}');}catch(_){r={error:'پاسخ سرور قابل خواندن نیست.'};}if(xhr.status>=200&&xhr.status<300)resolve(r);else reject(new Error(r.error||'عملیات انجام نشد.'));};xhr.onerror=()=>reject(new Error('ارتباط با سرور قطع شد.'));xhr.ontimeout=()=>reject(new Error('زمان بارگذاری تمام شد.'));xhr.send(body);});}
 let response;try{response=await fetch(endpoint,{method:'POST',headers,body,signal:AbortSignal.timeout(30000)});}catch(e){throw new Error(e.name==='TimeoutError'?'پاسخ سرور بیش از حد طول کشید.':'ارتباط با سرور برقرار نشد.');}
 const result=await response.json().catch(()=>({error:'پاسخ سرور قابل خواندن نیست.'}));
 if(!response.ok)throw new Error(result.error||'درخواست انجام نشد.');
 return result;
}
function imageUrl(path){return String(path||'').startsWith('legacy:')?'https://amir-studio.github.io/DelarisCake/'+String(path).slice(7):cfg.url+'/storage/v1/object/public/delaris-cakes/'+encodeURIComponent(path);}
function setBusy(button,busy,text){button.disabled=busy;button.textContent=busy?'در حال انجام…':text;}
function showApp(){ $('loginCard').hidden=true;$('setupCard').hidden=true;$('appShell').hidden=false; }
function logout(){clearTimeout(idleTimer);adminPassword=null;orders=[];gallery=[];customers=[];$('appShell').hidden=true;$('loginCard').hidden=false;say('loginFeedback','از پنل خارج شدی.');}
['pointerdown','keydown','touchstart'].forEach(eventName=>document.addEventListener(eventName,resetIdle,{passive:true}));
document.querySelectorAll('[data-toggle]').forEach(b=>b.addEventListener('click',()=>{const i=$(b.dataset.toggle);i.type=i.type==='password'?'text':'password';b.setAttribute('aria-label',i.type==='text'?'مخفی‌کردن رمز':'نمایش رمز');i.focus();}));
const setupToken=new URLSearchParams(location.search).get('setup');
if(setupToken){$('setupCard').hidden=false;$('loginCard').hidden=true;}
$('setupForm').addEventListener('submit',async e=>{e.preventDefault();const p=$('setupPassword').value,c=$('setupPasswordConfirm').value,b=$('setupSubmit');if(p.length<8||p.length>128){say('setupFeedback','رمز باید بین ۸ تا ۱۲۸ نویسه باشد.','error');return;}if(p!==c){say('setupFeedback','تکرار رمز یکسان نیست.','error');return;}setBusy(b,true,'ثبت رمز مدیریت');try{await api('setup',{setup_token:setupToken,password:p});e.currentTarget.reset();e.currentTarget.hidden=true;$('loginCard').hidden=false;history.replaceState(null,'',location.pathname);say('setupFeedback','رمز مدیریت با موفقیت ثبت شد.','success');}catch(err){say('setupFeedback',err.message,'error');}finally{b.disabled=false;b.textContent='ثبت رمز مدیریت';}});
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();const b=$('loginSubmit'),p=$('adminPassword').value;setBusy(b,true,'ورود امن به پنل');say('loginFeedback','در حال بررسی رمز…');try{await api('login',{password:p});adminPassword=p;resetIdle();$('adminPassword').value='';showApp();await loadAll();}catch(err){adminPassword=null;say('loginFeedback',err.message,'error');}finally{b.disabled=false;b.textContent='ورود امن به پنل';}});
function go(view){if(!titles[view])return;document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id==='view-'+view));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===view));$('pageTitle').textContent=titles[view][0];$('pageSubtitle').textContent=titles[view][1];}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
$('refreshBtn').addEventListener('click',()=>loadAll().catch(e=>alert(e.message)));
$('logoutBtn').addEventListener('click',logout);$('logoutBtn2').addEventListener('click',logout);
async function loadAll(){const results=await Promise.allSettled([loadOverview(),loadAnalytics(),loadOrders(),loadGallery(),loadCustomers(),loadReviews(),loadSettings()]);const failed=results.filter(x=>x.status==='rejected');if(failed.length)alert('بارگذاری '+faNum(failed.length)+' بخش با مشکل روبه‌رو شد. اتصال را بررسی و دوباره به‌روزرسانی کن.');}
async function loadOverview(){const r=await api('overview');$('statOrders').textContent=faNum(r.stats.orders);$('statPending').textContent=faNum(r.stats.pending);$('statGallery').textContent=faNum(r.stats.gallery);$('statCustomers').textContent=faNum(r.stats.customers);const host=$('latestOrders');if(!r.latest.length){host.innerHTML='<div class="empty">هنوز درخواستی ثبت نشده است.</div>';return;}host.innerHTML=r.latest.map(o=>'<article class="order-card"><div class="order-head"><strong>'+esc(o.occasion)+'</strong><span class="status-badge">'+esc(labels[o.status]||o.status)+'</span></div><div class="order-meta"><span>'+date(o.created_at)+'</span><span>'+esc(o.contact_phone||'بدون شماره تماس')+'</span></div></article>').join('');}
async function loadOrders(){const r=await api('list_orders');orders=r.items||[];renderOrders();}
function renderOrders(){const q=$('orderSearch').value.trim().toLocaleLowerCase();const rows=orders.filter(o=>(activeFilter==='all'||o.status===activeFilter)&&[o.occasion,o.cake_reference,o.description,o.contact_phone,o.customer?.display_name,o.customer?.phone].some(v=>String(v||'').toLocaleLowerCase().includes(q)));$('ordersCount').textContent=faNum(orders.length)+' درخواست';const host=$('ordersList');if(!rows.length){host.innerHTML='<div class="empty">درخواستی با این مشخصات پیدا نشد.</div>';return;}host.innerHTML=rows.map(o=>'<article class="order-card"><div class="order-head"><div><strong>'+esc(o.occasion)+'</strong><div class="order-meta"><span>'+date(o.created_at)+'</span><span>کد: '+esc(o.id.slice(0,8))+'</span></div></div><span class="status-badge">'+esc(labels[o.status]||o.status)+'</span></div><div class="order-meta"><span>مشتری: '+esc(o.customer?.display_name||'نام ثبت نشده')+'</span><span>تلفن: '+esc(o.contact_phone||o.customer?.phone||'ثبت نشده')+'</span><span>تاریخ مراسم: '+esc(o.event_date||'مشخص نشده')+'</span><span>مهمان: '+esc(o.guest_count||'نامشخص')+'</span></div><div class="order-meta"><span>کیک مرجع: '+esc(o.cake_reference||'سفارشی')+'</span></div><p class="order-description">'+esc(o.description)+'</p><div class="order-actions"><label class="muted" for="status-'+esc(o.id)+'">وضعیت درخواست</label><select id="status-'+esc(o.id)+'"><option value="pending">در انتظار بررسی</option><option value="reviewing">در حال بررسی</option><option value="approved">تأیید شده</option><option value="rejected">رد شده</option><option value="completed">تکمیل شده</option></select><button class="gold-btn" data-save-order="'+esc(o.id)+'">ذخیره وضعیت</button></div></article>').join('');rows.forEach(o=>{const s=$('status-'+o.id);if(s)s.value=o.status;});host.querySelectorAll('[data-save-order]').forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.saveOrder,s=$('status-'+id);b.disabled=true;try{await api('update_order',{id,status:s.value});const item=orders.find(x=>x.id===id);if(item)item.status=s.value;renderOrders();await loadOverview();}catch(e){alert(e.message);b.disabled=false;}}));}
$('orderSearch').addEventListener('input',renderOrders);
$('orderFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderOrders();});
async function loadGallery(){const r=await api('list_gallery');gallery=r.items||[];renderGallery();}
function renderGallery(){const host=$('galleryGrid');if(!gallery.length){host.innerHTML='<div class="empty">هنوز تصویری منتشر نشده است.</div>';return;}host.innerHTML=gallery.map((i,index)=>'<article class="gallery-card" data-legacy="'+String(i.file_path).startsWith('legacy:')+'"><img loading="lazy" src="'+esc(imageUrl(i.file_path))+'" alt="'+esc(i.alt_text)+'"><div class="gallery-card-body"><input maxlength="120" aria-label="توضیح تصویر" data-alt="'+esc(i.id)+'" value="'+esc(i.alt_text)+'"><div class="gallery-actions"><button class="ghost-btn" data-save-image="'+esc(i.id)+'">ذخیره</button><button class="ghost-btn move-image" data-move-image="'+esc(i.id)+'" data-direction="-1" title="انتقال به ابتدای گالری" '+(index===0?'disabled':'')+'>↑</button><button class="ghost-btn move-image" data-move-image="'+esc(i.id)+'" data-direction="1" title="انتقال به انتهای گالری" '+(index===gallery.length-1?'disabled':'')+'>↓</button><button class="danger-btn" data-delete-image="'+esc(i.id)+'">حذف</button></div><p class="muted">'+date(i.created_at)+'</p></div></article>').join('');host.querySelectorAll('[data-save-image]').forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.saveImage,input=host.querySelector('[data-alt="'+id+'"]');if(!input.value.trim()){alert('توضیح تصویر نمی‌تواند خالی باشد.');return;}b.disabled=true;try{await api('update_gallery',{id,alt_text:input.value.trim()});const item=gallery.find(x=>x.id===id);if(item)item.alt_text=input.value.trim();b.textContent='ذخیره شد';}catch(e){alert(e.message);b.disabled=false;}}));host.querySelectorAll('[data-delete-image]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('این تصویر از گالری عمومی حذف شود؟'))return;b.disabled=true;try{await api('delete_gallery',{id:b.dataset.deleteImage});gallery=gallery.filter(x=>x.id!==b.dataset.deleteImage);renderGallery();await loadOverview();}catch(e){alert(e.message);b.disabled=false;}}));
 host.querySelectorAll('[data-move-image]').forEach(b=>b.addEventListener('click',()=>moveGalleryImage(b.dataset.moveImage,Number(b.dataset.direction))));}
async function compressImage(file){
 if(!('createImageBitmap' in window)){if(file.size>4.7*1024*1024)throw new Error('این مرورگر فشرده‌سازی خودکار را پشتیبانی نمی‌کند؛ لطفاً تصویر کوچک‌تری انتخاب کن.');return file;}
 const bitmap=await createImageBitmap(file);const max=1600,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('پردازش تصویر در این مرورگر ممکن نیست.');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
 const toBlob=q=>new Promise(resolve=>canvas.toBlob(resolve,'image/webp',q));
 let blob=await toBlob(.82);if(!blob)throw new Error('فشرده‌سازی تصویر انجام نشد.');
 if(blob.size>4.7*1024*1024)blob=await toBlob(.68);
 if(blob.size>4.7*1024*1024)throw new Error('حجم تصویر پس از فشرده‌سازی هنوز زیاد است؛ تصویر کوچک‌تری انتخاب کن.');
 return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:'image/webp',lastModified:Date.now()});
}
$('uploadForm').addEventListener('submit',async e=>{e.preventDefault();const file=$('cakeImage').files[0],alt=$('cakeAlt').value.trim()||'نمونه کیک دلاریس کیک',b=$('uploadBtn');if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){say('uploadFeedback','فقط JPG، PNG یا WEBP تا ۱۵ مگابایت انتخاب کن.','error');return;}b.disabled=true;$('uploadProgress').hidden=false;$('uploadBar').style.width='0%';say('uploadFeedback','در حال بهینه‌سازی تصویر برای آپلود سریع…');try{const optimized=await compressImage(file);say('uploadFeedback','در حال بارگذاری نسخه بهینه‌شده…');await api('upload',{alt_text:alt},optimized,p=>$('uploadBar').style.width=p+'%');$('uploadForm').reset();say('uploadFeedback','تصویر بهینه و منتشر شد.','success');await loadGallery();await loadOverview();}catch(err){say('uploadFeedback',err.message,'error');}finally{b.disabled=false;}});
async function loadCustomers(){const r=await api('list_customers');customers=r.items||[];renderCustomers();}
function renderCustomers(){
 const q=$('customerSearch').value.trim().toLocaleLowerCase();
 const rows=customers.filter(c=>[c.display_name,c.email,c.phone].some(v=>String(v||'').toLocaleLowerCase().includes(q)));
 $('customersCount').textContent=faNum(customers.length)+' مشتری';
 const host=$('customersGrid');
 if(!rows.length){host.innerHTML='<div class="empty">مشتری‌ای با این مشخصات پیدا نشد.</div>';return;}
 host.innerHTML=rows.map(c=>'<article class="customer-card"><strong>'+esc(c.display_name||'بدون نام')+'</strong><p>'+esc(c.email||'ایمیل ثبت نشده')+'<br>'+esc(c.phone||'شماره تماس ثبت نشده')+'</p><div class="order-meta"><span>'+faNum(c.order_count)+' درخواست سفارش</span><span>عضویت: '+date(c.created_at)+'</span><span>آخرین ورود: '+date(c.last_sign_in_at)+'</span></div><div class="customer-actions"><button class="ghost-btn" type="button" data-edit-customer="'+esc(c.user_id)+'">ویرایش اطلاعات</button><button class="danger-btn" type="button" data-delete-customer="'+esc(c.user_id)+'">حذف حساب</button></div></article>').join('');
 host.querySelectorAll('[data-edit-customer]').forEach(b=>b.addEventListener('click',()=>openCustomerEditor(b.dataset.editCustomer)));
 host.querySelectorAll('[data-delete-customer]').forEach(b=>b.addEventListener('click',()=>deleteCustomer(b.dataset.deleteCustomer)));
}
let editingCustomerId=null;
function closeCustomerEditor(){editingCustomerId=null;$('customerEditModal').hidden=true;$('customerEditForm').reset();say('customerEditFeedback','');}
function openCustomerEditor(id){
 const c=customers.find(x=>x.user_id===id);if(!c)return;
 editingCustomerId=id;$('editCustomerName').value=c.display_name||'';$('editCustomerPhone').value=c.phone||'';
 say('customerEditFeedback','');$('customerEditModal').hidden=false;$('editCustomerName').focus();
}
$('closeCustomerEdit').addEventListener('click',closeCustomerEditor);
$('cancelCustomerEdit').addEventListener('click',closeCustomerEditor);
$('customerEditModal').addEventListener('click',e=>{if(e.target===$('customerEditModal'))closeCustomerEditor();});
$('customerEditForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!editingCustomerId)return;
 const display_name=$('editCustomerName').value.trim(),phone=$('editCustomerPhone').value.trim(),b=$('saveCustomerEdit');
 if(display_name.length<2||display_name.length>100){say('customerEditFeedback','نام باید بین ۲ تا ۱۰۰ نویسه باشد.','error');return;}
 b.disabled=true;b.textContent='در حال ذخیره…';
 try{
  await api('update_customer',{id:editingCustomerId,display_name,phone});
  const c=customers.find(x=>x.user_id===editingCustomerId);if(c){c.display_name=display_name;c.phone=phone||null;}
  closeCustomerEditor();renderCustomers();await loadOverview();
 }catch(err){say('customerEditFeedback',err.message,'error');}
 finally{b.disabled=false;b.textContent='ذخیره تغییرات';}
});
async function deleteCustomer(id){
 const c=customers.find(x=>x.user_id===id);if(!c)return;
 const name=c.display_name||c.email||'این مشتری';
 if(!confirm('حساب «'+name+'» برای همیشه حذف شود؟\nپروفایل و تمام درخواست‌های سفارش مرتبط با این حساب نیز حذف خواهند شد. این کار قابل بازگشت نیست.'))return;
 const b=document.querySelector('[data-delete-customer="'+CSS.escape(id)+'"]');if(b){b.disabled=true;b.textContent='در حال حذف…';}
 try{
  await api('delete_customer',{id});
  customers=customers.filter(x=>x.user_id!==id);renderCustomers();await loadAll();
 }catch(err){alert(err.message);if(b){b.disabled=false;b.textContent='حذف حساب';}}
}
$('customerSearch').addEventListener('input',renderCustomers);
async function moveGalleryImage(id,direction){
 const index=gallery.findIndex(x=>x.id===id),other=index+direction;if(index<0||other<0||other>=gallery.length)return;
 const first=gallery[index],second=gallery[other],old=first.sort_order;first.sort_order=second.sort_order;second.sort_order=old;
 gallery.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));renderGallery();
 try{await api('update_gallery',{id:first.id,sort_order:first.sort_order});await api('update_gallery',{id:second.id,sort_order:second.sort_order});}
 catch(err){alert('ترتیب ذخیره نشد: '+err.message);await loadGallery();}
}
async function loadReviews(){const r=await api('list_reviews');reviews=r.items||[];renderReviews();}
function renderReviews(){const rows=reviews.filter(x=>activeReviewFilter==='all'||x.status===activeReviewFilter);$('reviewsCount').textContent=faNum(reviews.length)+' نظر · '+faNum(reviews.filter(x=>x.status==='pending').length)+' در انتظار';const host=$('reviewsList');if(!rows.length){host.innerHTML='<div class="empty">در این دسته نظری وجود ندارد.</div>';return;}host.innerHTML=rows.map(x=>'<article class="order-card review-admin-card"><div class="order-head"><div><strong>'+esc(x.display_name)+'</strong><div class="order-meta"><span>'+date(x.created_at)+'</span><span class="review-stars-admin">'+('★'.repeat(x.rating))+'<span>'+('☆'.repeat(5-x.rating))+'</span></span></div></div><span class="status-badge">'+(x.status==='approved'?'منتشرشده':x.status==='rejected'?'ردشده':'در انتظار تأیید')+'</span></div><p class="order-description">'+esc(x.comment)+'</p><div class="order-actions">'+(x.status!=='approved'?'<button class="gold-btn" data-review-status="approved" data-review-id="'+esc(x.id)+'">تأیید و انتشار</button>':'<button class="ghost-btn" data-review-status="pending" data-review-id="'+esc(x.id)+'">برداشتن از انتشار</button>')+(x.status!=='rejected'?'<button class="ghost-btn" data-review-status="rejected" data-review-id="'+esc(x.id)+'">رد نظر</button>':'')+'<button class="danger-btn" data-review-delete="'+esc(x.id)+'">حذف</button></div></article>').join('');host.querySelectorAll('[data-review-status]').forEach(b=>b.addEventListener('click',async()=>{b.disabled=true;try{await api('update_review',{id:b.dataset.reviewId,status:b.dataset.reviewStatus});const item=reviews.find(x=>x.id===b.dataset.reviewId);if(item)item.status=b.dataset.reviewStatus;renderReviews();}catch(e){alert(e.message);b.disabled=false;}}));host.querySelectorAll('[data-review-delete]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('این نظر برای همیشه حذف شود؟'))return;b.disabled=true;try{await api('delete_review',{id:b.dataset.reviewDelete});reviews=reviews.filter(x=>x.id!==b.dataset.reviewDelete);renderReviews();}catch(e){alert(e.message);b.disabled=false;}}));}
$('reviewFilters').addEventListener('click',e=>{const b=e.target.closest('[data-review-filter]');if(!b)return;activeReviewFilter=b.dataset.reviewFilter;document.querySelectorAll('[data-review-filter]').forEach(x=>x.classList.toggle('active',x===b));renderReviews();});
async function loadAnalytics(){const r=await api('analytics');const n=faNum;$('analyticsViews').textContent=n(r.totals.views);$('analyticsVisitors').textContent=n(r.totals.visitors);$('analyticsOrders').textContent=n(r.totals.orders);$('analyticsCustomers').textContent=n(r.totals.customers);$('todayVisitors').textContent=n(r.totals.today_visitors);$('todayViews').textContent=n(r.totals.today_views);$('analyticsToday').textContent='امروز: '+n(r.totals.today_visitors)+' بازدیدکننده';$('conversionRate').textContent=(r.totals.views?((r.totals.orders/r.totals.views)*100).toFixed(1):'0.0')+'٪';const max=Math.max(1,...r.daily.map(x=>x.views));$('analyticsChart').innerHTML=r.daily.map(d=>'<div class="chart-bar" title="'+esc(d.date)+' · '+n(d.views)+' بازدید"><i style="height:'+Math.max(2,d.views/max*100)+'%"></i><small>'+new Date(d.date+'T12:00:00Z').toLocaleDateString('fa-IR',{day:'numeric'})+'</small></div>').join('');}
async function loadSettings(){const r=await api('get_settings');const s=r.item;$('settingInstagram').value=s.instagram_url||'';$('settingPhone').value=s.phone||'';$('settingAddress').value=s.address||'';$('showInstagram').checked=!!s.show_instagram;$('showPhone').checked=!!s.show_phone;$('showAddress').checked=!!s.show_address;$('smsStatus').textContent=r.sms_ready?'سرویس متصل است':'نیازمند راه‌اندازی';$('smsSetupHint').textContent=r.sms_ready?'کلیدهای اتصال پیامک در سمت سرور شناسایی شدند. برای فعال‌سازی ارسال، گردش پیامک باید به ارائه‌دهنده منتخب متصل شود.':'برای ارسال واقعی، نام ارائه‌دهنده و کلیدهای API باید به‌صورت Secret در سرور ثبت شوند؛ فعلاً هیچ پیامکی ارسال نمی‌شود.';}
$('siteSettingsForm').addEventListener('submit',async e=>{e.preventDefault();const b=$('saveSiteSettings');b.disabled=true;try{await api('update_settings',{instagram_url:$('settingInstagram').value.trim(),phone:$('settingPhone').value.trim(),address:$('settingAddress').value.trim(),show_instagram:$('showInstagram').checked,show_phone:$('showPhone').checked,show_address:$('showAddress').checked});say('siteSettingsFeedback','تنظیمات با موفقیت ذخیره شد.','success');}catch(err){say('siteSettingsFeedback',err.message,'error');}finally{b.disabled=false;}});
$('passwordForm').addEventListener('submit',async e=>{e.preventDefault();const current=$('currentPassword').value,next=$('newPassword').value,confirmNext=$('confirmNewPassword').value,b=$('passwordSubmit');if(next.length<8||next.length>128){say('passwordFeedback','رمز جدید باید بین ۸ تا ۱۲۸ نویسه باشد.','error');return;}if(next!==confirmNext){say('passwordFeedback','تکرار رمز جدید یکسان نیست.','error');return;}b.disabled=true;try{await api('change_password',{current_password:current,new_password:next});adminPassword=next;e.currentTarget.reset();say('passwordFeedback','رمز مدیریت با موفقیت تغییر کرد.','success');}catch(err){say('passwordFeedback',err.message,'error');}finally{b.disabled=false;}});
})();