import { Flame, Star, Trophy, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProgressStore, ACHIEVEMENTS } from '@/stores/progressStore';

export function ProgressPanel() {
  const { points, streak, achievements, totalPractices, totalPassed } = useProgressStore();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            连续学习
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{streak} 天</div>
          <p className="text-xs text-muted-foreground">坚持就是胜利</p>
          {streak >= 3 && (
            <Badge variant="success" className="mt-2">加油保持！</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            积分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{points}</div>
          <p className="text-xs text-muted-foreground">完成更多任务获得积分</p>
          <Progress value={Math.min(100, points % 100)} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-purple-500" />
            成就
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {achievements.length > 0 ? (
              achievements.map((key) => {
                const achievement = ACHIEVEMENTS[key];
                return (
                  <Badge key={key} variant="secondary" title={achievement?.description}>
                    {achievement?.name || key}
                  </Badge>
                );
              })
            ) : (
              <span className="text-sm text-muted-foreground">暂无成就</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">学习统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{totalPractices}</div>
              <p className="text-sm text-muted-foreground">总练习次数</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalPassed}</div>
              <p className="text-sm text-muted-foreground">通过任务数</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
