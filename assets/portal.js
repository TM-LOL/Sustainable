"use strict";
// Member login, private documents and admin uploads via Supabase. Inactive until assets/config.js is filled in.
const Portal=(()=>{
const C=window.SECOE||{};let sb=null,user=null,role="member";const cbs=[];
const enabled=!!(C.supabaseUrl&&C.supabaseKey&&window.supabase);
if(enabled)sb=window.supabase.createClient(C.supabaseUrl,C.supabaseKey);
const EXT=["pdf","doc","docx","xls","xlsx","pptx"],MAX=20*1024*1024;
async function load(){if(!sb)return;const {data}=await sb.auth.getSession();user=data.session?data.session.user:null;role="member";
 if(user){const r=await sb.from("profiles").select("role").eq("id",user.id).single();if(r.data)role=r.data.role}}
return{enabled,
 async init(){await load();if(sb)sb.auth.onAuthStateChange(async()=>{await load();cbs.forEach(f=>f())})},
 onChange(f){cbs.push(f)},
 get user(){return user},
 isAdmin:()=>!!user&&role==="admin",
 async login(email,pw){const r=await sb.auth.signInWithPassword({email,password:pw});return r.error?r.error.message:null},
 logout:()=>sb.auth.signOut(),
 async docs(){if(!sb)return[];const r=await sb.from("documents").select("*").order("uploaded_at",{ascending:false});if(r.error)return[];
  return r.data.map(d=>({sb:d.id,path:d.file_path,title:d.title,description:d.description,category:d.category,file:d.file_name,version:d.version,date:d.uploaded_at,access:d.access,size:d.size_bytes?Math.max(1,Math.round(d.size_bytes/1024))+" KB":""}))},
 async download(path,name){const r=await sb.storage.from("resources").createSignedUrl(path,60,{download:name});if(r.error)return r.error.message;location.href=r.data.signedUrl;return null},
 async upload(file,m){const ext=(file.name.split(".").pop()||"").toLowerCase();
  if(!EXT.includes(ext))return"Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPTX.";if(file.size>MAX)return"File is larger than 20 MB.";
  const path=crypto.randomUUID()+"."+ext,u=await sb.storage.from("resources").upload(path,file);if(u.error)return u.error.message;
  const i=await sb.from("documents").insert({title:m.title,description:m.description,category:m.category,version:m.version,access:m.access,file_path:path,file_name:file.name,size_bytes:file.size});
  if(i.error){await sb.storage.from("resources").remove([path]);return i.error.message}return null},
 async remove(id,path){const r=await sb.from("documents").delete().eq("id",id);if(r.error)return r.error.message;await sb.storage.from("resources").remove([path]);return null}
}})();
