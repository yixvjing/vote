"use client";

import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  if (!isOpen) return null;

  const handleSendCode = () => {
    if (!phone.trim()) {
      alert('请输入手机号');
      return;
    }
    
    // 这里添加发送验证码的逻辑
    setIsCodeSent(true);
    setCountdown(60);
    
    // 倒计时
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCodeSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = () => {
    if (!phone.trim()) {
      alert('请输入手机号');
      return;
    }
    if (!verificationCode.trim()) {
      alert('请输入验证码');
      return;
    }
    
    // 这里添加登录逻辑
    console.log('登录:', { phone, verificationCode });
    onClose();
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
          width: '280px',
          height: '280px',
          backgroundImage: 'url(/modalMiddle.png)',
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
        {/* 手机号输入框 */}
        <input
          type="tel"
          placeholder="请输入手机号"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: '235px',
            height: '40px',
            border: '1px solid #E5E5E5',
            padding: '0 12px',
            fontSize: '14px',
            marginBottom: '12px',
            outline: 'none',
            backgroundColor: '#F8F8F8',
            color: '#333',
          }}
        />

        {/* 验证码输入框和获取验证码按钮 */}
        <div style={{ 
          display: 'flex', 
          width: '235px', 
          marginBottom: '12px',
          gap: '8px'
        }}>
          <input
            type="text"
            placeholder="请输入验证码"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            style={{
              width: '137px',
              height: '40px',
              border: '1px solid #E5E5E5',
              padding: '0 12px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: '#F8F8F8',
              color: '#333',
            }}
          />
          <button
            onClick={handleSendCode}
            disabled={isCodeSent}
            style={{
              width: '90px',
              height: '40px',
              backgroundColor: isCodeSent ? '#999' : '#0D2EA9',
              color: '#fff',
              border: 'none',
              fontSize: '12px',
              cursor: isCodeSent ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              flexShrink: 0,
            }}
          >
            {isCodeSent ? `${countdown}s` : '获取验证码'}
          </button>
        </div>

        {/* 登录按钮 */}
        <button
          onClick={handleLogin}
          style={{
            width: '235px',
            height: '40px',
            backgroundColor: (phone.trim() && verificationCode.trim()) ? '#0D2EA9' : '#E5E5E5',
            color: (phone.trim() && verificationCode.trim()) ? '#fff' : '#999',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          登录
        </button>
      </div>

      {/* 关闭按钮 */}
      <img 
        src="close.png" 
        style={{ 
          width: '15px', 
          height: '15px', 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          marginTop: '190px',
          marginLeft: '-7px', 
          cursor: 'pointer' 
        }} 
        onClick={onClose}
        alt="关闭"
      />
    </div>
  );
};

export default LoginModal;
