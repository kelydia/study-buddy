import { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { audioService } from '@/services/audioService';
import { cn } from '@/lib/utils';

export function Recorder({ onRecordingComplete, className }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      await audioService.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);

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
      setAudioUrl(URL.createObjectURL(blob));
      clearInterval(timerRef.current);
    } catch (error) {
      console.error('停止录音失败:', error);
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playRecording = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const confirmRecording = () => {
    if (audioBlob && onRecordingComplete) {
      onRecordingComplete(audioBlob);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
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
                <Square className="h-6 w-6 fill-current" />
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
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
              <Button size="lg" onClick={confirmRecording}>
                使用这段录音
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

        {audioBlob && (
          <p className="text-sm text-muted-foreground">
            录音已保存，点击「使用这段录音」进行 AI 评判
          </p>
        )}
      </div>
    </div>
  );
}
