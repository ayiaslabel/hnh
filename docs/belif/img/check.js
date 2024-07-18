const fs = require('fs');
const path = require('path');

function checkMissingFiles() {
  const expectedFiles = Array.from({ length: 1200 }, (_, i) => `${i + 1}.png`);
  const existingFiles = fs.readdirSync(__dirname);
  const missingFiles = expectedFiles.filter(file => !existingFiles.includes(file));

  const csvContent = missingFiles.join('\n');
  fs.writeFileSync(path.join(__dirname, 'missing.csv'), csvContent);

  console.log(`누락된 파일 수: ${missingFiles.length}`);
  console.log('missing.csv 파일이 생성되었습니다.');
}

checkMissingFiles();