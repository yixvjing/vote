// 用户状态管理工具
export class UserManager {
  private static readonly UID_KEY = 'vote_user_uid';
  private static readonly USER_INFO_KEY = 'vote_user_info';

  // 触发登录状态变化事件
  private static triggerLoginStateChange(isLoggedIn: boolean): void {
    try {
      // 触发自定义事件，用于同一页面内的状态同步
      const event = new CustomEvent('loginStateChange', {
        detail: { isLoggedIn }
      });
      window.dispatchEvent(event);
      console.log('触发登录状态变化事件:', isLoggedIn ? '已登录' : '未登录');
    } catch (error) {
      console.warn('触发登录状态变化事件失败:', error);
    }
  }

  // 保存用户UID
  static saveUid(uid: string): void {
    try {
      const oldUid = this.getUid();
      localStorage.setItem(this.UID_KEY, uid);
      
      // 如果UID发生变化，触发状态变化事件
      if (oldUid !== uid) {
        this.triggerLoginStateChange(true);
      }
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
      const wasLoggedIn = this.isLoggedIn();
      
      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
      // 同时保存UID
      if (userInfo.uid) {
        localStorage.setItem(this.UID_KEY, userInfo.uid);
      }
      
      // 如果之前未登录，现在登录了，触发状态变化事件
      if (!wasLoggedIn) {
        this.triggerLoginStateChange(true);
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
      const wasLoggedIn = this.isLoggedIn();
      
      localStorage.removeItem(this.UID_KEY);
      localStorage.removeItem(this.USER_INFO_KEY);
      
      // 如果之前已登录，现在登出了，触发状态变化事件
      if (wasLoggedIn) {
        this.triggerLoginStateChange(false);
      }
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
