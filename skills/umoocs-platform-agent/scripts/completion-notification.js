(async function repair(request={}) {
 if(request.authorized!==true)throw Error('Explicit native notification repair authorization required');
 const {manifest,scope}=request,courseId=String(manifest?.courseId||''),id=String(request.taskId||'');
 if(!/^\d+$/.test(courseId)||!/^\d+$/.test(id)||manifest?.version!==2||scope?.version!==2||scope.courseId!==courseId||scope.fingerprint!==manifest.fingerprint||scope.assignments?.[id]!=='ai')throw Error('Current course and AI scope required');
 const task=manifest.tasks.find(t=>t.id===id);
 if(!task||!['homework','unitQuiz'].includes(task.kind)||location.pathname!==`/course/${courseId}/task/${id}/activity_show`)throw Error('Verified unit result frame required; final exams excluded');
 const inspect=async()=>{
  const r=await fetch(`/my/course/${courseId}`,{cache:'no-store',credentials:'same-origin'});if(!r.ok||!r.url.endsWith(`/my/course/${courseId}`))throw Error('Catalog or login unavailable');
  const d=new DOMParser().parseFromString(await r.text(),'text/html');const account=(d.querySelector('header a[href^="/user/"],.navbar a[href^="/user/"]')?.getAttribute('href')||'').match(/^\/user\/(\d+)$/)?.[1];
  const n=d.querySelector(`#task_id_${id}`),type=n?.querySelector('.right-menu i')?.className||'';
  if(!account||account!==String(manifest.accountKey)||n?.querySelector('a.title')?.getAttribute('href')!==task.url||!(task.kind==='homework'?/\bes-icon-zuoye\b/:/\bes-icon-kaoshi\b/).test(type))throw Error('Account or live task identity changed');
  return n.querySelector('.left-menu')?.className.includes('iccheckcircleblack24px')===true;
 };
 if(await inspect())return {done:true,skipped:true,reason:'Already complete'};
 const t=document.body.innerText,rows=[...document.querySelectorAll('.testpaper-question')];
 if(!t.includes('批阅完成')||!rows.length||rows.some(n=>!/回答正确|你答对了|回答错误|你答错了/.test(n.innerText)))throw Error('Fully graded result required');
 if(task.kind==='homework'&&rows.some(n=>/回答错误|你答错了/.test(n.innerText)))throw Error('All-correct homework required');
 if(task.kind==='unitQuiz'&&(!t.includes('恭喜您已通过本次考试')||!Number.isFinite(Number(t.match(/(\d+(?:\.\d+)?)\s*分\s*\n总分/)?.[1]))))throw Error('Visible passed quiz grade required');
 if(typeof window.webpackJsonp!=='function'||![...document.scripts].some(s=>s.src.includes('/common.js?version=8.2.9_26.06.15')))throw Error('Native notifier version unsupported');
 let Native;const moduleId=`umoocs_restore_${id}`;window.webpackJsonp([],{[moduleId]:(m,e,r)=>{Native=r('da32dea28c2b82c7aab1').default;}},[moduleId]);
 const emitter=new Native();await new Promise(r=>setTimeout(r,1000));
 await Promise.race([emitter.emit('finish',{data:''}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Notification timed out')),15000))]);
 return {taskId:id,done:await inspect(),skipped:false};
})
