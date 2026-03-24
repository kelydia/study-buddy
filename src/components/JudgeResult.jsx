import { CheckCircle, XCircle, RotateCcw, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function JudgeResult({ result, onRetry, onContinue }) {
  if (!result) return null;

  const isPassed = result.passed;

  return (
    <Card className={cn('animate-in fade-in slide-in-from-bottom-4', isPassed ? 'border-green-500' : 'border-red-500')}>
      <CardHeader>
        <div className="flex items-center gap-4">
          {isPassed ? (
            <>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-green-600">太棒了！通过考核！</CardTitle>
                <p className="text-muted-foreground">正确率 {result.score}%，继续加油！</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-600">还需要再练习</CardTitle>
                <p className="text-muted-foreground">正确率 {result.score}%，再试一次吧！</p>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {result.errors && result.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">错误详情：</h4>
            <ul className="text-sm space-y-1">
              {result.errors.map((error, index) => (
                <li key={index} className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>
                    读作「{error.actual}」应为「{error.expected}」
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onRetry} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            再练习一次
          </Button>
          <Button onClick={onContinue} className="flex-1">
            继续
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function JudgeLoading() {
  return (
    <Card className="text-center py-8">
      <CardContent className="space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <div>
          <p className="font-medium">AI 正在评判...</p>
          <p className="text-sm text-muted-foreground">请稍候</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function JudgeError({ error, onRetry }) {
  return (
    <Card className="border-yellow-500">
      <CardContent className="py-6 text-center space-y-4">
        <div className="p-3 rounded-full bg-yellow-100 mx-auto w-fit">
          <Award className="h-8 w-8 text-yellow-600" />
        </div>
        <div>
          <p className="font-medium text-yellow-700">AI 评判暂时不可用</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={onRetry}>
          重新尝试
        </Button>
      </CardContent>
    </Card>
  );
}
