import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useTaskStore } from '@/stores/taskStore';
import { useProgressStore } from '@/stores/progressStore';
import { aiService } from '@/services/aiService';
import { audioService } from '@/services/audioService';

export function PracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const addPoints = useProgressStore((state) => state.addPoints);
  const updateStreak = useProgressStore((state) => state.updateStreak);
  const recordPractice = useProgressStore((state) => state.recordPractice);
  const recordPassed = useProgressStore((state) => state.recordPassed);
  const checkAndUnlockAchievements = useProgressStore((state) => state.checkAndUnlockAchievements);

  const task = tasks.find((t) => t.id === id);

  const [step, setStep] = useState('listen');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [judgeResult, setJudgeResult] = useState(null);
  const [judgeError, setJudgeError] = useState(null);
  const [isJudging, setIsJudging] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [transcribedText, setTranscribedText] = useState('');

  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    if (task && task.status === 'pending') {
      updateTask(task.id, { status: 'in-progress', attempts: task.attempts + 1 });
    }
    hasInitialized.current = true;
  }, [task, updateTask]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!task) {
    return (
      <div className="container py-8 px-4 text-center">
        <p className="text-muted-foreground mb-4">任务不存在</p>
        <Button onClick={() => navigate('/')}>返回首页</Button>
      </div>
    );
  }

  const startRecording = async () => {
    try {
      await audioService.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (error) {
      console.error('开始录音失败:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = async () => {
    try {
      const blob = await audioService.stopRecording();
      setIsRecording(false);
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      clearInterval(timerRef.current);
    } catch (error) {
      console.error('停止录音失败:', error);
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playRecording = () => {
    if (!audioUrl) return;

    if (isPlayingRecording) {
      audioRef.current?.pause();
      setIsPlayingRecording(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlayingRecording(false);
      }
      audioRef.current.play();
      setIsPlayingRecording(true);
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setTranscribedText('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingRecording(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const runJudgement = async () => {
    if (!audioBlob) {
      setJudgeError('请先录音');
      return;
    }

    setIsJudging(true);
    setStep('judging');

    try {
      if (!aiService.isAvailable()) {
        setJudgeError('浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器');
        setStep('result');
        return;
      }

      const transcription = await aiService.transcribe(audioBlob);
      setTranscribedText(transcription.text);

      if (!transcription.success || !transcription.text) {
        setJudgeError(transcription.error || '未能识别语音，请重试');
        setStep('result');
        return;
      }

      const evaluation = aiService.evaluate('', transcription.text);
      setJudgeResult(evaluation);

      if (evaluation.passed) {
        updateTask(task.id, { status: 'passed', score: evaluation.score, completedAt: new Date().toISOString() });
        addPoints(10);
        recordPractice();
        recordPassed();
        updateStreak();
        const achievements = checkAndUnlockAchievements();
        setNewAchievements(achievements);
      } else {
        updateTask(task.id, { status: 'retry', score: evaluation.score });
        recordPractice();
      }

      setStep('result');
    } catch (error) {
      console.error('评判失败:', error);
      setJudgeError(error.message || '评判过程出错，请重试');
      setStep('result');
    } finally {
      setIsJudging(false);
    }
  };

  const handleRetry = () => {
    resetRecording();
    setJudgeResult(null);
    setJudgeError(null);
    setStep('listen');
    updateTask(task.id, { status: 'in-progress', attempts: task.attempts + 1 });
  };

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="container py-8 px-4 max-w-2xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{task.title}</h1>
          <p className="text-sm text-muted-foreground">
            {task.subject === 'english' ? '英语' : '语文'} · {task.type === 'dictation' ? '听写' : '跟读'}
          </p>
        </div>
      </header>

      {step === 'listen' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                1
              </span>
              听标准发音
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AudioPlayer audioPath={task.audioPath} />
            <div className="text-center text-sm text-muted-foreground">
              仔细听标准发音，然后跟读
            </div>
            <Button onClick={() => setStep('record')} className="w-full">
              <Mic className="h-4 w-4 mr-2" />
              我听完了，开始跟读
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'record' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                2
              </span>
              跟读录音
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AudioPlayer audioPath={task.audioPath} />
            <div className="border-t pt-6 space-y-6">
              <p className="text-center text-sm text-muted-foreground">
                点击下方按钮开始录音，朗读完毕后再次点击停止
              </p>

              <div className="flex flex-col items-center gap-4">
                <div className="text-2xl font-mono">
                  {formatTime(recordingTime)}
                </div>

                <div className="flex items-center gap-3">
                  {!audioBlob ? (
                    <Button
                      size="lg"
                      variant={isRecording ? 'destructive' : 'default'}
                      onClick={isRecording ? stopRecording : startRecording}
                      className="rounded-full w-16 h-16"
                    >
                      {isRecording ? (
                        <MicOff className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button size="icon" variant="outline" onClick={resetRecording}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={playRecording}
                        className="rounded-full w-16 h-16"
                      >
                        {isPlayingRecording ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6 ml-1" />
                        )}
                      </Button>
                      <Button size="lg" onClick={runJudgement}>
                        AI 评判
                      </Button>
                    </>
                  )}
                </div>

                {isRecording && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    正在录音...
                  </div>
                )}

                {audioBlob && !transcribedText && (
                  <p className="text-sm text-muted-foreground">
                    录音完成，点击「AI 评判」开始识别
                  </p>
                )}

                {transcribedText && (
                  <div className="w-full p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">识别结果：</p>
                    <p className="text-sm">{transcribedText}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'judging' && isJudging && (
        <Card className="text-center py-8">
          <CardContent className="space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <div>
              <p className="font-medium">AI 正在识别语音...</p>
              <p className="text-sm text-muted-foreground">请稍候</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'result' && judgeError && (
        <Card className="border-yellow-500">
          <CardContent className="py-6 text-center space-y-4">
            <div className="p-3 rounded-full bg-yellow-100 mx-auto w-fit">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-yellow-700">{judgeError}</p>
              <p className="text-sm text-muted-foreground mt-1">
                请重新录音后再试
              </p>
            </div>
            <Button variant="outline" onClick={handleRetry}>
              重新录音
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'result' && judgeResult && (
        <div className="space-y-6">
          <Card className={judgeResult.passed ? 'border-green-500' : 'border-red-500'}>
            <CardContent className="py-6">
              <div className="flex items-center gap-4 mb-4">
                {judgeResult.passed ? (
                  <>
                    <div className="p-3 rounded-full bg-green-100">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <div>
                      <p className="font-bold text-green-600 text-lg">太棒了！通过考核！</p>
                      <p className="text-muted-foreground">正确率 {judgeResult.score}%</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-red-100">
                      <span className="text-2xl">💪</span>
                    </div>
                    <div>
                      <p className="font-bold text-red-600 text-lg">还需要再练习</p>
                      <p className="text-muted-foreground">正确率 {judgeResult.score}%，再试一次吧！</p>
                    </div>
                  </>
                )}
              </div>

              {transcribedText && (
                <div className="p-3 bg-muted rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground mb-1">你的读音：</p>
                  <p className="text-sm">{transcribedText}</p>
                </div>
              )}

              {judgeResult.errors && judgeResult.errors.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium">可能的问题：</p>
                  <ul className="text-sm space-y-1">
                    {judgeResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2 text-red-600">
                        <span>•</span>
                        <span>「{error.actual}」的发音可能需要再练习</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  再练习一次
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  继续
                </Button>
              </div>
            </CardContent>
          </Card>

          {newAchievements.length > 0 && (
            <Card className="border-yellow-500 bg-yellow-50">
              <CardContent className="py-4 text-center">
                <p className="font-medium text-yellow-800 mb-2">🎉 新成就解锁！</p>
                <p className="text-sm text-yellow-700">
                  {newAchievements.join('、')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
