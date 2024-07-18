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

async function retryDownload() {
  try {
    const missingFiles = fs.readFileSync(path.join(__dirname, 'downloads', 'img', 'missing.csv'), 'utf-8').split('\n');
    
    for (const file of missingFiles) {
      if (file.trim() === '') continue;
      
      const fileKey = `img/${file.trim()}`;
      const params = {
        Bucket: bucketName,
        Key: fileKey,
      };
      
      const localFilePath = path.join(__dirname, 'downloads', fileKey);
      
      try {
        const fileStream = s3.getObject(params).createReadStream();
        await fs.promises.mkdir(path.dirname(localFilePath), { recursive: true });
        const localFileWriteStream = fs.createWriteStream(localFilePath);
        
        await new Promise((resolve, reject) => {
          fileStream.pipe(localFileWriteStream)
            .on('finish', () => {
              console.log(`${fileKey} has been downloaded.`);
              resolve();
            })
            .on('error', (err) => {
              console.error(`Error downloading ${fileKey}:`, err);
              reject(err);
            });
        });
      } catch (err) {
        console.error(`Failed to download ${fileKey}:`, err);
      }
    }
    
    console.log('Retry download completed.');
  } catch (error) {
    console.error('Error in retry download:', error);
  }
}

retryDownload();