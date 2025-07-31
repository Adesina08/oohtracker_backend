// Media compression utilities
export class MediaCompressor {
  // Compress image to JPEG with quality settings
  static async compressImage(file: File, quality: number = 0.6, maxWidth: number = 800): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Compress video using MediaRecorder API
  static async compressVideo(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      video.onloadedmetadata = () => {
        // Set canvas size (compress to lower resolution)
        canvas.width = Math.min(video.videoWidth, 640);
        canvas.height = Math.min(video.videoHeight, 480);
        
        const stream = canvas.captureStream(15); // 15 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8',
          videoBitsPerSecond: 250000 // Low bitrate for compression
        });
        
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const compressedBlob = new Blob(chunks, { type: 'video/webm' });
          const compressedFile = new File([compressedBlob], file.name.replace(/\.\w+$/, '.webm'), {
            type: 'video/webm',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        };
        
        mediaRecorder.onerror = () => {
          reject(new Error('Video compression failed'));
        };
        
        // Start recording
        mediaRecorder.start();
        
        // Draw video frames to canvas
        const drawFrame = () => {
          if (!video.paused && !video.ended) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(drawFrame);
          } else {
            mediaRecorder.stop();
          }
        };
        
        video.play();
        drawFrame();
      };
      
      video.onerror = () => {
        reject(new Error('Video loading failed'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  // Get file size in MB
  static getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
  }

  // Check if compression is needed
  static needsCompression(file: File, maxSizeMB: number = 5): boolean {
    return this.getFileSizeMB(file) > maxSizeMB;
  }
}