require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();
const bucketName = 'belifherb';

// S3 버킷에서 모든 파일을 다운로드하는 함수
async function downloadFromAwsStorage(folderName) {
  try {
    let continuationToken = null;
    do {
      const params = {
        Bucket: bucketName,
        Prefix: folderName + '/',
        MaxKeys: 1300,
        ContinuationToken: continuationToken
      };
      
      const response = await s3.listObjectsV2(params).promise();
      
      for (const item of response.Contents) {
        const fileKey = item.Key;
        // 디렉토리인 경우 건너뛰기
        if (fileKey.endsWith('/')) {
          console.log(`Skipping directory: ${fileKey}`);
          continue;
        }

        const params = {
          Bucket: bucketName,
          Key: fileKey,
        };
        const fileStream = s3.getObject(params).createReadStream();
        const localFilePath = path.join(__dirname, 'downloads', fileKey);
        // 디렉토리 생성
        await fs.promises.mkdir(path.dirname(localFilePath), { recursive: true });
        const localFileWriteStream = fs.createWriteStream(localFilePath);
        await new Promise((resolve, reject) => {
          fileStream.pipe(localFileWriteStream)
            .on('finish', () => {
              console.log(`${fileKey} has been downloaded.`);
              resolve();
            })
            .on('error', reject);
        });
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    console.error('Error downloading from S3:', error);
    }
  }

// 사용 예시
// downloadFromAwsStorage('img');
downloadFromAwsStorage('meta');