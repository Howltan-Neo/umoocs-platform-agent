(function popup(request={}) {
 const roots=[...document.querySelectorAll('.plugin-exampop-prompt-content')];
 const root=roots.find(n=>{const r=n.querySelector('.exam_option_list')?.getBoundingClientRect();return r&&r.width>0&&document.elementFromPoint(r.x+r.width/2,r.y+15)?.closest('.plugin-exampop-prompt-content')===n;});
 if(!root)return {status:'none'};
 const question=root.querySelector('.exam_question-title')?.innerText||'';
 const items=[...root.querySelectorAll('.exam_option_list li')];
 const options=items.map(n=>({label:n.querySelector('.num')?.textContent.trim(),text:n.querySelector('.text')?.innerText||'',selected:n.classList.contains('selected')}));
 const buttons=[...root.querySelectorAll('.modal-footer a')].map(a=>a.innerText.trim());
 const schema=JSON.stringify({question,options:options.map(({label,text})=>({label,text}))});
 if(request.action==='snapshot'||!request.action)return {status:'question',question,options,buttons,schema,feedback:root.innerText.slice(-600)};
 if(request.authorized!==true||request.schema!==schema)throw Error('Popup authorization or identity mismatch');
 if(!root.innerText.includes('单选题'))throw Error('Unsupported popup question format');
 if(request.action==='select'){
  const i=options.findIndex(o=>o.label===request.answer);if(i<0)throw Error('Unknown option');items[i].click();return {selected:items[i].classList.contains('selected'),answer:request.answer};
 }
 if(request.action==='confirm'){
  const chosen=options.filter(o=>o.selected);if(chosen.length!==1||chosen[0].label!==request.answer)throw Error('Popup answer readback failed');
  const a=[...root.querySelectorAll('.modal-footer a')].find(a=>a.innerText.trim()==='确认答案');if(!a)throw Error('Popup already submitted');a.click();return {feedback:root.innerText.slice(-600)};
 }
 if(request.action==='finish'){
  if(!/回答正确|回答错误/.test(root.innerText))throw Error('Popup result not verified');
  const a=[...root.querySelectorAll('.modal-footer a')].find(a=>a.innerText.trim()==='完成');if(!a)throw Error('Finish button missing');a.click();return {closed:true};
 }
 throw Error('Unsupported popup action');
})
