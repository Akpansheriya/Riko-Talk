const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "us-east-1",
  signatureVersion: "v4",
  credentials: {
    accessKeyId: "AKIAVYV5Z5OTJL322POR",
    secretAccessKey: "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",
  },
});

const uploadToS3 = async (file, folder) => {
  try {
    if (!file || !file.buffer) throw new Error("Invalid file data.");

    const uploadParams = {
      Bucket: "rikotalk", 
      Key: `${folder}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await s3.send(new PutObjectCommand(uploadParams));
    return `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};




module.exports = uploadToS3;
