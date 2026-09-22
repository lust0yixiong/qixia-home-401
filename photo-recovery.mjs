// An abandoned import must never change the user's newer quality selection.
export async function runPhotoRequest({load,isCurrent,ready,failed}){
 try{const module=await load();if(isCurrent())await ready(module);}
 catch(error){if(isCurrent())failed(error);}
}
export function photoFailureMessage(error){
 const detail=String(error?.message||error||'未知错误').slice(0,500);
 let advice='可以重试；若仍失败，请保留下面的错误信息。';
 if(/fetch|network|import|load.*module/i.test(detail))advice='照片级文件未能加载，请刷新网页后重试。';
 else if(/shader|compile|着色器|编译/i.test(detail))advice='显卡未能编译照片级效果，可以重试或手动选择高画质。';
 else if(/memory|allocation|out of|context.*lost/i.test(detail))advice='图形资源不足或连接中断，可关闭其他三维页面后重试。';
 return `照片级未完成启动，当前仅显示实时预览。${advice}\n错误：${detail}`;
}
