class AIService {
  constructor() {
    this.currentProvider = 'webspeech'; // 'webspeech' | 'whisper'
    this.recognition = null;
    this.isSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  setProvider(provider) {
    this.currentProvider = provider;
  }

  isAvailable() {
    return this.isSupported;
  }

  async transcribe() {
    if (this.currentProvider === 'webspeech' || !this.isSupported) {
      return this.transcribeWithWebSpeech();
    }
    throw new Error('暂不支持的语音识别方式');
  }

  async transcribeWithWebSpeech() {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('浏览器不支持语音识别'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        resolve({
          text: transcript,
          confidence,
          success: true,
        });
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          resolve({
            text: '',
            confidence: 0,
            success: false,
            error: '未检测到语音，请重试',
          });
        } else {
          reject(new Error(`语音识别错误: ${event.error}`));
        }
      };

      recognition.onend = () => {
        // 识别结束
      };

      // 开始监听
      recognition.start();

      // 设置超时
      setTimeout(() => {
        recognition.stop();
      }, 10000);
    });
  }

  async transcribeWithWhisper() {
    throw new Error('Whisper 模型待集成');
  }

  evaluate(text1, text2) {
    if (!text1 || !text2) {
      return { score: 0, errors: ['音频内容为空'] };
    }

    const cleanText1 = this.cleanText(text1);
    const cleanText2 = this.cleanText(text2);

    const words1 = cleanText1.split(/\s+/).filter(w => w.length > 0);
    const words2 = cleanText2.split(/\s+/).filter(w => w.length > 0);

    let correct = 0;
    const errors = [];

    const maxLen = Math.max(words1.length, words2.length);
    for (let i = 0; i < maxLen; i++) {
      if (words1[i] === words2[i]) {
        correct++;
      } else {
        errors.push({
          expected: words1[i] || '(缺失)',
          actual: words2[i] || '(缺失)',
          position: i,
        });
      }
    }

    const score = maxLen > 0 ? Math.round((correct / maxLen) * 100) : 0;
    const passed = score >= 80;

    return {
      score,
      passed,
      errors: errors.slice(0, 5), // 最多显示5个错误
      correctWords: correct,
      totalWords: maxLen,
      originalText: cleanText2,
    };
  }

  cleanText(text) {
    return text
      .toLowerCase()
      .replace(/[.,!?;:，。！？；：]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const aiService = new AIService();
export default aiService;
