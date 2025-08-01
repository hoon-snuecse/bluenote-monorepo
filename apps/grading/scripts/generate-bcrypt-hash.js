const bcrypt = require('bcryptjs');

// 임시 비밀번호
const password = 'temp123!';

// bcrypt 해시 생성
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nSQL에 사용할 값:');
console.log(hash);