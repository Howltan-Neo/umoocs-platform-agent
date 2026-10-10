# 运行协议

所有JS助手是函数表达式，浏览器环境求值后传入参数。只读工具不能执行写入动作；使用宿主明确允许的写入能力或普通UI操作。没有硬编码本机运行环境的安装要求。

## catalog.js

参数：{courseId, html?}。未给html时解析当前目录document；调用者获取HTML时必须核对登录、响应URL及课程归属。
输出：version:2、courseId、title、accountKey、groups、tasks、fingerprint、counts。accountKey仅用于本地账号校验，不公开。
类型来自图标：video、homework、unitQuiz、finalExam、document、audio、unknown。期末/期中/结课分类结合试卷图标及章节/标题；仍需人工智能读取说明核对。status为pending/done/unknown。重复ID或异课程链接报错。

## task-picker.js

显示：{manifest, scope?}。只有同账号已有明确分工才预填。由用户勾选，不替用户点击确认。
读取：{action:'read'}，返回pending、missing或confirmed及scope。
重开：{action:'reset',manifest,scope:同账号已确认分工}，只影响未开始任务。
scope.version=2，courseId、fingerprint及assignments记录每个真实任务ID的ai/manual，video记录enabled、taskIds、answerPopups，repairNativeNotifications记录通知恢复选择。
未选任务默认manual，文档/音频/unknown不自动选为AI。原v1的固定15单元配置不通用，重新生成v2配置。

## task-scope.js

参数：{manifest,scope,taskId?}。仅判断范围，不登录、开始或提交。账号改变重新获取manifest并确认scope；每次启动和提交核对当前账号。fingerprint含任务ID、类型、分组和链接，状态变化不改变指纹。目录变动则停止并重新核对。

## assessment-dom.js

snapshot提取schema及字段；构造plan={url,title,schema,answers:{题目ID:{kind:'choice'或'text',values:字符串数组}}}。
fill完整预校验后填写；verify读回并输出readyToSubmit和mismatches。必须题数、材料、题目文字、字段ID、选项值都与快照一致。无支持字段、混合字段、只读字段或结构改变停止，不能忽略未填项。无需把题号顺序当成DOM顺序。

## completion-notification.js

仅在恢复选择和用户授权均已确认、真实成绩核验通过但目录未同步时调用：{authorized:true,manifest,scope,taskId}。必须原任务activity_show批阅结果页。
返回done及skipped。先读取当前账号目录，已完成即跳过；核验任务类型与链接、全批阅结果，再按受支持版本的原通知模块补发finish。普通作业要求全对，单元测验要求界面明确通过且可见分数。期末/期中/结课、未知版本、未批阅或未通过都停止。最多一次，失败记录，不反复刷通知。
原通知模块版本：common.js?version=8.2.9_26.06.15，webpack模块da32dea28c2b82c7aab1。必须重新核对才能适配不同版本；模块ID不是平台长期承诺。

