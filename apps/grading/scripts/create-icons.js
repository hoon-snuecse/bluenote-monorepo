// 간단한 아이콘 생성 스크립트
// SVG를 사용하여 임시 아이콘 생성

const fs = require('fs');
const path = require('path');

// 간단한 SVG 아이콘 템플릿
const createSvgIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="20"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial" font-size="${size * 0.3}" font-weight="bold">
    평가
  </text>
</svg>
`;

// PNG 대신 간단한 자리표시자 이미지 생성
const createPlaceholderIcon = (size) => {
  // 1x1 투명 PNG
  const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  return transparentPng;
};

// public 디렉토리 경로
const publicDir = path.join(__dirname, '..', 'public');

// 아이콘 생성
[192, 512].forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(publicDir, filename);
  
  // 임시로 작은 PNG 파일 생성
  fs.writeFileSync(filepath, createPlaceholderIcon(size));
  console.log(`Created ${filename}`);
});

// SVG 아이콘도 생성 (더 나은 옵션)
const svgIcon = createSvgIcon(192);
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
console.log('Created icon.svg');

console.log('아이콘 파일 생성 완료!');