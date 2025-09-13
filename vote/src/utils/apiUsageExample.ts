// API 使用示例

import { apiService } from './apiService';
import type { Book, ApiResponse } from './apiService';

// 示例：在组件中使用 API

export const exampleUsage = {
  // 1. 获取图书列表
  fetchBookList: async (page: number = 1) => {
    try {
      const response = await apiService.getBookList(page);
      
      if (response.code === '0') {
        const books = response.result.item_list;
        console.log('获取到图书列表:', books);
        return books;
      } else {
        console.error('获取图书列表失败:', response.message.text);
        return [];
      }
    } catch (error) {
      console.error('网络错误:', error);
      return [];
    }
  },

  // 2. 获取图书详情
  fetchBookDetail: async (bookId: string) => {
    try {
      const response = await apiService.getBookInfo(bookId);
      
      if (response.code === '0') {
        console.log('获取到图书详情:', response.result);
        return response.result;
      } else {
        console.error('获取图书详情失败:', response.message.text);
        return null;
      }
    } catch (error) {
      console.error('网络错误:', error);
      return null;
    }
  },

  // 3. 发送验证码
  sendVerificationCode: async (mobile: string) => {
    try {
      const response = await apiService.sendSmsCode(mobile);
      
      if (response.code === '0') {
        console.log('验证码发送成功');
        // 返回加密的手机号，用于后续登录
        return response.result.encrypt_mobile;
      } else {
        console.error('发送验证码失败:', response.message.text);
        alert(response.message.text || '发送验证码失败');
        return null;
      }
    } catch (error) {
      console.error('发送验证码网络错误:', error);
      alert('网络错误，请稍后重试');
      return null;
    }
  },

  // 4. 用户登录
  userLogin: async (encryptMobile: string, smsCode: string) => {
    try {
      const response = await apiService.login(encryptMobile, smsCode);
      
      if (response.code === '0') {
        console.log('登录成功:', response.result.user);
        // 可以在这里保存用户信息到 localStorage 或状态管理
        localStorage.setItem('user', JSON.stringify(response.result.user));
        return response.result.user;
      } else {
        console.error('登录失败:', response.message.text);
        alert(response.message.text || '登录失败');
        return null;
      }
    } catch (error) {
      console.error('登录网络错误:', error);
      alert('网络错误，请稍后重试');
      return null;
    }
  },

  // 5. 获取投票信息
  fetchVoteInfo: async () => {
    try {
      const response = await apiService.getVoteInfo();
      
      if (response.code === '0') {
        console.log('剩余投票数:', response.result.remain_vote_num);
        return response.result.remain_vote_num;
      } else {
        console.error('获取投票信息失败:', response.message.text);
        return 0;
      }
    } catch (error) {
      console.error('获取投票信息网络错误:', error);
      return 0;
    }
  },

  // 6. 提交投票
  submitVote: async (selectedBookIds: string[]) => {
    try {
      const response = await apiService.submitVoteResult(selectedBookIds);
      
      if (response.code === '0') {
        console.log('投票提交成功');
        alert('投票提交成功！');
        return true;
      } else {
        console.error('投票提交失败:', response.message.text);
        alert(response.message.text || '投票提交失败');
        return false;
      }
    } catch (error) {
      console.error('投票提交网络错误:', error);
      alert('网络错误，请稍后重试');
      return false;
    }
  },

  // 7. 获取分享信息
  fetchShareInfo: async (bookId: string, fromPage: 'list' | 'detail') => {
    try {
      const response = await apiService.getShareInfo(bookId, fromPage);
      
      if (response.code === '0') {
        console.log('获取分享信息成功:', response.result);
        return response.result;
      } else {
        console.error('获取分享信息失败:', response.message.text);
        return null;
      }
    } catch (error) {
      console.error('获取分享信息网络错误:', error);
      return null;
    }
  },
};

// 在 React 组件中的完整使用示例
/*
import { exampleUsage } from '@/utils/apiUsageExample';

const BookListComponent = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [remainVotes, setRemainVotes] = useState(0);

  useEffect(() => {
    // 获取图书列表
    exampleUsage.fetchBookList(1).then(setBooks);
    
    // 获取投票信息
    exampleUsage.fetchVoteInfo().then(setRemainVotes);
  }, []);

  const handleVote = async (selectedBookIds: string[]) => {
    const success = await exampleUsage.submitVote(selectedBookIds);
    if (success) {
      // 重新获取投票信息
      const newRemainVotes = await exampleUsage.fetchVoteInfo();
      setRemainVotes(newRemainVotes);
    }
  };

  return (
    <div>
      <p>剩余投票数: {remainVotes}</p>
      {books.map(book => (
        <div key={book.id}>
          <h3>{book.name}</h3>
          <p>作者: {book.author}</p>
          <p>投票数: {book.vote_num}</p>
        </div>
      ))}
    </div>
  );
};
*/
