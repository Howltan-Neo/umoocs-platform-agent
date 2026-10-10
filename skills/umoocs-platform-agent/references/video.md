# 视频适配与配置

当前标准适配器支持moocs.unipus.cn课程任务页与service-cdn.qiqiuyun.net标准HTML5视频SDK，实际跨账号课程样本使用video-player/1.2.0。其他来源先检查，不伪称全支持。

由智能体在当前账户的同源页面设置本地配置，安装或addInitScript加载脚本前后均应核对当前账号：

localStorage键：umoocs-platform-video-v2:course:课程ID:config
值：{courseId:'真实ID',accountKey:'当前目录识别的账号ID',videoTaskIds:['真实选中视频ID'],enabled:true,seekVerified:false}

没有有效配置默认不串播。videoTaskIds只能来自当前manifest中明确识别的视频，且符合已确认分工。不根据ID算术产生白名单。每次握手与推进重新核对服务器目录、账号、链接、状态。另一个账号必须重新配置。

首次经用户授权的跳转实验可临时设seekTrialAuthorized:true，只白名单选择样本。等待有限duration及readyState后，脚本设置真实currentTime=duration-3，从最后3秒1×自然播完。测得真实结束且目录完成后才设seekVerified:true并删除试验标志。有弹题按正常交互完成，不能跳过；完整倍速成功不证明跳转可行。

键umoocs-platform-video-v2:mode为seek或play；preferred-rate为1、4、8或16。未核验跳转时界面不可选择已验证跳转模式。播放结束最多等目录120秒；不认可则16×从头播放，再不认可1×从头播放，再失败停止。

标准清晰度菜单优先流畅，其次标清；没有可识别选项不乱选。实际倍速被播放器限制时显示实际速度。暂停串播不暂停当前媒体，可拖动面板并保存位置，方向键也可移动。

## video-popup.js

标准SDK单选弹题适配器：snapshot返回当前最上层可见题目、选项、schema、按钮及反馈。读取DOM可见题目，不读隐藏答案。AI独立解答后select({authorized:true,schema,answer:'选项标签'})；读回选中后confirm同参数；核验实际反馈后finish同schema关闭已批阅弹窗。每一步核对当前题目身份，题目切换后重新snapshot。多个叠加弹窗只处理最上层，不点击隐藏题。

该功能由智能体执行，纯油猴没有AI推理能力。未授权AI弹题或题型不支持时提示人工，不能删除弹窗来恢复播放。标准播放器中的单选弹题已在8339实际验证两题均正确。

同一课程不要同时启用原8021专用脚本与本通用脚本，避免重复控制；保留原仓库不代表同时启用两个播放器助手。

