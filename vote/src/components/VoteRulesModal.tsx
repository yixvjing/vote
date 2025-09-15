"use client";

import React from 'react';

interface VoteRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoteRulesModal: React.FC<VoteRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // 格式化时间戳为年月日
  const formatEndTime = () => {
    if (typeof window === 'undefined') return '';
    
    const endTimeStamp = localStorage.getItem('vote_end_time');
    if (!endTimeStamp) return '';
    
    const date = new Date(parseInt(endTimeStamp) * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}年${month}月${day}日`;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          width: '320px',
          height: '310px',
          backgroundImage: 'url(https://static.thefair.net.cn/activity/vote-book/modalBig.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px 30px',
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* 规则内容 */}
        <div style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#000',
          textAlign: 'left',
          maxHeight: '320px',
          overflowY: 'auto',
          marginTop : '-20px'
        }}>
            <h3 style={{textAlign : 'center', fontWeight : 500, marginBottom : '14px', fontSize : '20px'}}>投票规则</h3>

            <p>1. 每位用户每天最多可以投票10次</p>
            <p>2. 同一本书每天只能投票1次</p>
            <p>3. 每天0点更新投票次数</p>
            <p>4. 投票截止时间：{formatEndTime()}</p>
        </div>
      </div>
      <img src="https://static.thefair.net.cn/activity/vote-book/close.png" style={{ width: '15px', height: '15px', position: 'absolute', top: '50%', left: '50%', marginTop : '230px', marginLeft : '-7px', cursor: 'pointer' }} onClick={onClose}></img>
    </div>
  );
};

export default VoteRulesModal;
