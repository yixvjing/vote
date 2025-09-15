const fs = require('fs');
const path = require('path');

const OUT_DIR = './out';
const OSS_BASE_URL = 'https://static.thefair.net.cn/activity/vote-book';

function fixStaticPaths(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixStaticPaths(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 先修复带有basePath的路径（避免重复替换）
      content = content.replace(
        /\/vote-book\/_next\/static\//g,
        `${OSS_BASE_URL}/_next/static/`
      );
      
      content = content.replace(
        /"\/vote-book\/_next\//g,
        `"${OSS_BASE_URL}/_next/`
      );
      
      // 然后修复其他_next路径
      content = content.replace(
        /\/_next\/static\//g,
        `${OSS_BASE_URL}/_next/static/`
      );
      
      content = content.replace(
        /"\/_next\//g,
        `"${OSS_BASE_URL}/_next/`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed paths in: ${filePath}`);
    }
  });
}

console.log('开始修复静态文件路径...');
fixStaticPaths(OUT_DIR);
console.log('静态文件路径修复完成！');