"use client";

import { useRouter } from 'next/navigation';

export default function BookDetail() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div>
        {/* 返回按钮 */}
        <div style={{ padding: "10px" }} onClick={handleBack}>
            <img src="back-svgrepo-com.svg" style={{ cursor: "pointer", width: "32px", height: "auto" }}></img>
        </div>
        

      {/* 图书详情内容 */}
      <div style={{ background: "#fff", display: "flex", justifyContent: "center", alignItems: "start", margin: "0 auto" }}>
        <div style={{ width: "336px", padding: "10px 0" }}>
          
          {/* 图书基本信息 */}
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", flexDirection : 'column' }}>
            {/* 图书封面 */}
            <img 
              src="/placeHolder.png" 
              style={{ width: "182px", height: "auto", objectFit: "contain", boxShadow : "0 4px 8px rgba(0, 0, 0, 0.2)" }}
              alt="图书封面"
            />
            
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", height: "180px", flex: 1 }}>
              <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", marginTop : "20px", color: "#333" }}>
                《春心》
              </div>

              {/* 投票状态 */}
              <div style={{ marginTop: 'auto', display: "flex", justifyContent: "center", alignItems: "center", border: "2px solid #0D2EA9" }}>
                <div style={{color: "#0D2EA9", fontWeight: 700, padding: '0px 4px'}}>128</div>
                <div style={{ background: '#0D2EA9', color: "#fff", fontWeight: 700, paddingLeft: '8px', paddingRight: '6px' }}>票</div>
              </div>

              <p style={{ fontSize: '14px', marginBottom : '2px', color: '#000', marginTop : '18px' }}>作者：张悦然</p>
              <p style={{ fontSize: '14px', marginBottom : '2px', color: '#000' }}>品牌：KEY可以</p>
              <p style={{ fontSize: '14px', marginBottom : '2px', color: '#000' }}>出版时间：2024年</p>
              
            </div>
          </div>

        </div>


      </div>

      <img style={{ width : '100%', height : 'auto', marginTop : '-9px'}} src="whiteWave.png" alt="Description" />


      <div style={{ background: "#efefef", display: "flex", justifyContent: "center", alignItems: "start", margin: "0 auto", paddingBottom: "75px" }}>
        <div style={{ width: "336px", padding: "10px 0" }}>
          
          {/* 图书简介 */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "#333" }}>关于这本书</h3>
            <p style={{ fontSize: "14px", lineHeight: "24px", color: "#666" }}>
              这是一本关于青春、成长和情感的作品。作者以细腻的笔触描绘了现代都市中年轻人的内心世界，
              探讨了爱情、友情和自我认知的主题。小说情节跌宕起伏，人物形象鲜明，是一部值得细读的佳作。
            </p>
          </div>

        </div>


      </div>

      {/* 底部导航 */}
      <div style={{ 
        width: "100%", 
        background: "#000", 
        position: "fixed", 
        bottom: "0", 
        left: "0", 
        height: "75px", 
        display: "flex", 
        justifyContent: "space-around", 
        alignItems: "center", 
        flexDirection: "column", 
        color: "#fff", 
        fontSize: "14px" 
      }}>
        <div style={{textAlign: "center"}}>
          <div>点击投票</div>
          <div style={{fontSize: '12px', color: '#D9D9D9'}}>今日剩余投票数：1</div>
        </div>
      </div>
    </div>
  );
}
