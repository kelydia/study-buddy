class AudioService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  async startRecording() {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const options = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000);
      return true;
    } catch (error) {
      console.error('开始录音失败:', error);
      this.cleanup();
      throw this.getPermissionError(error);
    }
  }

  getSupportedMimeType() {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/wav',
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return { mimeType };
      }
    }
    return {};
  }

  getPermissionError(error) {
    if (error.name === 'NotAllowedError') {
      return new Error('麦克风权限被拒绝，请在浏览器设置中允许访问麦克风');
    }
    if (error.name === 'NotFoundError') {
      return new Error('未找到麦克风设备，请确保设备已连接');
    }
    if (error.name === 'NotReadableError') {
      return new Error('麦克风被其他应用占用，请关闭其他使用麦克风的程序');
    }
    if (error.name === 'OverconstrainedError') {
      return new Error('麦克风不支持所需的音频设置');
    }
    return new Error(`无法访问麦克风: ${error.message || error.name}`);
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('未在录音'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        if (this.audioChunks.length === 0) {
          reject(new Error('录音数据为空，请重试'));
          return;
        }
        
        const mimeType = this.getSupportedMimeType().mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (event) => {
        this.cleanup();
        reject(new Error(`录音出错: ${event.error?.message || '未知错误'}`));
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        this.cleanup();
        reject(err);
      }
    });
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('停止音频轨道失败:', e);
        }
      });
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  cancelRecording() {
    this.cleanup();
  }

  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }

  async loadAudioFile(filePath) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = filePath;

      audio.onloadedmetadata = () => {
        resolve({
          duration: audio.duration,
          audio,
        });
      };

      audio.onerror = () => {
        reject(new Error('无法加载音频文件'));
      };
    });
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

export const audioService = new AudioService();
export default audioService;
