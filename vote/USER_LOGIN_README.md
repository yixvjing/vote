# 用户登录状态管理实现说明

## 功能概述
现在系统已经实现了完整的用户登录状态管理，包括：
1. 登录成功后自动保存用户UID到localStorage
2. 页面刷新时自动检查登录状态
3. 所有API请求自动携带用户UID
4. 提供完整的用户状态管理工具

## 实现细节

### 1. UserManager 工具类 (`src/utils/userManager.ts`)
负责管理用户状态的核心工具类：
- `saveUid(uid)`: 保存用户UID
- `getUid()`: 获取用户UID
- `saveUserInfo(userInfo)`: 保存完整用户信息
- `getUserInfo()`: 获取完整用户信息
- `isLoggedIn()`: 检查是否已登录
- `clearUserInfo()`: 清除用户信息（登出）

### 2. API自动携带UID (`src/utils/api.ts`)
修改了axios请求拦截器，所有API请求都会自动携带用户UID：
- POST请求：UID添加到请求体中
- GET请求：UID添加到query参数中

### 3. 登录接口增强 (`src/utils/apiService.ts`)
- 登录成功后自动保存用户信息到localStorage
- 新增 `isLoggedIn()`, `getCurrentUser()`, `logout()` 方法

### 4. 页面初始化检查
主页面和书籍详情页面都会在初始化时检查本地是否有登录状态

## 使用方式

### 登录流程
1. 用户输入手机号，获取验证码
2. 输入验证码，点击登录
3. 登录成功后，系统自动保存用户UID和完整用户信息
4. 后续所有API请求都会自动携带UID

### API调用示例
所有现有的API调用无需修改，系统会自动添加UID：
```javascript
// 原有调用方式不变
await apiService.getVoteInfo();
await apiService.submitVoteResult(bookIds);

// 实际发送的请求会自动包含UID
// POST请求：{ ...originalData, uid: "用户UID" }
// GET请求：url?...&uid=用户UID
```

### 检查登录状态
```javascript
// 检查是否已登录
if (apiService.isLoggedIn()) {
  // 用户已登录
  const user = apiService.getCurrentUser();
  console.log('当前用户:', user.nick);
}

// 登出
apiService.logout();
```

## 存储的数据结构

### localStorage 中的数据
1. `vote_user_uid`: 用户UID（字符串）
2. `vote_user_info`: 完整用户信息（JSON字符串）

### 用户信息格式
```json
{
  "status": "online",
  "uid": "3123375669439548422",
  "nick": "佩文是只小火龙",
  "balance": "￥0.00",
  "avatar": "https://...",
  "sex": "unknown",
  "desc": "",
  "hashid": "rgy_bPYmewTA"
}
```

## 注意事项
1. 所有的登录检查都是基于本地存储的UID
2. 如果需要更安全的验证，建议在关键操作前调用服务器验证接口
3. 用户清除浏览器数据会导致登录状态丢失，需要重新登录
