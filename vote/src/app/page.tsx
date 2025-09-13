"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import VoteRulesModal from '../components/VoteRulesModal';
import LoginModal from '../components/LoginModal';
import { apiService } from '@/utils/apiService';

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [remainVotes, setRemainVotes] = useState(10); // 剩余投票数

  const item_list=[
            {
                "id": "32567",
                "rank": 1,
                "name": "1453：君士坦丁堡的陷落",
                "intro": "1453年5月，拜占庭首都君士坦丁堡被奥斯曼土耳其帝国攻陷，是世界历史中的一件大事。它不仅代表着拜占庭千年帝国的落幕，新兴伊斯兰强权的崛起，更为欧洲、近东带来了政治、经济、文化上的深刻变化，甚至一度被作为中世纪结束的标志之一。",
                "author": "[英]史蒂文·朗希曼 Steven Runciman",
                "editor": "张鹏",
                "cover_url": "https://cdn-fusion.imgcdn.store/i/2024/dd72febafdca0b75.png",
                "brand": "汗青堂",
                "vote_num": 0,
                "voted": false
            },
            {
                "id": "32568",
                "rank": 2,
                "name": "爱的终结",
                "intro": "&quot;为什么我们不爱了？\n这似乎是一个人人崇尚自由、追求自主的时代，无论男女都可以自行定义自己的爱情样貌，随意选择交往的对象。但更多的选择，并没有为人们带来更高的情感满意度。爱的前景正变得愈发不确定，经历分手和离婚的人也仍然经历着心碎……\n这既是一部关于“心碎”的历史记录，也 是一部批判资本主义和消费文化的学术扛鼎之作。伊娃·易洛思潜心二十年研究，结合社会学、心理学、哲学等相关理论资源，从大量文学作品、社交软件、影视、访谈和咨询中抽取出丰富的案例，为我们展现出现代社会如何影响了人们的情感结构和关系。&quot;",
                "author": "(法)伊娃·易洛思",
                "editor": "廖玉笛",
                "cover_url": "https://cdn-fusion.imgcdn.store/i/2024/3dca6eedb3ecbbd7.jpg",
                "brand": "浦睿文化",
                "vote_num": 0,
                "voted": false
            }
        ];

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

  const handleLoginSuccess = (user: any) => {
    console.log('用户登录成功:', user);
    fetchBaseInfo(); // 登录成功后获取基础信息
  }

  // 页面加载时可以获取基础信息
  const fetchBaseInfo = async () => {
    try {
      const response = await apiService.getBaseInfo();
      if (response.code === '0') {
        console.log('获取基础信息成功:', response.result);
        // 处理基础信息，比如设置页面标题等
      } else {
        console.error('获取基础信息失败:', response.message.text);
      }
    } catch (error) {
      console.error('获取基础信息网络错误:', error);
    }
  };

  const fetchVoteInfo = async () => {
    try {
      const response = await apiService.getVoteInfo();
      if (response.code === '0') {
        setRemainVotes(response.result.remain_votes);
        console.log('获取投票信息成功:', response.result);
      }
    } catch (error) {
      console.error('获取投票信息网络错误:', error);
      return 0;
    }
  };

  useEffect(() => {
    fetchBaseInfo();
    fetchVoteInfo();
  }, []);

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

          {
            item_list.map((item, index) => (
              <div 
                key={item.id}
                style={{ 
                  width : '336px', 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-end", 
                  padding : "19px 0", 
                  borderBottom : "1px solid #B3B6B7",
                  cursor: "pointer",
                  position : "relative"
                }}
                onClick={handleBookClick}
              >

                <img src={item.cover_url || "placeHolder.png"} style={{ width : "69px", height : "105px", objectFit : "contain" }}></img>

                <div style={{ display: "flex", flexDirection : "column", justifyContent : "center", alignItems : "flex-start", height : "105px", flex : 1, marginLeft : "22px" }}>
                  <div style={{ fontSize: "16px", fontWeight : 700, marginBottom : "8px" }}>
                    <span style={{ color: "#0D2EA9" }}>{item.rank.toString().padStart(2, '0')}</span>
                    《{item.name}》
                  </div>
                  <p style={{ fontSize : '13px' }}>作者：{item.author}</p>
                  <p style={{ fontSize : '13px' }}>品牌：{item.brand}</p>
                  <div style={{ marginTop : '8px', display: "flex", justifyContent : "center", alignItems : "center", border : "2px solid #0D2EA9" }}>
                    <div style={{color : "#0D2EA9", fontWeight : 700, padding: '0 3px'}}>{item.vote_num}</div>
                    <div style={{ background : '#0D2EA9', color : "#fff", fontWeight : 700, paddingLeft : '7px', paddingRight : '5px' }}>票</div>
                  </div>
                </div>

                <div onClick={(e) => { pickBook(e) /* 处理取消选择逻辑 */ }} style={{ position : 'absolute', right : '0', bottom : '18px' }}>
                  <img src={item.voted ? "checkedgray.png" : "uncheck.png"} style={{ width : "22px", height : "22px", objectFit : "contain" }}></img>
                </div>

              </div>
            ))
          }

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
          <div style={{fontSize : '12px', color : '#D9D9D9'}}>今日剩余投票数：{remainVotes}</div>
        </div>
      </div>
      
      <VoteRulesModal isOpen={isModalOpen} onClose={closeModal} />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
