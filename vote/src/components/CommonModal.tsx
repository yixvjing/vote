"use client";

import React from 'react';

interface CommonModalProps {
  isOpen: boolean;
  mainText?: string;
  subText?: string;
  onClose: () => void;
}

const VoteRulesModal: React.FC<CommonModalProps> = ({ isOpen, mainText, subText, onClose }) => {
  if (!isOpen) return null;

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
          width: '280px',
          height: '290px',
          backgroundImage: 'url(https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/modalMini.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 30px',
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* 规则内容 */}
        <div style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#000',
          maxHeight: '320px',
          overflowY: 'auto',
        }}>
            <p style={{textAlign : 'center', fontWeight : 500, marginBottom : '4px', fontSize : '16px'}}>{mainText}</p>
            <p style={{textAlign : 'center', fontWeight : 400, fontSize : '12px'}}>{subText}</p>
        </div>
      </div>
      <img src="https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/close.png" style={{ width: '15px', height: '15px', position: 'absolute', top: '50%', left: '50%', marginTop : '230px', marginLeft : '-7px', cursor: 'pointer' }} onClick={onClose}></img>
    </div>
  );
};

export default VoteRulesModal;
