(function(){
'use strict';
const cfg=window.DELARIS_SUPABASE_CONFIG;
if(!cfg){document.getElementById('adminStatus').textContent='تنظیمات اتصال سایت پیدا نشد.';return;}
const $=id=>document.getElementById(id),endpoint=cfg.url+'/functions/v1/delaris-admin';
const loginCard=$('adminLoginCard'),setupCard=$('setupCard'),panel=$('adminPanel'),status=$('adminStatus'),list=$('adminGalleryList');
const say=(s,bad=false)=>{status.textContent=s;status.style.color=bad?'#ffaaa0':'#d7bd82';};
let adminPassword=null;
async function api(action,extra={},file=null){
 let headers={apikey:cfg.publishableKey},body;
 if(file){body=new FormData();body.append('action',action);body.append('password',adminPassword);body.append('file',file);body.append('alt_text',extra.alt_text||'نمونه کیک دلاریس کیک');}
 else {headers['Content-Type']='application/json';body=JSON.stringify({action,...extra});}
 const response=await fetch(endpoint,{method:'POST',headers,body});
 const result=await response.json().catch(()=>({error:'پاسخ سرور قابل خواندن نیست.'}));
 if(!response.ok)throw new Error(result.error||'درخواست انجام نشد.');
 return result;
}
function imageUrl(path){return cfg.url+'/storage/v1/object/public/delaris-cakes/'+encodeURIComponent(path);}
async function loadGallery(){
 list.textContent='در حال دریافت تصاویر…';
 const result=await api('list',{password:adminPassword});
 list.replaceChildren();
 if(!result.items.length){list.textContent='هنوز تصویری منتشر نشده است.';return;}
 result.items.forEach(item=>{
  const row=document.createElement('div');row.className='admin-gallery-item';
  const img=document.createElement('img');img.src=imageUrl(item.file_path);img.alt=item.alt_text;
  const label=document.createElement('span');label.textContent=item.alt_text;
  const del=document.createElement('button');del.type='button';del.textContent='حذف';
  del.addEventListener('click',async()=>{
   if(!confirm('این تصویر از گالری حذف شود؟'))return;
   del.disabled=true;
   try{await api('delete',{password:adminPassword,id:item.id});say('تصویر حذف شد.');await loadGallery();}
   catch(err){say(err.message,true);del.disabled=false;}
  });
  row.append(img,label,del);list.append(row);
 });
}
const setupToken=new URLSearchParams(location.search).get('setup');
if(setupToken){setupCard.hidden=false;loginCard.hidden=true;}
$('setupForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const p=$('setupPassword').value,confirmPassword=$('setupPasswordConfirm').value,b=e.currentTarget.querySelector('button');
 if(p.length<14){say('رمز باید حداقل ۱۴ نویسه داشته باشد.',true);return;}
 if(p!==confirmPassword){say('دو رمز واردشده یکسان نیستند.',true);return;}
 b.disabled=true;say('در حال ثبت امن رمز…');
 try{
  await api('setup',{setup_token:setupToken,password:p});
  e.currentTarget.reset();setupCard.hidden=true;loginCard.hidden=false;
  history.replaceState(null,'',location.pathname);
  say('رمز مدیریت با موفقیت تنظیم شد. حالا با همان رمز وارد شوید.');
 }catch(err){say(err.message,true);}
 finally{b.disabled=false;}
});
$('adminLoginForm').addEventListener('submit',async e=>{
 e.preventDefault();const b=e.currentTarget.querySelector('button'),p=$('adminPassword').value;
 b.disabled=true;say('در حال بررسی رمز…');
 try{
  await api('login',{password:p});adminPassword=p;loginCard.hidden=true;panel.hidden=false;
  $('adminPassword').value='';say('ورود موفق بود.');await loadGallery();
 }catch(err){adminPassword=null;say(err.message,true);}
 finally{b.disabled=false;}
});
$('cakeUploadForm').addEventListener('submit',async e=>{
 e.preventDefault();const file=$('cakeImage').files[0],b=e.currentTarget.querySelector('button');
 if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){say('فقط JPG، PNG یا WEBP تا حجم ۵ مگابایت مجاز است.',true);return;}
 b.disabled=true;say('در حال بارگذاری تصویر…');
 try{
  await api('upload',{alt_text:$('cakeAlt').value.trim()||'نمونه کیک دلاریس کیک'},file);
  e.currentTarget.reset();$('cakeAlt').value='نمونه کیک دلاریس کیک';say('تصویر با موفقیت در گالری منتشر شد.');await loadGallery();
 }catch(err){say(err.message,true);}
 finally{b.disabled=false;}
});
$('adminLogout').addEventListener('click',()=>{
 adminPassword=null;panel.hidden=true;loginCard.hidden=false;list.replaceChildren();say('از پنل خارج شدید.');
});
})();