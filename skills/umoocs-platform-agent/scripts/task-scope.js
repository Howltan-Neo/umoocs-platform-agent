(function scopeCheck(request) {
 const {scope,manifest,taskId}=request||{};
 if(scope?.version!==2||manifest?.version!==2||scope.courseId!==manifest.courseId||scope.fingerprint!==manifest.fingerprint)throw Error('Course or catalog changed');
 if(!scope.assignments||Object.keys(scope.assignments).some(id=>!manifest.tasks.some(t=>t.id===id)||!['ai','manual'].includes(scope.assignments[id])))throw Error('Invalid task assignments');
 if(taskId===undefined)return {valid:true};
 const t=manifest.tasks.find(t=>t.id===String(taskId));
 if(!t||t.status==='unknown'||!['homework','unitQuiz','finalExam','video'].includes(t.kind))return {decision:'blocked',reason:'Unknown task, status or unsupported type'};
 const decision=scope.assignments[t.id]||'manual';
 return {decision,task:t};
})
