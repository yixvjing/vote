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
          width: '320px',
          height: '290px',
          backgroundImage: 'url(/modalMini.png)',
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
          textAlign: 'left',
          maxHeight: '320px',
          overflowY: 'auto',
        }}>
            <h3 style={{textAlign : 'center', fontWeight : 500, marginBottom : '14px', fontSize : '20px'}}>{mainText}</h3>
            <p>{subText}</p>
        </div>
      </div>
      <img src="close.png" style={{ width: '15px', height: '15px', position: 'absolute', top: '50%', left: '50%', marginTop : '230px', marginLeft : '-7px', cursor: 'pointer' }} onClick={onClose}></img>
    </div>
  );
};

export default VoteRulesModal;
