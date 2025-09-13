const fs = require('fs');
const path = require('path');

const OUT_DIR = './out';
const OSS_BASE_URL = 'https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book';

function fixStaticPaths(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixStaticPaths(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 修复 /_next/static/ 路径
      content = content.replace(
        /\/_next\/static\//g,
        `${OSS_BASE_URL}/_next/static/`
      );
      
      // 修复其他 /_next/ 路径
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