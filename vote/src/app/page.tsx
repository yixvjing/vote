"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import VoteRulesModal from '../components/VoteRulesModal';
import LoginModal from '../components/LoginModal';

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleBookClick = () => {
    router.push('/bookDetail');
  };

  const pickBook = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，防止触发父元素的点击事件
    // 处理选择逻辑
  }

  const openModal = () => {
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  }

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  }

  return (
    <div style={{ paddingBottom: "75px" }}>
      
      <div style={{ background: "#0D2EA9" }}>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "start", width: "370px", margin: "0 auto" }}>
          <div>
            <img src="title.svg" alt="Description" />
            <p style={{ padding : "10px 14px", color : "#fff", fontSize : "12px", lineHeight : "25px" }}>
              我们与LESS品牌始终主张，阅读不应该只有功利目的，阅读的重要目的，可以是悦已。<br/>
              LESS新世相出版奖除了由专业评委选出值得推崇的图书和品牌，也希望与更多阅读者一起完成一次「共同行动」。<br/>
              悦已榜的设立，是从专业评审提名的年度TOP100出版物中，邀请全民参与票选出10佳「年度榜单」。<br/>
              榜单的评选标准只有一个：你心目中「悦已」的标准。你喜欢的，就是最好的。<br/><br/>

              我们邀请你参与投票，选出你最喜欢的10本书。如果哪本书为你带来过愉悦，请你支持它。
            </p>
            <div 
              style={{ 
                margin: '20px 0', 
                padding : '10px 0', 
                fontSize : '14px', 
                textDecoration : 'underline', 
                textAlign : 'center', 
                color : "#fff",
                cursor: 'pointer'
              }}
              onClick={openModal}
            >
              点击查看投票规则
            </div>
          </div>
        </div>

      </div>

      <img style={{ width : '100%', height : 'auto', marginTop : '-9px'}} src="bottomWave.png" alt="Description" />


      <div style={{ background: "#fff", display: "flex", justifyContent: "center", alignItems: "start", width: "370px", margin: "0 auto" }}>

        <div>

          <div 
            style={{ 
              width : '336px', 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "flex-end", 
              padding : "19px 0", 
              borderBottom : "1px solid #B3B6B7",
              cursor: "pointer"
            }}
            onClick={handleBookClick}
          >

            <img src="placeHolder.png" style={{ width : "69px", height : "105px", objectFit : "contain" }}></img>

            <div style={{ display: "flex", flexDirection : "column", justifyContent : "center", alignItems : "flex-start", height : "105px", flex : 1, marginLeft : "22px" }}>
              <div style={{ fontSize: "16px", fontWeight : 700, marginBottom : "8px" }}>
                <span style={{ color: "#0D2EA9" }}>01</span>
                《春心》
              </div>
              <p style={{ fontSize : '13px' }}>作者：张悦然</p>
              <p style={{ fontSize : '13px' }}>品牌：KEY可以</p>
              <div style={{ marginTop : '8px', display: "flex", justifyContent : "center", alignItems : "center", border : "2px solid #0D2EA9" }}>
                <div style={{color : "#0D2EA9", fontWeight : 700, padding: '0 3px'}}>10</div>
                <div style={{ background : '#0D2EA9', color : "#fff", fontWeight : 700, paddingLeft : '7px', paddingRight : '5px' }}>票</div>
              </div>
            </div>

            <div onClick={(e) => { pickBook(e) /* 处理取消选择逻辑 */ }} style={{ marginLeft : '10px', padding : '10px' }}>
              <img src="uncheck.png" style={{ width : "22px", height : "22px", objectFit : "contain" }}></img>
            </div>

          </div>

        </div>
        
      </div>

      <div 
        style={{ 
          width: "100%", 
          background : "#000", 
          position : "fixed", 
          bottom : "0", 
          left : "0", 
          height : "75px", 
          display : "flex", 
          justifyContent : "space-around", 
          alignItems : "center", 
          flexDirection: "column", 
          color : "#fff", 
          fontSize : "14px",
          cursor: "pointer"
        }}
        onClick={openLoginModal}
      >
        <div style={{textAlign : "center"}}>
          <div>点击投票</div>
          <div style={{fontSize : '12px', color : '#D9D9D9'}}>今日剩余投票数：1</div>
        </div>
      </div>
      
      <VoteRulesModal isOpen={isModalOpen} onClose={closeModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />

    </div>
  );
}
