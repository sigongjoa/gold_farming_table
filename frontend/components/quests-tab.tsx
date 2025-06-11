"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw } from "lucide-react"

interface QuestsTabProps {
  server: string
  character: string
}

interface DailyQuest {
  id: number;
  user_id: number;
  quest_name: string;
  quest_description: string | null;
  quest_category: string | null;
  is_completed: boolean;
  last_completed_date: string | null;
}

interface WeeklyQuest {
  id: number;
  user_id: number;
  quest_name: string;
  quest_description: string | null;
  quest_category: string | null;
  is_completed: boolean;
  last_completed_week: string | null;
}

const BASE_URL = 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

export default function QuestsTab({ server, character }: QuestsTabProps) {
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([])
  const [weeklyQuests, setWeeklyQuests] = useState<WeeklyQuest[]>([])
  const [characterId, setCharacterId] = useState<number | null>(null);

  const fetchCharacterId = useCallback(async () => {
    if (!server || !character) return;
    try {
      const response = await fetch(`${BASE_URL}/characters/user/${USER_ID}/server/${server}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const foundChar = data.find((char: any) => char.character_name === character);
      if (foundChar) {
        setCharacterId(foundChar.character_id);
      } else {
        setCharacterId(null);
      }
    } catch (error) {
      console.error('캐릭터 ID 로드 중 오류 발생:', error);
      setCharacterId(null);
    }
  }, [server, character]);

  const fetchDailyQuests = useCallback(async () => {
    if (!characterId) {
      setDailyQuests([]);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/quests/daily/user/${USER_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: DailyQuest[] = await response.json();
      setDailyQuests(data);
    } catch (error) {
      console.error('일일 숙제 로드 중 오류 발생:', error);
      setDailyQuests([]);
    }
  }, [characterId]);

  const fetchWeeklyQuests = useCallback(async () => {
    if (!characterId) {
      setWeeklyQuests([]);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/quests/weekly/user/${USER_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: WeeklyQuest[] = await response.json();
      setWeeklyQuests(data);
    } catch (error) {
      console.error('주간 숙제 로드 중 오류 발생:', error);
      setWeeklyQuests([]);
    }
  }, [characterId]);

  useEffect(() => {
    fetchCharacterId();
  }, [fetchCharacterId]);

  useEffect(() => {
    if (characterId) {
      fetchDailyQuests();
      fetchWeeklyQuests();
    } else {
      setDailyQuests([]);
      setWeeklyQuests([]);
    }
  }, [characterId, fetchDailyQuests, fetchWeeklyQuests]);

  const toggleQuestCompletion = async (questId: number, type: "daily" | "weekly", isCompleted: boolean) => {
    if (!characterId) return;

    try {
      const url = type === "daily"
        ? `${BASE_URL}/quests/daily/user/${USER_ID}/complete/${questId}`
        : `${BASE_URL}/quests/weekly/user/${USER_ID}/complete/${questId}`;

      // 백엔드 API는 완료/미완료 토글이 아니라 '완료' 기능만 제공하므로, 현재 상태가 미완료일 때만 호출합니다.
      // 만약 이미 완료된 상태에서 다시 클릭하는 경우, 별다른 동작을 하지 않거나 (현재),
      // 백엔드에 '미완료'로 되돌리는 API가 있다면 해당 API를 호출해야 합니다.
      if (!isCompleted) {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        alert('숙제 완료 성공!');
      } else {
        alert('이미 완료된 숙제입니다.');
        return;
      }

      // UI 업데이트를 위해 다시 데이터를 가져옵니다.
      if (type === "daily") {
        fetchDailyQuests();
      } else {
        fetchWeeklyQuests();
      }

    } catch (error: any) {
      console.error('숙제 완료 중 오류 발생:', error);
      alert(`숙제 완료 실패: ${error.message}`);
    }
  };

  const resetQuests = async (type: "daily" | "weekly") => {
    if (!characterId) return;

    try {
      const url = type === "daily"
        ? `${BASE_URL}/quests/daily/user/${USER_ID}/reset`
        : `${BASE_URL}/quests/weekly/user/${USER_ID}/reset`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      alert(`${type === "daily" ? "일일" : "주간"} 숙제 초기화 성공!`);

      // UI 업데이트를 위해 다시 데이터를 가져옵니다.
      if (type === "daily") {
        fetchDailyQuests();
      } else {
        fetchWeeklyQuests();
      }

    } catch (error: any) {
      console.error('숙제 초기화 중 오류 발생:', error);
      alert(`${type === "daily" ? "일일" : "주간"} 숙제 초기화 실패: ${error.message}`);
    }
  };

  const dailyCompletionRate =
    dailyQuests.length > 0 ? Math.round((dailyQuests.filter((q) => q.is_completed).length / dailyQuests.length) * 100) : 0

  const weeklyCompletionRate =
    weeklyQuests.length > 0
      ? Math.round((weeklyQuests.filter((q) => q.is_completed).length / weeklyQuests.length) * 100)
      : 0

  if (!server || !character) {
    return (
      <Alert>
        <AlertDescription>서버와 캐릭터를 먼저 선택해주세요.</AlertDescription>
      </Alert>
    )
  }

  if (!characterId) {
    return (
      <Alert>
        <AlertDescription>캐릭터 정보를 불러오는 중...</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle>일일/주간 숙제 관리</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">서버: {server}</Badge>
            <Badge variant="outline">캐릭터: {character}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>일일 숙제</CardTitle>
                  <CardDescription>매일 자정에 초기화됩니다</CardDescription>
                </div>
                <Badge variant="outline">
                  {dailyCompletionRate}% 완료
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="destructive" size="sm" onClick={() => resetQuests("daily")}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  일일 숙제 초기화
                </Button>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>숙제명</TableHead>
                        <TableHead>설명</TableHead>
                        <TableHead>완료 여부</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyQuests.map((quest) => (
                        <TableRow key={quest.id}>
                          <TableCell className="font-medium">{quest.quest_name}</TableCell>
                          <TableCell>{quest.quest_description}</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={quest.is_completed}
                              onCheckedChange={() => toggleQuestCompletion(quest.id, "daily", quest.is_completed)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {dailyQuests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            일일 숙제가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>주간 숙제</CardTitle>
                  <CardDescription>매주 월요일에 초기화됩니다</CardDescription>
                </div>
                <Badge variant="outline">
                  {weeklyCompletionRate}% 완료
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="destructive" size="sm" onClick={() => resetQuests("weekly")}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  주간 숙제 초기화
                </Button>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>숙제명</TableHead>
                        <TableHead>설명</TableHead>
                        <TableHead>완료 여부</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weeklyQuests.map((quest) => (
                        <TableRow key={quest.id}>
                          <TableCell className="font-medium">{quest.quest_name}</TableCell>
                          <TableCell>{quest.quest_description}</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={quest.is_completed}
                              onCheckedChange={() => toggleQuestCompletion(quest.id, "weekly", quest.is_completed)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {weeklyQuests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            주간 숙제가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
