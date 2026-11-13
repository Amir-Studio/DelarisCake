(function(){
'use strict';
const cfg=window.DELARIS_SUPABASE_CONFIG;
if(!cfg){document.getElementById('adminStatus').textContent='تنظیمات اتصال سایت پیدا نشد.';return;}
const $=id=>document.getElementById(id),endpoint=cfg.url+'/functions/v1/delaris-admin';
const loginCard=$('adminLoginCard'),setupCard=$('setupCard'),panel=$('adminPanel'),status=$('adminStatus'),list=$('adminGalleryList');
const say=(s,bad=false)=>{status.textContent=s;status.style.color=bad?'#ffaaa0':'#d7bd82';};
const setupFeedback=(message,type='')=>{const el=$('setupFeedback');if(!el)return;el.textContent=message;el.className='admin-feedback'+(type?' is-'+type:'');};
const setBusy=(button,busy,label)=>{button.disabled=busy;button.setAttribute('aria-busy',String(busy));button.innerHTML=busy?'<span class="admin-spinner" aria-hidden="true"></span>'+label:label;};
let adminPassword=null;
async function api(action,extra={},file=null){
 let headers={apikey:cfg.publishableKey},body;
 if(file){body=new FormData();body.append('action',action);body.append('password',adminPassword);body.append('file',file);body.append('alt_text',extra.alt_text||'نمونه کیک دلاریس کیک');}
 else {headers['Content-Type']='application/json';body=JSON.stringify({action,...extra});}
 let response;try{response=await fetch(endpoint,{method:'POST',headers,body,signal:AbortSignal.timeout(25000)});}catch(err){if(err.name==='TimeoutError')throw new Error('پاسخ سرور بیش از ۲۵ ثانیه طول کشید؛ اتصال اینترنت را بررسی و دوباره تلاش کنید.');throw new Error('ارتباط با سرور برقرار نشد؛ اینترنت یا فیلترشکن را بررسی کنید.');}
 const result=await response.json().catch(()=>({error:'پاسخ سرور قابل خواندن نیست.'}));
 if(!response.ok)throw new Error(result.error||'درخواست انجام نشد.');
 return result;
}
async function uploadFile(file,altText,onProgress){
 const body=new FormData();
 body.append('action','upload');body.append('password',adminPassword);
 body.append('file',file);body.append('alt_text',altText||'نمونه کیک دلاریس کیک');
 return await new Promise((resolve,reject)=>{
  const xhr=new XMLHttpRequest();
  xhr.open('POST',endpoint);xhr.setRequestHeader('apikey',cfg.publishableKey);xhr.timeout=90000;
  xhr.upload.addEventListener('progress',event=>{
   if(event.lengthComputable)onProgress(Math.min(100,Math.round(event.loaded/event.total*100)));
  });
  xhr.addEventListener('load',()=>{
   let result={};try{result=JSON.parse(xhr.responseText||'{}');}catch(_){result={error:'پاسخ سرور قابل خواندن نیست.'};}
   if(xhr.status>=200&&xhr.status<300)resolve(result);
   else reject(new Error(result.error||'بارگذاری تصویر انجام نشد.'));
  });
  xhr.addEventListener('error',()=>reject(new Error('ارتباط با سرور هنگام آپلود قطع شد.')));
  xhr.addEventListener('timeout',()=>reject(new Error('آپلود بیش از ۹۰ ثانیه طول کشید؛ دوباره تلاش کنید.')));
  xhr.send(body);
 });
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
document.querySelectorAll('.password-toggle').forEach(button=>{
 button.addEventListener('click',()=>{
  const input=$(button.dataset.target);
  if(!input)return;
  const reveal=input.type==='password';
  input.type=reveal?'text':'password';
  button.setAttribute('aria-pressed',String(reveal));
  button.setAttribute('aria-label',reveal?'مخفی‌کردن رمز':'نمایش رمز');
  button.title=reveal?'مخفی‌کردن رمز':'نمایش یا مخفی‌کردن رمز';
  input.focus();
 });
});
const setupToken=new URLSearchParams(location.search).get('setup');
if(setupToken){setupCard.hidden=false;loginCard.hidden=true;}
$('setupForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const form=e.currentTarget,p=$('setupPassword').value,confirmPassword=$('setupPasswordConfirm').value,b=$('setupSubmitButton'),label='ثبت رمز مدیریت';
 setupFeedback('');
 if(p.length<8){setupFeedback('رمز باید حداقل ۸ نویسه داشته باشد.','error');return;}
 if(p!==confirmPassword){setupFeedback('دو رمزی که وارد کرده‌اید یکسان نیستند.','error');return;}
 setBusy(b,true,'در حال ثبت رمز…');setupFeedback('درخواست به سرور ارسال شد؛ لطفاً صفحه را نبندید.');
 try{
  const result=await api('setup',{setup_token:setupToken,password:p});
  if(!result.ok)throw new Error(result.error||'سرور ثبت رمز را تأیید نکرد.');
  form.reset();form.hidden=true;loginCard.hidden=false;
  history.replaceState(null,'',location.pathname);
  setupFeedback('✓ رمز مدیریت با موفقیت ثبت شد. اکنون می‌توانید از بخش ورود مدیر وارد شوید.','success');
  say('راه‌اندازی رمز مدیریت با موفقیت انجام شد.');
 }catch(err){
  setupFeedback('ثبت رمز انجام نشد: '+(err.message||'خطای نامشخص')+' — می‌توانید دوباره تلاش کنید.','error');
  say(err.message||'ثبت رمز ناموفق بود.',true);
 }finally{
  if(!form.hidden)setBusy(b,false,label);
 }
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
const cakeForm=$('cakeUploadForm'),cakeInput=$('cakeImage'),previewBox=$('cakePreviewBox'),previewImg=$('cakePreview'),progressBox=$('cakeUploadProgress'),progressBar=$('cakeUploadBar'),progressPercent=$('cakeUploadPercent'),progressState=$('cakeUploadState');
let previewObjectUrl=null;
const MAX_IMAGE_SIZE=5*1024*1024,ALLOWED_IMAGE_TYPES=['image/jpeg','image/png','image/webp'];
function clearPreview(){
 if(previewObjectUrl){URL.revokeObjectURL(previewObjectUrl);previewObjectUrl=null;}
 previewImg.removeAttribute('src');previewBox.hidden=true;progressBox.hidden=true;
}
cakeInput.addEventListener('change',()=>{
 clearPreview();const file=cakeInput.files&&cakeInput.files[0];if(!file)return;
 if(!ALLOWED_IMAGE_TYPES.includes(file.type)){cakeInput.value='';say('فرمت تصویر معتبر نیست؛ فقط JPG، PNG یا WEBP مجاز است.',true);return;}
 if(file.size>MAX_IMAGE_SIZE){cakeInput.value='';say('حجم تصویر بیشتر از ۵ مگابایت است؛ لطفاً عکس کوچک‌تری انتخاب کنید.',true);return;}
 previewObjectUrl=URL.createObjectURL(file);previewImg.src=previewObjectUrl;
 $('cakeFileName').textContent=file.name;$('cakeFileSize').textContent=(file.size/1024/1024).toFixed(2)+' مگابایت';
 previewBox.hidden=false;say('تصویر انتخاب شد و آماده بارگذاری است.');
});
cakeForm.addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,file=cakeInput.files&&cakeInput.files[0],b=form.querySelector('button');
 if(!file){say('ابتدا یک تصویر انتخاب کنید.',true);return;}
 if(!ALLOWED_IMAGE_TYPES.includes(file.type)||file.size>MAX_IMAGE_SIZE){say('فقط JPG، PNG یا WEBP تا حجم ۵ مگابایت مجاز است.',true);return;}
 const label=b.textContent;b.disabled=true;b.setAttribute('aria-busy','true');
 progressBox.hidden=false;progressBar.style.width='0%';progressPercent.textContent='۰٪';progressState.textContent='در حال ارسال تصویر…';say('آپلود تصویر شروع شد…');
 try{
  await uploadFile(file,$('cakeAlt').value.trim()||'نمونه کیک دلاریس کیک',percent=>{
   progressBar.style.width=percent+'%';progressPercent.textContent=percent.toLocaleString('fa-IR')+'٪';
   progressState.textContent=percent>=100?'تصویر ارسال شد؛ در حال ثبت در گالری…':'در حال آپلود تصویر…';
  });
  progressBar.style.width='100%';progressPercent.textContent='۱۰۰٪';progressState.textContent='آپلود کامل شد؛ در حال تازه‌سازی گالری…';
  form.reset();$('cakeAlt').value='نمونه کیک دلاریس کیک';clearPreview();
  say('تصویر با موفقیت در گالری منتشر شد.');await loadGallery();
 }catch(err){say(err.message,true);progressState.textContent='آپلود ناموفق بود؛ می‌توانید دوباره تلاش کنید.';}
 finally{b.disabled=false;b.removeAttribute('aria-busy');}
});
$('adminLogout').addEventListener('click',()=>{
 adminPassword=null;panel.hidden=true;loginCard.hidden=false;list.replaceChildren();say('از پنل خارج شدید.');
});
})();