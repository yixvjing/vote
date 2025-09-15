"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import VoteRulesModal from '../components/VoteRulesModal';
import LoginModal from '../components/LoginModal';
import CommonModal from '../components/CommonModal';
import { apiService } from '../utils/apiService';
import { UserManager } from '../utils/userManager';

export default function Home() {
  const router = useRouter();
  const [modalContent, setModalContent] = useState<string>(''); // 弹窗内容
  const [isCommonModalOpen, setIsCommonModalOpen] = useState(false);
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
  const [isEnd, setIsEnd] = useState(false); // 投票是否结束
  const [subText, setSubText] = useState<string>(''); // 弹窗副文本

  const handleBookClick = (bookId: string) => {
    window.location.href=(`https://acth5.thefair.net.cn/vote-book/bookDetail/?bookId=${bookId}`)
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
          // 如果已登录且超过剩余票数，显示提示
          if (loginStatus) {
            setModalContent('每日最多投票10本，如需更换，请先取消已选中的图书。');
            setIsCommonModalOpen(true);
          }
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

  const handleLoginSuccess = async (user: any) => {
    setLoginStatus(true); // 更新登录状态
    fetchBaseInfo(); // 登录成功后获取基础信息
    const remainVoteNum = await fetchVoteInfo(); // 登录成功后获取投票信息
    updateBookListVoteStatus(); // 登录成功后智能更新图书列表投票状态
    
    // 登录后检查已选择的书籍数量是否超过剩余票数
    if (selectedBooks.length > (remainVoteNum || 0)) {
      setModalContent('每日最多投票10本，如需更换，请先取消已选中的图书。');
      setIsCommonModalOpen(true);
    }
  }

  // 处理投票逻辑
  const handleVote = async () => {

    if (isEnd) {
      setModalContent('投票已结束，感谢您的参与！');
      setIsCommonModalOpen(true);
      return;
    }

    if (!loginStatus) {
      // 用户未登录，显示登录弹窗
      openLoginModal();
      return;
    }

    if (selectedBooks.length === 0) {
      setModalContent('请先选择图书。');
      setIsCommonModalOpen(true);
      return;
    }

    // 检查选择的书籍数量是否超过剩余票数
    if (selectedBooks.length > remainVotes) {
      setModalContent('每日最多投票10本，如需更换，请先取消已选中的图书。');
      setIsCommonModalOpen(true);
      return;
    }

    try {
      const response = await apiService.submitVoteResult(selectedBooks);
      if (response.code === '0') {
        // 清空选择的图书
        setSelectedBooks([]);
        // 清空 sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('selectedBooks');
        }
        // 重新获取投票信息和图书列表
        const newRemainVotes = await fetchVoteInfo();
        updateBookListVoteStatus(); // 使用智能更新而不是完整刷新
        setModalContent('投票成功');
        setSubText('今日剩余投票数：' + (newRemainVotes !== undefined ? newRemainVotes : 0));
        setIsCommonModalOpen(true);
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
        setLoginStatus(response.result.login_status);
        setIsEnd(response.result.is_end);
        // 将 end_time 存储到 localStorage
        if (response.result.end_time && typeof window !== 'undefined') {
          localStorage.setItem('vote_end_time', response.result.end_time.toString());
        }
        
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
        return response.result.remain_vote_num;
      }
    } catch (error) {
      console.error('获取投票信息网络错误:', error);
      return 0;
    }
  };

  // 清理localStorage中已投票的书籍
  const cleanupVotedBooksFromStorage = (updatedBooks: any[]) => {
    if (typeof window !== 'undefined') {
      const savedSelection = sessionStorage.getItem('selectedBooks');
      if (savedSelection) {
        try {
          const selectedBookIds = JSON.parse(savedSelection);
          // 找出已投票的书籍ID
          const votedBookIds = updatedBooks
            .filter(book => book.voted)
            .map(book => book.id);
          
          // 从选择列表中移除已投票的书籍
          const cleanedSelection = selectedBookIds.filter((bookId: string) => 
            !votedBookIds.includes(bookId)
          );
          
          // 更新localStorage和state
          if (cleanedSelection.length !== selectedBookIds.length) {
            sessionStorage.setItem('selectedBooks', JSON.stringify(cleanedSelection));
            setSelectedBooks(cleanedSelection);
          }
        } catch (error) {
          console.error('清理localStorage选择记录失败:', error);
        }
      }
    }
  };

  // 智能更新图书列表 - 只更新投票状态，不重新获取整个列表
  const updateBookListVoteStatus = async () => {
    try {
      const allUpdatedBooks: any[] = [];
      
      // 获取所有页面（第1页到第5页）的数据来更新投票状态
      for (let page = 1; page <= 5; page++) {
        const response = await apiService.getBookList(page);
        if (response.code === '0' && response.result?.item_list) {
          allUpdatedBooks.push(...response.result.item_list);
        }
      }
      
      if (allUpdatedBooks.length > 0) {
        // 清理localStorage中已投票的书籍
        cleanupVotedBooksFromStorage(allUpdatedBooks);
        
        setBookList(prevBooks => {
          return prevBooks.map(book => {
            // 查找对应的更新数据
            const updatedBook = allUpdatedBooks.find(updated => updated.id === book.id);
            if (updatedBook) {
              // 只更新投票相关字段，保持其他数据不变
              return {
                ...book,
                voted: updatedBook.voted,
                vote_num: updatedBook.vote_num
              };
            }
            return book;
          });
        });
      }
    } catch (error) {
      console.error('更新图书投票状态失败:', error);
    }
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
        } else {
          console.error(`获取第${page}页图书数据失败:`, response.message?.text);
        }
      }
      
      setBookList(allBooks);
      
      // 获取图书列表后，清理localStorage中已投票的书籍
      cleanupVotedBooksFromStorage(allBooks);
    } catch (error) {
      console.error('获取图书列表网络错误:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    // 首先检查是否已有本地登录状态
    const isLoggedIn = UserManager.isLoggedIn();
    if (isLoggedIn) {
      setLoginStatus(true);
    }
    
    fetchBaseInfo();
    fetchVoteInfo();
    
    // 预加载图片
    const preloadImages = () => {
      const imagesToPreload = ['https://static.thefair.net.cn/activity/vote-book/checked.png', 'https://static.thefair.net.cn/activity/vote-book/checkedgray.png'];
      imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    preloadImages();
    
    // 直接获取图书列表
    fetchBookList();
  }, []);

  // 添加页面可见性监听，当从其他页面返回时刷新数据
  useEffect(() => {
    let isInitialLoad = true;
    let debounceTimer: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 跳过首次加载时的可见性变化，避免重复请求
        if (isInitialLoad) {
          isInitialLoad = false;
          return;
        }
        
        // 防抖处理，避免频繁触发
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(() => {
          // 检查登录状态是否变化
          const currentLoginStatus = UserManager.isLoggedIn();
          if (currentLoginStatus !== loginStatus) {
            setLoginStatus(currentLoginStatus);
            if (currentLoginStatus) {
              // 如果变为登录状态，重新获取投票信息
              fetchVoteInfo();
            }
          }
          // 页面重新可见时，只刷新投票信息和投票状态
          fetchVoteInfo();
          updateBookListVoteStatus();
        }, 300); // 300ms 防抖
      }
    };

    const handleFocus = () => {
      // 跳过首次加载时的焦点事件，避免重复请求
      if (isInitialLoad) {
        return;
      }
      
      // 防抖处理
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      debounceTimer = setTimeout(() => {
        // 检查登录状态是否变化
        const currentLoginStatus = UserManager.isLoggedIn();
        if (currentLoginStatus !== loginStatus) {
          setLoginStatus(currentLoginStatus);
          if (currentLoginStatus) {
            // 如果变为登录状态，重新获取投票信息
            fetchVoteInfo();
          }
        }
        fetchVoteInfo();
        updateBookListVoteStatus();
      }, 300);
    };

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // 监听窗口焦点变化
    window.addEventListener('focus', handleFocus);

    // 设置一个延迟，确保首次加载完成后再开始监听
    const timer = setTimeout(() => {
      isInitialLoad = false;
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearTimeout(timer);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [loginStatus]);

  // 监听localStorage变化，实现跨页面登录状态同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 监听用户UID的变化
      if (e.key === 'vote_user_uid') {
        const isLoggedIn = UserManager.isLoggedIn();
        
        if (isLoggedIn !== loginStatus) {
          setLoginStatus(isLoggedIn);
          
          if (isLoggedIn) {
            fetchBaseInfo();
            fetchVoteInfo();
            updateBookListVoteStatus();
          } else {
            setRemainVotes(10);
            // 清空已选择的书籍
            setSelectedBooks([]);
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('selectedBooks');
            }
          }
        }
      }
      
      // 监听用户信息的变化
      if (e.key === 'vote_user_info') {
        const isLoggedIn = UserManager.isLoggedIn();
        if (isLoggedIn !== loginStatus) {
          setLoginStatus(isLoggedIn);
          
          if (isLoggedIn) {
            fetchBaseInfo();
            fetchVoteInfo();
            updateBookListVoteStatus();
          }
        }
      }
    };

    // 添加localStorage事件监听
    window.addEventListener('storage', handleStorageChange);

    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loginStatus]);

  // 监听自定义事件，用于同一页面内的状态同步
  useEffect(() => {
    const handleLoginStateChange = (event: CustomEvent) => {
      const { isLoggedIn } = event.detail;
      
      if (isLoggedIn !== loginStatus) {
        setLoginStatus(isLoggedIn);
        
        if (isLoggedIn) {
          fetchBaseInfo();
          fetchVoteInfo();
          updateBookListVoteStatus();
        } else {
          setRemainVotes(10);
          setSelectedBooks([]);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('selectedBooks');
          }
        }
      }
    };

    // 添加自定义事件监听
    window.addEventListener('loginStateChange', handleLoginStateChange as EventListener);

    // 清理函数
    return () => {
      window.removeEventListener('loginStateChange', handleLoginStateChange as EventListener);
    };
  }, [loginStatus]);

  return (
    <div style={{ paddingBottom: "75px" }}>
      
      <div style={{ background: "#0D2EA9" }}>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "start", width: "370px", margin: "0 auto" }}>
          <div>
            <img src="https://static.thefair.net.cn/activity/vote-book/title.svg" alt="Description" />
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

      <img style={{ width : '100%', height : 'auto', marginTop : '-9px'}} src="https://static.thefair.net.cn/activity/vote-book/bottomWave.png" alt="Description" />


      <div style={{ background: "#fff", display: "flex", justifyContent: "center", alignItems: "start" }}>

          <div style={{ width: "370px", margin: "0 auto" }}>

        <div style={{ margin: "0 auto" }}>

          {loading ? (
            // Loading 状态
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
              flexDirection: "column",
              width: "336px",
              margin: "0 auto"
            }}>
              <img 
                src="https://static.thefair.net.cn/activity/vote-book/Spinner@1x-1.0s-200px-200px.gif" 
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
                  alignItems: "center", 
                  padding : "19px 0", 
                  borderBottom : "1px solid #B3B6B7",
                  cursor: "pointer",
                  position : "relative",
                  margin: '0 auto',
                }}
                onClick={() => handleBookClick(item.id)}
              >

                <img src={item.cover_url || "https://static.thefair.net.cn/activity/vote-book/placeHolder.png"} style={{ width : "69px", height : "105px", objectFit : "contain" }}></img>

                <div style={{ display: "flex", flexDirection : "column", justifyContent : "center", alignItems : "flex-start", flex : 1, marginLeft : "22px" }}>
                  <div style={{ fontSize: "16px", fontWeight : 700, marginBottom : "8px", color : '#000' }}>
                    <span style={{ color: "#0D2EA9" }}>{item.rank.toString().padStart(2, '0')}</span>
                    《{item.name}》
                  </div>
                  <p style={{ fontSize : '13px', color : '#000' }}>作者：{item.author}</p>
                  <p style={{ fontSize : '13px', color : '#000' }}>品牌：{item.brand}</p>
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
                    item.voted ? "https://static.thefair.net.cn/activity/vote-book/checkedgray.png" : 
                    selectedBooks.includes(item.id) ? "https://static.thefair.net.cn/activity/vote-book/checked.png" : 
                    "https://static.thefair.net.cn/activity/vote-book/uncheck.png"
                  } style={{ width : "22px", height : "22px", objectFit : "contain" }}></img>
                </div>

              </div>
            ))
          )}

        </div>
          </div>

        
      </div>

      <div 
        style={{ 
          width: "100%", 
          background: remainVotes === 0 ? "#B3B5BD" : "#000", 
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
          cursor: remainVotes === 0 ? "default" : "pointer"
        }}
        onClick={remainVotes === 0 ? undefined : handleVote}
      >
        <div style={{textAlign : "center"}}>
          {remainVotes <= 0 ? (
            <div>今日票数已用完</div>
          ) : (
            <>
              <div>点击投票</div>
              <div style={{fontSize : '12px', color : '#D9D9D9'}}>
                今日剩余投票数：{remainVotes}
              </div>
            </>
          )}
        </div>
      </div>
      
      <VoteRulesModal isOpen={isModalOpen} onClose={closeModal} />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
        onLoginSuccess={handleLoginSuccess}
      />
      <CommonModal 
        isOpen={isCommonModalOpen}
        onClose={() => {
          setIsCommonModalOpen(false);
          setModalContent('');
          setSubText('');
        }}
        mainText={modalContent}
        subText={subText}
      />
    </div>
  );
}
