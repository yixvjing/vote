"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '../../utils/apiService';
import { useState, useEffect, Suspense } from 'react';
import LoginModal from '../../components/LoginModal';
import CommonModal from '../../components/CommonModal';
import { UserManager } from '../../utils/userManager';
import axios from 'axios';

// 声明微信 JS-SDK 类型
declare global {
  interface Window {
    wx: {
      config: (config: {
        appId: string;
        timestamp: string;
        nonceStr: string;
        signature: string;
        jsApiList: string[];
      }) => void;
      ready: (callback: () => void) => void;
      error: (callback: (error: any) => void) => void;
      updateTimelineShareData: (config: {
        title: string;
        link: string;
        imgUrl: string;
        success?: () => void;
        cancel?: () => void;
      }) => void;
      updateAppMessageShareData: (config: {
        title: string;
        desc: string;
        link: string;
        imgUrl: string;
        success?: () => void;
        cancel?: () => void;
      }) => void;
    };
  }
}

function BookDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [book, setBook] = useState<any>(null); // 图书详情数据
  const [loading, setLoading] = useState(true); // 加载状态
  const [remainVotes, setRemainVotes] = useState(0); // 剩余投票数
  const [loginStatus, setLoginStatus] = useState<boolean>(false); // 登录状态
  const [showLoginModal, setShowLoginModal] = useState(false); // 控制登录弹窗显示
  const [isEnd, setIsEnd] = useState(false); // 投票是否结束

  const [modalContent, setModalContent] = useState<string>(''); // 弹窗内容
  const [subText, setSubText] = useState<string>(''); // 弹窗副文本

  const [isCommonModalOpen, setIsCommonModalOpen] = useState(false); // 控制通用弹窗显示

  // 页面加载时获取图书详情和投票信息

  // 微信分享初始化函数
  const initWechatShare = async (bookName?: string) => {
    try {
        // 1. 调用接口获取微信配置签名
        const response = await axios.get('https://api.thefair.net.cn/wechat/open/get_wechat_sign', {
            params: {
                app_label: 'Subscribe',
                url: window.location.href
            },
            withCredentials: true // 携带Cookie
        });
        
        const data = response.data;
        
        // 2. 配置微信JS-SDK
        window.wx.config({
            appId: data.result.appId,
            timestamp: data.result.timestamp,
            nonceStr: data.result.nonceStr,
            signature: data.result.signature,
            jsApiList: ['updateTimelineShareData', 'updateAppMessageShareData']
        });
        
        // 3. 错误处理
        window.wx.error((error) => {
            console.error('wx.error: ', error);
        });
        
        // 4. 微信ready回调，设置分享内容
        window.wx.ready(() => {
            // 根据是否有书名来设置分享标题
            const shareTitle = bookName ? `为《${bookName}》投一票` : '在每一条小路上发现未来';
            
            // 朋友圈分享配置
            window.wx.updateTimelineShareData({
                title: shareTitle,
                link: window.location.href,
                imgUrl: 'https://static.thefair.net.cn/activity/vote-book/share.jpg',
                success: () => {
                    console.log('朋友圈分享成功');
                },
                cancel: () => {
                    console.log('朋友圈分享取消');
                }
            });
            
            // 微信好友分享配置
            window.wx.updateAppMessageShareData({
                title: shareTitle,
                desc: '快来参加LESS新世相出版奖悦已榜投票，让你喜欢的书被更多人看到!',
                link: window.location.href,
                imgUrl: 'https://static.thefair.net.cn/activity/vote-book/share.jpg',
                success: () => {
                    console.log('好友分享成功');
                },
                cancel: () => {
                    console.log('好友分享取消');
                }
            });
        });
        
    } catch (error) {
        console.error('微信分享初始化失败:', error);
        if (error.response?.data?.message?.text) {
            console.error('错误信息:', error.response.data.message.text);
        }
    }
  };

  useEffect(() => {
    // 页面显示事件处理（防止页面缓存）
    const handlePageShow = (event) => {
        if (event.persisted) {
            window.location.reload();
        }
    };
    
    window.addEventListener('pageshow', handlePageShow);
    
    // 清理函数
    return () => {
        window.removeEventListener('pageshow', handlePageShow);
    };
}, []);

  useEffect(() => {
    // 首先检查是否已有本地登录状态
    const isLoggedIn = UserManager.isLoggedIn();
    if (isLoggedIn) {
      setLoginStatus(true);
    }
    
    fetchVoteInfo();
    fetchBaseInfo();
  }, []);

  const handleBack = () => {
    // 优先使用 router.back() 来保持 SPA 的特性，避免页面重新加载
    window.location.href="https://acth5.thefair.net.cn/vote-book/"
  };

  const handleVote = async () => {

    if (isEnd) {
      setModalContent('投票已结束，感谢您的参与！');
      setIsCommonModalOpen(true);
      return;
    }

    if (book?.voted) {
      return; // 已投票则不执行任何操作
    }
    
    // 检查登录状态，如果未登录则弹出登录窗口
    if (!loginStatus) {
      setShowLoginModal(true);
      return;
    }
    
    // 检查是否有剩余投票数
    if (remainVotes <= 0) {
      return;
    }

    // 获取当前书籍ID
    const bookId = searchParams.get('bookId');
    if (!bookId) {
      alert('图书信息错误，无法投票');
      return;
    }

    try {
      // 调用投票API，传入单本书的ID数组
      const response = await apiService.submitVoteResult([bookId]);
      if (response.code === '0') {        
        fetchBookInfo(bookId); // 重新获取图书详情（更新投票状态和票数）
        
        // 重新获取投票信息（更新剩余投票数）并获取最新值
        const updatedRemainVotes = await fetchVoteInfo();

        setModalContent('投票成功');
        setSubText('剩余票数：'+ updatedRemainVotes);
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

  const fetchVoteInfo = async () => {
    try {
      const response = await apiService.getVoteInfo();
      if (response.code === '0') {
        setRemainVotes(response.result.remain_vote_num);
        return response.result.remain_vote_num; // 返回最新的投票数
      } else {
        console.error('获取投票信息失败:', response.message.text);
        return remainVotes; // 如果失败，返回当前值
      }
    } catch (error) {
      console.error('获取投票信息网络错误:', error);
      return remainVotes; // 如果失败，返回当前值
    }
  };

  const fetchBaseInfo = async () => {
    try {
      const response = await apiService.getBaseInfo();
      if (response.code === '0') {
        // 处理基础信息，保存登录状态
        setLoginStatus(response.result.login_status);
        setIsEnd(response.result.is_end);
      } else {
        console.error('获取基础信息失败:', response.message.text);
      }
    } catch (error) {
      console.error('获取基础信息网络错误:', error);
    }
  };
  
  // 处理登录成功
  const handleLoginSuccess = (user: any) => {
    setLoginStatus(true);
    setShowLoginModal(false);
    // 登录成功后重新获取投票信息
    fetchVoteInfo();
    fetchBaseInfo();
  };

  // 关闭登录弹窗
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const fetchBookInfo = async (bookId: string) => {
    setLoading(true);
    try {
      const data = await apiService.getBookInfo(bookId);
      if (data.code === '0') {
        setBook(data.result);
        // 获取到书籍信息后，初始化微信分享
        initWechatShare(data.result.name);
      } else {
        console.error('获取图书详情失败:', data.message.text);
        // 如果获取书籍信息失败，使用默认分享配置
        initWechatShare();
      }
    } catch (error) {
      console.error('获取图书详情网络错误:', error);
      // 如果获取书籍信息失败，使用默认分享配置
      initWechatShare();
    } finally {
      setLoading(false);
    }
  }
  


  useEffect(() => {
    // 从URL参数中获取bookId
    const bookId = searchParams.get('bookId');
    
    if (bookId) {
      setLoading(true);
      // 使用获取到的bookId调用API
      fetchBookInfo(bookId);
    } else {
      console.error('未找到bookId参数');
      setLoading(false);
    }
  }, [searchParams]);

  return (
    <div>
        {/* 返回按钮 */}
        <div style={{ padding: "10px" }} onClick={handleBack}>
            <img src="https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/back-svgrepo-com.svg" style={{ cursor: "pointer", width: "32px", height: "auto" }}></img>
        </div>
        
        {/* Loading 状态 */}
        {loading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            flexDirection: "column"
          }}>
            <img 
              src="https://static.thefair.net.cn/activity/vote-book/Spinner@1x-1.0s-200px-200px.gif" 
              alt="Loading..." 
              style={{ width: "100px", height: "100px" }}
            />
            <p style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>正在加载图书信息...</p>
          </div>
        ) : (
          <>
            {/* 图书详情内容 */}
            <div style={{ background: "#fff", display: "flex", justifyContent: "center", alignItems: "start", margin: "0 auto" }}>
              <div style={{ width: "336px", padding: "10px 0" }}>
                
                {/* 图书基本信息 */}
                <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", flexDirection : 'column' }}>
            {/* 图书封面 */}

            <div style={{position : 'relative'}}>
              <div style={{
                background: "url('https://static.thefair.net.cn/activity/vote-book/tag.png')", 
                width: "70px", 
                height: "auto", 
                backgroundSize: 'contain', 
                backgroundRepeat: 'no-repeat', 
                backgroundPosition: 'center',
                position : 'absolute',
                top : '15px',
                left : '-23px',
                zIndex : 1,
                color : '#fff',
                fontSize : '16px',
                fontWeight : 700,
                textAlign : 'center',
                lineHeight : '32px',
                textIndent : '-5px'
              }}>
                《{book.rank}》
              </div>

              <img 
                src={book.cover_url}
                style={{ width: "182px", height: "auto", objectFit: "contain", boxShadow : "0 4px 8px rgba(0, 0, 0, 0.2)" }}
                alt="图书封面"
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", height: "180px", flex: 1 }}>

              <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", marginTop : "20px", color: "#000" }}>
                { book?.name }
              </div>

              {/* 投票状态 */}
              <div style={{ marginTop: 'auto', display: "flex", justifyContent: "center", alignItems: "center", border: "2px solid #0D2EA9" }}>
                <div style={{color: "#0D2EA9", fontWeight: 700, padding: '0px 4px'}}>{book.vote_num}</div>
                <div style={{ background: '#0D2EA9', color: "#fff", fontWeight: 700, paddingLeft: '8px', paddingRight: '6px' }}>票</div>
              </div>

              <p style={{ fontSize: '14px', marginBottom : '2px', color: '#000', marginTop : '18px' }}>作者：{book?.author || "未知"}</p>
              <p style={{ fontSize: '14px', marginBottom : '2px', color: '#000' }}>编辑：{book?.editor || "未知"}</p>

            </div>
          </div>

        </div>


      </div>

      <img style={{ width : '100%', height : 'auto', marginTop : '-9px'}} src="https://static.thefair.net.cn/activity/vote-book/whiteWave.png" alt="Description" />


      <div style={{ background: "#efefef", display: "flex", justifyContent: "center", alignItems: "start", margin: "0 auto", paddingBottom: "75px" }}>
        <div style={{ width: "336px", padding: "10px 0" }}>
          
          {/* 图书简介 */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "#000" }}>关于这本书</h3>
            <p style={{ fontSize: "14px", lineHeight: "24px", color: "#666" }}>
              { book?.intro || "暂无简介" }
            </p>
          </div>

        </div>


      </div>

      {/* 底部导航 */}
      <div 
        onClick={handleVote}
        style={{ 
          width: "100%", 
          background: book?.voted || remainVotes <= 0 ? "#B3B5BD" : "#000", 
          position: "fixed", 
          bottom: "0", 
          left: "0", 
          height: "75px", 
          display: "flex", 
          justifyContent: "space-around", 
          alignItems: "center", 
          flexDirection: "column", 
          color: "#fff", 
          fontSize: "14px",
          cursor: book?.voted || remainVotes <= 0 ? "not-allowed" : "pointer"
        }}
      >
        <div style={{textAlign: "center"}}>
          <div>
            {book?.voted 
              ? "已投票" 
              : remainVotes <= 0 
                ? "今日票数已用完" 
                : "点击投票"
            }
          </div>
          {
            book?.voted ? <></> : <div style={{fontSize: '12px', color: '#D9D9D9', opacity:0.5}}>今日剩余投票数：{remainVotes}</div>
          }
        </div>
      </div>
            </>
          )}

      {/* 登录弹窗 */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
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

export default function BookDetail() {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        flexDirection: "column"
      }}>
        <img 
          src="https://static.thefair.net.cn/activity/vote-book/Spinner@1x-1.0s-200px-200px.gif" 
          alt="Loading..." 
          style={{ width: "100px", height: "100px" }}
        />
        <p style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>正在加载页面...</p>
      </div>
    }>
      <BookDetailContent />
    </Suspense>
  );
}
