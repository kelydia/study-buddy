import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function AddTaskModal({ isOpen, onClose, onAdd, addToast }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('english');
  const [type, setType] = useState('dictation');
  const [audioFile, setAudioFile] = useState(null);
  const [, setAudioPreview] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast?.('请填写任务名称', 'error');
      return;
    }
    if (!audioFile) {
      addToast?.('请上传音频文件', 'error');
      return;
    }

    const audioPath = URL.createObjectURL(audioFile);
    
    onAdd({
      title: title.trim(),
      subject,
      type,
      audioPath,
    });

    setTitle('');
    setAudioFile(null);
    setAudioPreview(null);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setAudioFile(null);
    setAudioPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>添加新任务</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-white hover:border-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">任务名称</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：Unit 1 单词听写"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">科目</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="english">英语</option>
                  <option value="chinese">语文</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">类型</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="dictation">听写</option>
                  <option value="reading">跟读</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">音频文件</label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  audioFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {audioFile ? (
                  <div className="text-green-600">
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-sm">点击更换文件</p>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">点击或拖拽上传音频文件</p>
                    <p className="text-xs">支持 MP3, WAV, M4A</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                取消
              </Button>
              <Button type="submit" className="flex-1">
                添加任务
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
