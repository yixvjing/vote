"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import VoteRulesModal from '../components/VoteRulesModal';
import LoginModal from '../components/LoginModal';
import { apiService } from '@/utils/apiService';
import { UserManager } from '@/utils/userManager';

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [remainVotes, setRemainVotes] = useState(10); // 剩余投票数
  const [selectedBooks, setSelectedBooks] = useState<string[]>(() => {
    // 从 sessionStorage 读取已选择的书籍
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('selectedBooks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }); // 本地选择的书籍ID列表
  const [bookList, setBookList] = useState<any[]>([]); // 从API获取的图书列表
  const [loading, setLoading] = useState(true); // 图书列表加载状态
  const [loginStatus, setLoginStatus] = useState(false); // 用户登录状态

  const handleBookClick = (bookId: string) => {
    router.push(`/bookDetail/?bookId=${bookId}`);
  };

  const pickBook = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation(); // 阻止事件冒泡，防止触发父元素的点击事件
    
    setSelectedBooks(prev => {
      let newSelection;
      if (prev.includes(bookId)) {
        // 如果已选择，则取消选择
        newSelection = prev.filter(id => id !== bookId);
      } else {
        // 检查是否已达到剩余票数限制
        if (prev.length >= remainVotes) {
          return prev; // 不添加新选择，保持原状态
        }
        // 如果未选择且未达到限制，则添加到选择列表
        newSelection = [...prev, bookId];
      }
      
      // 保存到 sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedBooks', JSON.stringify(newSelection));
      }
      
      return newSelection;
    });
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
    setLoginStatus(true); // 更新登录状态
    fetchBaseInfo(); // 登录成功后获取基础信息
    fetchVoteInfo(); // 登录成功后获取投票信息
    refreshBookList(); // 登录成功后刷新图书列表，获取用户投票状态
  }

  // 处理投票逻辑
  const handleVote = async () => {
    if (!loginStatus) {
      // 用户未登录，显示登录弹窗
      openLoginModal();
      return;
    }

    if (selectedBooks.length === 0) {
      alert('请先选择要投票的图书');
      return;
    }

    try {
      const response = await apiService.submitVoteResult(selectedBooks);
      if (response.code === '0') {
        console.log('投票成功:', response.result);
        // 清空选择的图书
        setSelectedBooks([]);
        // 清空 sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('selectedBooks');
        }
        // 重新获取投票信息和图书列表
        fetchVoteInfo();
        refreshBookList();
      } else {
        console.error('投票失败:', response.message.text);
        alert('投票失败：' + response.message.text);
      }
    } catch (error) {
      console.error('投票网络错误:', error);
      alert('投票失败，请稍后重试');
    }
  };

  // 页面加载时可以获取基础信息
  const fetchBaseInfo = async () => {
    try {
      const response = await apiService.getBaseInfo();
      if (response.code === '0') {
        console.log('获取基础信息成功:', response.result);
        setLoginStatus(response.result.login_status);
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
        setRemainVotes(response.result.remain_vote_num);
        console.log('获取投票信息成功:', response.result);
      }
    } catch (error) {
      console.error('获取投票信息网络错误:', error);
      return 0;
    }
  };

  // 清除图书列表缓存并重新获取数据
  const refreshBookList = async () => {
    await fetchBookList();
  };

  // 获取图书列表数据（第1页到第5页）
  const fetchBookList = async () => {
    try {
      setLoading(true);
      const allBooks: any[] = [];
      
      // 依次获取第1页到第5页的数据
      for (let page = 1; page <= 5; page++) {
        const response = await apiService.getBookList(page);
        if (response.code === '0' && response.result?.item_list) {
          allBooks.push(...response.result.item_list);
          console.log(`获取第${page}页图书数据成功，共${response.result.item_list.length}本书`);
        } else {
          console.error(`获取第${page}页图书数据失败:`, response.message?.text);
        }
      }
      
      setBookList(allBooks);
      console.log('所有图书数据获取完成，共', allBooks.length, '本书');
    } catch (error) {
      console.error('获取图书列表网络错误:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('页面组件挂载，开始初始化...');
    
    // 首先检查是否已有本地登录状态
    const isLoggedIn = UserManager.isLoggedIn();
    if (isLoggedIn) {
      console.log('检测到本地登录状态，UID:', UserManager.getUid());
      setLoginStatus(true);
    }
    
    fetchBaseInfo();
    fetchVoteInfo();
    
    // 预加载图片
    const preloadImages = () => {
      const imagesToPreload = ['https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/checked.png', 'https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/checkedgray.png'];
      imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
        console.log(`预加载图片: ${src}`);
      });
    };
    preloadImages();
    
    // 直接获取图书列表
    console.log('开始获取图书列表...');
    fetchBookList();
  }, []);

  return (
    <div style={{ paddingBottom: "75px" }}>
      
      <div style={{ background: "#0D2EA9" }}>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "start", width: "370px", margin: "0 auto" }}>
          <div>
            <img src="https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/title.svg" alt="Description" />
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

      <img style={{ width : '100%', height : 'auto', marginTop : '-9px'}} src="https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/bottomWave.png" alt="Description" />


      <div style={{ background: "#fff", display: "flex", justifyContent: "center", alignItems: "start", width: "370px", margin: "0 auto" }}>

        <div>

          {loading ? (
            // Loading 状态
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
              flexDirection: "column",
              width: "336px"
            }}>
              <img 
                src="https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/Spinner@1x-1.0s-200px-200px.gif" 
                alt="Loading..." 
                style={{ width: "80px", height: "80px" }}
              />
              <p style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>正在加载图书列表...</p>
            </div>
          ) : (
            // 图书列表
            (bookList.length > 0 ? bookList : []).map((item, index) => (
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
                onClick={() => handleBookClick(item.id)}
              >

                <img src={item.cover_url || "https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/placeHolder.png"} style={{ width : "69px", height : "105px", objectFit : "contain" }}></img>

                <div style={{ display: "flex", flexDirection : "column", justifyContent : "center", alignItems : "flex-start", flex : 1, marginLeft : "22px" }}>
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

                <div 
                  onClick={(e) => { pickBook(e, item.id) }} 
                  style={{ 
                    position : 'absolute', 
                    right : '0', 
                    bottom : '19px',
                    cursor: item.voted || (selectedBooks.length >= remainVotes && !selectedBooks.includes(item.id)) ? 'not-allowed' : 'pointer',
                    opacity: item.voted || (selectedBooks.length >= remainVotes && !selectedBooks.includes(item.id)) ? 0.6 : 1
                  }}
                >
                  <img src={
                    item.voted ? "https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/checkedgray.png" : 
                    selectedBooks.includes(item.id) ? "https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/checked.png" : 
                    "https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/uncheck.png"
                  } style={{ width : "22px", height : "22px", objectFit : "contain" }}></img>
                </div>

              </div>
            ))
          )}

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
        onClick={handleVote}
      >
        <div style={{textAlign : "center"}}>
          <div>点击投票</div>
          <div style={{fontSize : '12px', color : '#D9D9D9'}}>
            今日剩余投票数：{remainVotes}
          </div>
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
