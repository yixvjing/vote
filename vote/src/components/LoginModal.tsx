"use client";

import React, { useState } from 'react';
import { apiService } from '../utils/apiService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: any) => void; // 登录成功回调
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [encryptMobile, setEncryptMobile] = useState(''); // 加密手机号
  const [isLoading, setIsLoading] = useState(false); // 加载状态

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!phone.trim()) {
      alert('请输入手机号');
      return;
    }
    
    // 简单的手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      alert('请输入正确的手机号格式');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用真实的发送验证码 API
      const response = await apiService.sendSmsCode(phone.trim());
      
      if (response.code === '0') {
        // 保存加密的手机号，用于登录
        setEncryptMobile(response.result.encrypt_mobile);
        
        // 开始倒计时
        setIsCodeSent(true);
        setCountdown(60);
        
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
        
      } else {
        alert(response.message.text || '发送验证码失败');
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      alert('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone.trim()) {
      alert('请输入手机号');
      return;
    }
    if (!verificationCode.trim()) {
      alert('请输入验证码');
      return;
    }
    if (!encryptMobile) {
      alert('请先获取验证码');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用真实的登录 API
      const response = await apiService.login(encryptMobile, verificationCode.trim());
      
      if (response.code === '0') {
        const user = response.result.user;
        
        // 保存用户信息到本地存储
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // 调用登录成功回调
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
        
        // 关闭弹窗
        onClose();
        
        // 重置表单
        setPhone('');
        setVerificationCode('');
        setEncryptMobile('');
        setIsCodeSent(false);
        setCountdown(0);
        
      } else {
        alert(response.message.text || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      alert('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
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
            disabled={isCodeSent || isLoading}
            style={{
              width: '90px',
              height: '40px',
              backgroundColor: (isCodeSent || isLoading) ? '#999' : '#0D2EA9',
              color: '#fff',
              border: 'none',
              fontSize: '12px',
              cursor: (isCodeSent || isLoading) ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              flexShrink: 0,
            }}
          >
            {isLoading ? '发送中...' : (isCodeSent ? `${countdown}s` : '获取验证码')}
          </button>
        </div>

        {/* 登录按钮 */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '235px',
            height: '40px',
            backgroundColor: (phone.trim() && verificationCode.trim() && !isLoading) ? '#0D2EA9' : '#E5E5E5',
            color: (phone.trim() && verificationCode.trim() && !isLoading) ? '#fff' : '#999',
            border: 'none',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
          }}
        >
          {isLoading ? '登录中...' : '登录'}
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
