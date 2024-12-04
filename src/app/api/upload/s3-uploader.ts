import { Readable } from 'stream';
import Busboy from 'busboy';
import {
  CompleteMultipartUploadCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import logger from '@/utils/logger';
import { assertError } from '@/utils';

// Comprehensive file upload configuration types
interface FileUploadConfig {
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: string[];
  maxFiles?: number;
}

// Detailed error for upload-related issues
export class FileUploadError extends Error {
  name = 'FileUploadError';
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class S3Uploader {
  #s3: S3Client;
  #S3_UPLOAD_BASE_URL: string;
  #config: FileUploadConfig;

  constructor(config: FileUploadConfig = {}) {
    logger.info('Initializing S3Uploader with config:', config);

    // Validate S3 configuration
    if (
      !process.env.S3_UPLOAD_REGION ||
      !process.env.S3_UPLOAD_KEY ||
      !process.env.S3_UPLOAD_SECRET ||
      !process.env.S3_UPLOAD_BUCKET
    ) {
      logger.error('S3 credentials or configuration is incomplete');
      throw new FileUploadError(
        'S3 credentials or configuration is incomplete',
        500,
      );
    }

    this.#config = {
      maxFileSize: config.maxFileSize ?? 50 * 1024 * 1024, // 50MB default
      allowedMimeTypes: config.allowedMimeTypes ?? [],
      maxFiles: config.maxFiles ?? 5,
    };

    this.#S3_UPLOAD_BASE_URL = `https://${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com`;
    this.#s3 = new S3Client({
      region: process.env.S3_UPLOAD_REGION,
      credentials: {
        accessKeyId: process.env.S3_UPLOAD_KEY,
        secretAccessKey: process.env.S3_UPLOAD_SECRET,
      },
    });

    logger.info('S3Uploader initialized successfully');
  }

  // Generate a unique, secure file key
  #createKey(filename: string): string {
    const sanitizedFilename = filename
      .replace(/[^a-zA-Z0-9.]/g, '_') // Replace special chars
      .toLowerCase();
    const extension = sanitizedFilename.split('.').pop() || '';
    return `uploads/${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
  }

  // Construct a publicly accessible URL for the uploaded file
  #getSignedUrl(key: string): string {
    return `${this.#S3_UPLOAD_BASE_URL}/${key}`;
  }

  // Validate file before upload
  #validateFile(filename: string, mimetype: string, size: number): void {
    logger.info(
      `Validating file: ${filename}, type: ${mimetype}, size: ${size}`,
    );

    // Check file size
    if (size > (this.#config.maxFileSize ?? Infinity)) {
      throw new FileUploadError(
        `File ${filename} exceeds maximum size of ${this.#config.maxFileSize} bytes`,
      );
    }

    // Check mime types if specified
    if (this.#config.allowedMimeTypes?.length) {
      const isAllowed = this.#config.allowedMimeTypes.some((allowedType) =>
        mimetype.startsWith(allowedType),
      );
      if (!isAllowed) {
        throw new FileUploadError(`File type ${mimetype} is not allowed`);
      }
    }

    logger.info(`File ${filename} passed validation`);
  }

  // Upload file to S3 with progress tracking
  #upload(
    file: Readable,
    filename: string,
    mimetype: string,
    fileSize: number,
  ): {
    upload: Upload;
    key: string;
  } {
    // Validate file before upload
    this.#validateFile(filename, mimetype, fileSize);

    const key = this.#createKey(filename);
    const upload = new Upload({
      client: this.#s3,
      params: {
        Bucket: process.env.S3_UPLOAD_BUCKET,
        Key: key,
        Body: file,
        ContentType: mimetype,
        ContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });

    upload.on('httpUploadProgress', (progress) => {
      logger.info(
        `Upload progress for ${filename}: ${progress.loaded}/${progress.total} bytes`,
      );
    });

    return { upload, key };
  }

  async *handleUploadRequest(request: Request) {
    logger.info('Handling upload request');

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    logger.info('Sending initial response');

    // Send initial response with chunked transfer encoding
    yield new Response(readable, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
      status: 200,
    });

    try {
      logger.info('Creating Busboy instance');
      const headers = Object.fromEntries(request.headers);
      const busboy = Busboy({ headers });

      // Collect all upload promises
      const uploadPromises: Promise<CompleteMultipartUploadCommandOutput>[] =
        [];
      let filesProcessed = 0;

      busboy.on(
        'file',
        async (
          _fieldname: string,
          file: Readable,
          meta: {
            filename: string;
            encoding: string;
            mimeType: string;
          },
        ) => {
          filesProcessed++;
          try {
            logger.info(
              `Processing file: ${meta.filename}, type: ${meta.mimeType}`,
            );
            const { filename, mimeType } = meta;
            let uploadedBytes = 0;

            file.on('data', (data: Buffer) => {
              uploadedBytes += data.length;
              try {
                const progress = `Uploading ${filename}: ${uploadedBytes} bytes uploaded\n`;
                writer.write(progress);
              } catch (e) {
                logger.error('Error writing progress:', e);
              }
            });

            const { key, upload } = this.#upload(
              file,
              filename,
              mimeType,
              uploadedBytes,
            );

            upload.on('httpUploadProgress', (progress) => {
              try {
                const progressMessage = `Upload progress: ${progress.loaded}/${progress.total}\n`;
                writer.write(progressMessage);
                logger.info(progressMessage);
              } catch (e) {
                logger.error('Error writing progress:', e);
              }
            });

            logger.info(`Starting upload for file: ${filename}`);

            // Collect the upload promise
            const uploadPromise = upload.done();
            uploadPromises.push(uploadPromise);
            await uploadPromise;

            const successMessage = `File ${filename} uploaded successfully: ${this.#getSignedUrl(key)}\n`;
            writer.write(successMessage);
            logger.info(successMessage);
          } catch (error) {
            assertError(error);
            logger.error(`Error uploading ${meta.filename}:`, error);

            // Send a detailed error message to the client
            const errorMessage = `Upload failed for ${meta.filename}: ${error.message}\n`;
            if (process.env.NODE_ENV === 'development') {
              writer.write(`Error Details:\n${error.stack}\n`);
            } else {
              writer.write(errorMessage);
            }
          }
        },
      );

      busboy.on('finish', async () => {
        try {
          // Wait for all uploads to complete
          await Promise.all(uploadPromises);

          if (filesProcessed > 0) {
            logger.info('All files have been processed');
            writer.write('All files have been processed successfully.\n');
          } else {
            writer.write('No files were processed.\n');
          }
        } catch (error) {
          assertError(error);
          logger.error('Error in finish handler:', error);
          writer.write(`Error in finish handler: ${error.message}\n`);
        } finally {
          writer.close();
        }
      });

      busboy.on('error', (error) => {
        assertError(error);
        const errorMessage = `Busboy error: ${error.message}\n`;
        writer.write(errorMessage);
        logger.error(errorMessage);
        writer.close();
      });

      const nodeStream = this.#toNodeReadable(request.body!);
      nodeStream.pipe(busboy);
    } catch (error) {
      assertError(error);
      const errorMessage = `Processing error: ${error.message}\n`;
      try {
        writer.write(errorMessage);
        if (process.env.NODE_ENV === 'development') {
          writer.write(`Stack trace: ${error.stack}\n`);
        }
      } catch (e) {
        logger.error('Error writing error message:', e);
      }
      logger.error(errorMessage);
      writer.close();

      // Return an error response
      yield new Response(errorMessage, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  #toNodeReadable(stream: ReadableStream<Uint8Array>): Readable {
    const reader = stream.getReader();

    return new Readable({
      async read() {
        try {
          const { done, value } = await reader.read();
          if (done) {
            this.push(null);
          } else {
            this.push(Buffer.from(value));
          }
        } catch (error) {
          assertError(error);
          this.destroy(error);
        }
      },
    });
  }
}
