(function catalog(request={}) {
 const courseId=String(request.courseId||location.pathname.match(/\/(?:my\/)?course\/(\d+)/)?.[1]||'');
 if(!/^\d+$/.test(courseId))throw Error('Course ID required');
 const doc=request.html?new DOMParser().parseFromString(request.html,'text/html'):document;
 const tasks=[],groups=[];let groupId='intro',groupTitle='课程导学';
 const group=()=>{if(!groups.some(g=>g.id===groupId))groups.push({id:groupId,title:groupTitle});};
 for(const n of doc.querySelectorAll('.task-list > li')) {
  if(n.matches('.js-task-chapter')){groupId='group-'+groups.length;groupTitle=n.querySelector('.title')?.textContent.trim()||'未命名单元';group();continue;}
  if(!/^task_id_\d+$/.test(n.id))continue;group();
  const id=n.id.slice(8),title=n.querySelector('a.title')?.textContent.trim()||'',href=n.querySelector('a.title')?.getAttribute('href')||'';
  const url=new URL(href,'https://moocs.unipus.cn');
  if(url.origin!=='https://moocs.unipus.cn'||url.pathname!==`/course/${courseId}/task/${id}/show`)throw Error('Cross-course or unexpected task link');
  const type=n.querySelector('.right-menu i')?.className||'',state=(n.querySelector('.left-menu i')||n.querySelector('.left-menu'))?.className||'';
  let kind=/\bes-icon-videoclass\b/.test(type)?'video':/\bes-icon-zuoye\b/.test(type)?'homework':/\bes-icon-kaoshi\b/.test(type)?'unitQuiz':/\bes-icon-(?:description|graphicclass|mylibrarybooks)\b/.test(type)?'document':/\bes-icon-audioclass\b/.test(type)?'audio':'unknown';
  if(kind==='unitQuiz'&&/期末|期中|结课|final|midterm/i.test(title+' '+groupTitle))kind='finalExam';
  const status=/\bes-icon-(?:undone-check|doing)\b/.test(state)?'pending':/\bes-icon-(?:done-check|done|iccheckcircleblack24px)\b|\bcolor-success\b/.test(state)?'done':'unknown';
  tasks.push({id,title,kind,status,groupId,groupTitle,url:url.pathname,type});
 }
 if(!tasks.length||new Set(tasks.map(t=>t.id)).size!==tasks.length)throw Error('Empty catalog or duplicate tasks');
 const fingerprint=courseId+'|'+tasks.map(t=>[t.id,t.kind,t.groupId,t.url].join(':')).join('|');
 const accountKey=(doc.querySelector('header a[href^="/user/"],.navbar a[href^="/user/"]')?.getAttribute('href')||'').match(/^\/user\/(\d+)$/)?.[1]||null;
 return {version:2,courseId,title:doc.title.replace(/ - 中国高校外语慕课平台.*$/,''),accountKey,groups,tasks,fingerprint,counts:Object.fromEntries([...new Set(tasks.map(t=>t.kind))].map(k=>[k,tasks.filter(t=>t.kind===k).length]))};
})
