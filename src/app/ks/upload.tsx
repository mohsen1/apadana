'use client';

import { useState } from 'react';

import { FileUploader } from './FileUploader';

const S3_UPLOAD_BASE_URL = `https://${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com`;

export function Upload() {
  const [uploadResults, setUploadResults] = useState<Array<{ key: string }>>(
    [],
  );

  const handleUploadComplete = (results: Array<{ key: string }>) => {
    console.log('Upload completed:', results);
    setUploadResults(results);
  };

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Upload Files</h1>
      <FileUploader />
      <div>
        <div>Results</div>
        <div>
          {uploadResults.map((result, index) => (
            <div key={index}>
              <a href={`${S3_UPLOAD_BASE_URL}/${result.key}`}>
                <img src={`${S3_UPLOAD_BASE_URL}/${result.key}`} />
                <span>{result.key}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
