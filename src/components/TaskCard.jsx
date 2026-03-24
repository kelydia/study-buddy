import { BookOpen, Mic, CheckCircle, RotateCcw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: '待完成', icon: Clock, variant: 'secondary', color: 'text-gray-500' },
  'in-progress': { label: '进行中', icon: Clock, variant: 'warning', color: 'text-yellow-500' },
  passed: { label: '已通过', icon: CheckCircle, variant: 'success', color: 'text-green-500' },
  retry: { label: '需重试', icon: RotateCcw, variant: 'destructive', color: 'text-red-500' },
};

export function TaskCard({ task, onSelect, className }) {
  const status = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Card className={cn('transition-all hover:shadow-md cursor-pointer', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {task.subject === 'english' ? (
              <BookOpen className="h-5 w-5 text-primary" />
            ) : (
              <Mic className="h-5 w-5 text-primary" />
            )}
            <CardTitle className="text-lg">{task.title}</CardTitle>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="capitalize">{task.subject === 'english' ? '英语' : '语文'}</span>
            {' · '}
            <span>{task.type === 'dictation' ? '听写' : '跟读'}</span>
          </div>
          <div className="flex items-center gap-2">
            {task.score !== null && (
              <span className="text-sm font-medium">{task.score}分</span>
            )}
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onSelect(task); }}>
              {task.status === 'pending' ? '开始' : task.status === 'passed' ? '复习' : '继续'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
