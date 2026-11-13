(function(){
'use strict';
const cfg=window.DELARIS_SUPABASE_CONFIG;
if(!cfg||!window.supabase?.createClient)return;
const db=window.supabase.createClient(cfg.url,cfg.publishableKey),$=id=>document.getElementById(id);
const loginCard=$('adminLoginCard'),panel=$('adminPanel'),status=$('adminStatus'),list=$('adminGalleryList');
const say=(s,bad=false)=>{status.textContent=s;status.style.color=bad?'#ffaaa0':'#d7bd82';};
let currentUser=null;
async function checkAdmin(){
 const {data:{session}}=await db.auth.getSession();
 if(!session){loginCard.hidden=false;panel.hidden=true;return false;}
 const {data,error}=await db.from('delaris_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
 if(error||!data){await db.auth.signOut();loginCard.hidden=false;panel.hidden=true;say('این حساب دسترسی مدیریت ندارد.',true);return false;}
 currentUser=session.user;loginCard.hidden=true;panel.hidden=false;await loadGallery();return true;
}
async function loadGallery(){
 const {data,error}=await db.from('delaris_gallery_images').select('id,file_path,alt_text,created_at').order('created_at',{ascending:false});
 if(error){list.textContent='دریافت گالری ممکن نشد: '+error.message;return;}
 list.replaceChildren();
 if(!data.length){list.textContent='هنوز تصویری منتشر نشده است.';return;}
 data.forEach(item=>{
  const url=db.storage.from('delaris-cakes').getPublicUrl(item.file_path).data.publicUrl;
  const row=document.createElement('div');row.className='admin-gallery-item';
  const img=document.createElement('img');img.src=url;img.alt=item.alt_text;
  const label=document.createElement('span');label.textContent=item.alt_text;
  const del=document.createElement('button');del.type='button';del.textContent='حذف';
  del.addEventListener('click',async()=>{
   if(!confirm('این تصویر از گالری حذف شود؟'))return;
   del.disabled=true;
   const rm=await db.storage.from('delaris-cakes').remove([item.file_path]);
   if(rm.error){say('حذف فایل انجام نشد: '+rm.error.message,true);del.disabled=false;return;}
   const gone=await db.from('delaris_gallery_images').delete().eq('id',item.id);
   if(gone.error){say('فایل حذف شد اما رکورد گالری حذف نشد: '+gone.error.message,true);return;}
   say('تصویر حذف شد.');await loadGallery();
  });
  row.append(img,label,del);list.append(row);
 });
}
$('adminLoginForm').addEventListener('submit',async e=>{
 e.preventDefault();const b=e.currentTarget.querySelector('button');b.disabled=true;say('در حال بررسی حساب مدیر…');
 const {error}=await db.auth.signInWithPassword({email:$('adminEmail').value.trim(),password:$('adminPassword').value});
 b.disabled=false;
 if(error){say('ایمیل یا رمز عبور معتبر نیست.',true);return;}
 await checkAdmin();
});
$('cakeUploadForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!currentUser){say('ابتدا وارد حساب مدیر شوید.',true);return;}
 const file=$('cakeImage').files[0],button=e.currentTarget.querySelector('button');
 if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){say('فقط JPG، PNG یا WEBP تا ۵ مگابایت مجاز است.',true);return;}
 button.disabled=true;say('در حال بارگذاری تصویر…');
 const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
 const path=Date.now()+'-'+crypto.randomUUID()+'.'+ext;
 const uploaded=await db.storage.from('delaris-cakes').upload(path,file,{contentType:file.type,upsert:false});
 if(uploaded.error){say('بارگذاری انجام نشد: '+uploaded.error.message,true);button.disabled=false;return;}
 const saved=await db.from('delaris_gallery_images').insert({file_path:path,alt_text:$('cakeAlt').value.trim()||'نمونه کیک دلاریس کیک',created_by:currentUser.id});
 if(saved.error){await db.storage.from('delaris-cakes').remove([path]);say('ثبت تصویر در گالری انجام نشد: '+saved.error.message,true);button.disabled=false;return;}
 e.currentTarget.reset();$('cakeAlt').value='نمونه کیک دلاریس کیک';say('تصویر با موفقیت در گالری منتشر شد.');await loadGallery();button.disabled=false;
});
$('adminLogout').addEventListener('click',async()=>{await db.auth.signOut();currentUser=null;loginCard.hidden=false;panel.hidden=true;say('از پنل خارج شدید.');});
checkAdmin().catch(e=>say('خطا در بررسی حساب: '+e.message,true));
})();