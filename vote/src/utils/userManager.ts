// 用户状态管理工具
export class UserManager {
  private static readonly UID_KEY = 'vote_user_uid';
  private static readonly USER_INFO_KEY = 'vote_user_info';

  // 保存用户UID
  static saveUid(uid: string): void {
    try {
      localStorage.setItem(this.UID_KEY, uid);
    } catch (error) {
      console.warn('保存UID到localStorage失败:', error);
    }
  }

  // 获取用户UID
  static getUid(): string | null {
    try {
      return localStorage.getItem(this.UID_KEY);
    } catch (error) {
      console.warn('从localStorage获取UID失败:', error);
      return null;
    }
  }

  // 保存完整用户信息
  static saveUserInfo(userInfo: any): void {
    try {
      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
      // 同时保存UID
      if (userInfo.uid) {
        this.saveUid(userInfo.uid);
      }
    } catch (error) {
      console.warn('保存用户信息到localStorage失败:', error);
    }
  }

  // 获取完整用户信息
  static getUserInfo(): any | null {
    try {
      const userInfo = localStorage.getItem(this.USER_INFO_KEY);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.warn('从localStorage获取用户信息失败:', error);
      return null;
    }
  }

  // 检查是否已登录（有有效的UID）
  static isLoggedIn(): boolean {
    const uid = this.getUid();
    return !!uid;
  }

  // 清除用户信息（登出）
  static clearUserInfo(): void {
    try {
      localStorage.removeItem(this.UID_KEY);
      localStorage.removeItem(this.USER_INFO_KEY);
    } catch (error) {
      console.warn('清除用户信息失败:', error);
    }
  }

  // 获取用户昵称
  static getUserNick(): string {
    const userInfo = this.getUserInfo();
    return userInfo?.nick || '用户';
  }

  // 获取用户头像
  static getUserAvatar(): string {
    const userInfo = this.getUserInfo();
    return userInfo?.avatar || '';
  }
}
