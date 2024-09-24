const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file, folder) => {
  try {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${folder}/${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    const result = await upload.done();
    return result.Location;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

module.exports = uploadToS3;
