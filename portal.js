import { createClient } from '@supabase/supabase-js'
const db=createClient('https://ktrprrplobzkjpbzkxab.supabase.co','sb_publishable_l35jnyuclubR62_ZzHBVEA_4wqMK8LW')
const el=id=>document.getElementById(id)
const date=value=>new Date(value).toLocaleString('az-AZ')
const states={requested:'Baxılır',confirmed:'Təsdiqləndi',proposed:'Yeni vaxt təklif edildi',declined:'Qəbul edilmədi'}
const invite=location.hash.match(/^#invite=([a-f0-9-]{36})$/i)
if(invite){sessionStorage.setItem('patientInvitation',invite[1]);history.replaceState(null,'','#kabinet')}
function cards(id, rows, empty){
 const root=el(id)
 root.replaceChildren()
 if(!rows.length){root.textContent=empty;return}
 for(const [title,body] of rows){
  const article=document.createElement('article'),heading=document.createElement('strong'),p=document.createElement('p')
  heading.textContent=title;p.textContent=body;article.append(heading,p);root.append(article)
 }
}
let generation=0
async function cabinet(user){
 const current=++generation
 el('auth').hidden=!!user;el('member').hidden=!user
 el('results').replaceChildren();el('requests').replaceChildren();el('notice').textContent=''
 el('identity').textContent=user?.email??''
 if(!user)return
 try{
  const token=sessionStorage.getItem('patientInvitation')
  if(token){
   const claim=await db.rpc('portal_accept_invitation',{token})
   if(current!==generation)return
   if(claim.error)throw claim.error
   if(claim.data)sessionStorage.removeItem('patientInvitation')
   else el('notice').textContent='Dəvət artıq istifadə olunub və ya bu e-poçta aid deyil.'
  }
  const profile=await db.from('portal_patients').select('id').eq('account_id',user.id).maybeSingle()
  if(profile.error)throw profile.error
  const [results,bookings]=await Promise.all([profile.data?db.from('portal_results').select('title,explanation,published_at').eq('patient_id',profile.data.id).order('published_at',{ascending:false}):{data:[]},db.from('portal_bookings').select('status,requested_at,scheduled_at').eq('account_id',user.id).order('created_at',{ascending:false})])
  if(current!==generation)return
  if(results.error||bookings.error)throw Error()
  cards('results',results.data.map(r=>[r.title,date(r.published_at)+'\n'+r.explanation]),'Hələ sizinlə nəticə paylaşılmayıb.')
  cards('requests',bookings.data.map(b=>[states[b.status],date(b.scheduled_at??b.requested_at)]),'Hələ görüş sorğunuz yoxdur.')
 }catch{if(current===generation)el('notice').textContent='Məlumat yüklənmədi. Yenidən yoxlayın.'}
}
let activeUser
db.auth.onAuthStateChange((_event,session)=>{activeUser=session?.user;setTimeout(()=>cabinet(activeUser),0)})
el('refresh').onclick=()=>cabinet(activeUser)
window.addEventListener('focus',()=>{if(activeUser)cabinet(activeUser)})
el('logout').onclick=async()=>{const {error}=await db.auth.signOut({scope:'local'});if(error)el('notice').textContent='Çıxış alınmadı.'}
function handler(id,action){
 const form=el(id)
 form.onsubmit=async e=>{
  e.preventDefault()
  const buttons=[...form.querySelectorAll('button')]
  if(buttons.some(b=>b.disabled))return
  buttons.forEach(b=>b.disabled=true)
  const out=form.querySelector('output')
  try{out.textContent='Gözləyin…';out.textContent=await action(new FormData(form),e.submitter?.value)}
  catch{out.textContent='Sorğu alınmadı. Məlumatları və bağlantını yoxlayın.'}
  finally{buttons.forEach(b=>b.disabled=false)}
 }
}
handler('auth',async(data,mode)=>{
 const email=data.get('email').trim(),password=data.get('password')
 const result=mode==='register'?await db.auth.signUp({email,password,options:{data:{portal:'patient'},emailRedirectTo:location.origin+'/'}}):await db.auth.signInWithPassword({email,password})
 if(result.error)return mode==='register'?'Qeydiyyat alınmadı. E-poçtu və şifrənin uzunluğunu yoxlayın.':'Daxil olmaq alınmadı. E-poçtu, təsdiq məktubunu və şifrəni yoxlayın.'
 el('auth').reset()
 return result.data.session?'': 'E-poçtunuza gələn təsdiq keçidini açın, sonra bu səhifədə daxil olun.'
})
handler('booking',async data=>{
 const time=new Date(data.get('time'))
 if(time<=new Date())return 'Gələcək tarix və saat seçin.'
 const {error}=await db.from('portal_bookings').insert({contact:data.get('contact').trim(),requested_at:time.toISOString()})
 if(error)throw error
 el('booking').reset()
 if(activeUser)await cabinet(activeUser)
 return activeUser?'Sorğunuz göndərildi. Cavabı kabinetinizdə görə bilərsiniz.':'Sorğunuz göndərildi. Cavab üçün göstərdiyiniz əlaqə vasitəsindən istifadə ediləcək.'
})
db.from('portal_articles').select('title,body').order('published_at',{ascending:false}).then(({data,error})=>cards('articles',(data??[]).map(a=>[a.title,a.body]),error?'Məqalələr yüklənmədi.':'İlk məqalə burada yayımlanacaq.'))
