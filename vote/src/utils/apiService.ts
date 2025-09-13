// API 服务 - 根据真实接口文档

import { postRequest, getRequest } from './api';
import { UserManager } from './userManager';

// 通用响应结构
interface ApiResponse<T = any> {
  code: string;
  message: {
    text: string;
    action: string;
  };
  result: T;
}

// 图书信息接口
interface Book {
  id: string;
  rank: number;
  name: string;
  intro: string;
  author: string;
  editor: string;
  cover_url: string;
  brand: string;
  vote_num: number;
  voted: boolean;
}

// 分页图书列表响应
interface BookListResponse {
  item_list: Book[];
  item_count: number;
  item_per_page: number;
  page: number;
  page_count: number;
}

// 投票信息响应
interface VoteInfoResponse {
  remain_vote_num: number;
}

// 提交投票响应
interface SubmitVoteResponse {
  status: boolean;
}

// 分享信息响应
interface ShareInfoResponse {
  name: string;
  intro: string;
  cover_url: string;
}

// 发送验证码响应
interface SendSmsCodeResponse {
  status: boolean;
  encrypt_mobile: string;
}

// 用户信息
interface User {
  status: string;
  uid: string;
  nick: string;
  balance: string;
  avatar: string;
  sex: string;
  desc: string;
  hashid: string;
}

// 登录响应
interface LoginResponse {
  user: User;
}

// API 服务方法
export const apiService = {
  // 分页获取图书列表
  getBookList: async (page: number = 1): Promise<ApiResponse<BookListResponse>> => {
    return await postRequest<ApiResponse<BookListResponse>>('/activity/vote/get_book_list', {
      page
    });
  },

  // 获取图书详情
  getBookInfo: async (bookId: string): Promise<ApiResponse<Book>> => {
    return await postRequest<ApiResponse<Book>>('/activity/vote/get_book_info', {
      book_id: bookId
    });
  },

  // 获取当前用户投票信息
  getVoteInfo: async (): Promise<ApiResponse<VoteInfoResponse>> => {
    return await postRequest<ApiResponse<VoteInfoResponse>>('/activity/vote/get_vote_info', {});
  },

  // 获取基础信息
  getBaseInfo: async (): Promise<ApiResponse<any>> => {
    return await postRequest<ApiResponse<any>>('/activity/vote/get_base_info', {});
  },

  // 提交投票结果
  submitVoteResult: async (bookIds: string[]): Promise<ApiResponse<SubmitVoteResponse>> => {
    return await postRequest<ApiResponse<SubmitVoteResponse>>('/activity/vote/submit_vote_result', {
      book_ids: bookIds.join(',')
    });
  },

  // 获取分享信息
  getShareInfo: async (bookId: string, fromPage: 'list' | 'detail'): Promise<ApiResponse<ShareInfoResponse>> => {
    return await postRequest<ApiResponse<ShareInfoResponse>>('/activity/vote/get_share_info', {
      book_id: bookId,
      from_page: fromPage
    });
  },

  // 发送验证码
  sendSmsCode: async (mobile: string, countryCode: number = 86): Promise<ApiResponse<SendSmsCodeResponse>> => {
    return await postRequest<ApiResponse<SendSmsCodeResponse>>('/activity/vote/send_sms_code', {
      mobile,
      country_code: countryCode
    });
  },

  // 基于验证码登录
  login: async (encryptMobile: string, smsCode: string, countryCode: number = 86): Promise<ApiResponse<LoginResponse>> => {
    const response = await postRequest<ApiResponse<LoginResponse>>('/v1/user/login', {
      login_method: 'sms_code',
      mobile: encryptMobile,
      country_code: countryCode,
      sms_code: smsCode
    });
    
    // 登录成功后保存用户信息
    if (response.code === '0' && response.result?.user) {
      UserManager.saveUserInfo(response.result.user);
      console.log('用户信息已保存到localStorage:', response.result.user);
    }
    
    return response;
  },

  // 检查登录状态
  isLoggedIn: (): boolean => {
    return UserManager.isLoggedIn();
  },

  // 获取当前用户信息
  getCurrentUser: (): any => {
    return UserManager.getUserInfo();
  },

  // 登出
  logout: (): void => {
    UserManager.clearUserInfo();
    console.log('用户已登出，本地存储已清除');
  },
};

// 导出类型定义，供其他组件使用
export type { 
  ApiResponse, 
  Book, 
  BookListResponse, 
  VoteInfoResponse, 
  SubmitVoteResponse,
  ShareInfoResponse,
  SendSmsCodeResponse,
  User,
  LoginResponse
};
