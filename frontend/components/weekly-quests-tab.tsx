"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw } from "lucide-react"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"; // Context 훅 임포트

interface WeeklyQuest {
  id: number;
  user_id: number;
  quest_name: string;
  quest_description: string | null;
  quest_category: string | null;
  is_completed: boolean;
  last_completed_week: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

export default function WeeklyQuestsTab() {
  console.debug('WeeklyQuestsTab 함수 진입');
  const { selectedServer, selectedCharacter } = useCharacterSelection(); // Context에서 상태 가져오기
  console.debug(`selectedServer: ${selectedServer}, selectedCharacter: ${JSON.stringify(selectedCharacter)}`);
  const [weeklyQuests, setWeeklyQuests] = useState<WeeklyQuest[]>([])
  console.debug(`weeklyQuests 초기값: ${JSON.stringify(weeklyQuests)}`);
  const [characterId, setCharacterId] = useState<number | null>(null);
  console.debug(`characterId 초기값: ${characterId}`);

  const fetchCharacterId = useCallback(async () => {
    console.debug('fetchCharacterId 함수 진입');
    if (!selectedServer || !selectedCharacter) {
      console.debug('selectedServer 또는 selectedCharacter 없음, fetchCharacterId 중단');
      return;
    }
    try {
      console.debug(`캐릭터 ID API 호출: ${BASE_URL}/characters/user/${USER_ID}/server/${selectedServer}`);
      const response = await fetch(`${BASE_URL}/characters/user/${USER_ID}/server/${selectedServer}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.debug(`캐릭터 ID API 응답 데이터: ${JSON.stringify(data)}`);
      const foundChar = data.find((char: any) => char.character_name === selectedCharacter);
      console.debug(`찾은 캐릭터: ${JSON.stringify(foundChar)}`);
      if (foundChar) {
        setCharacterId(foundChar.character_id);
        console.debug(`characterId 설정: ${foundChar.character_id}`);
      } else {
        setCharacterId(null);
        console.debug('캐릭터를 찾을 수 없음, characterId를 null로 설정');
      }
    } catch (error: any) {
      console.debug(`캐릭터 ID 로드 중 오류 발생: ${error.message}`);
      console.error('캐릭터 ID 로드 중 오류 발생:', error);
      setCharacterId(null);
    }
    console.debug('fetchCharacterId 함수 종료');
  }, [selectedServer, selectedCharacter]);

  const fetchWeeklyQuests = useCallback(async () => {
    console.debug('fetchWeeklyQuests 함수 진입');
    if (!characterId) {
      console.debug('characterId 없음, weeklyQuests를 빈 배열로 설정');
      setWeeklyQuests([]);
      return;
    }
    try {
      console.debug(`주간 퀘스트 API 호출: ${BASE_URL}/quests/${USER_ID}/weekly`);
      const response = await fetch(`${BASE_URL}/quests/${USER_ID}/weekly`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: WeeklyQuest[] = await response.json();
      console.debug(`주간 퀘스트 API 응답 데이터: ${JSON.stringify(data)}`);
      setWeeklyQuests(data);
    } catch (error: any) {
      console.debug(`주간 퀘스트 로드 중 오류 발생: ${error.message}`);
      console.error('주간 숙제 로드 중 오류 발생:', error);
      setWeeklyQuests([]);
    }
    console.debug('fetchWeeklyQuests 함수 종료');
  }, [characterId]);

  useEffect(() => {
    console.debug('fetchCharacterId useEffect 실행');
    fetchCharacterId();
  }, [fetchCharacterId]);

  useEffect(() => {
    console.debug('characterId useEffect 실행');
    if (characterId) {
      console.debug('characterId 존재, fetchWeeklyQuests 호출');
      fetchWeeklyQuests();
    } else {
      console.debug('characterId 없음, weeklyQuests를 빈 배열로 설정');
      setWeeklyQuests([]);
    }
    console.debug('characterId useEffect 종료');
  }, [characterId, fetchWeeklyQuests]);

  const toggleQuestCompletion = async (questId: number, isCompleted: boolean) => {
    console.debug(`toggleQuestCompletion 함수 진입 - questId: ${questId}, isCompleted: ${isCompleted}`);
    if (!characterId) {
      console.debug('characterId 없음, 퀘스트 완료/미완료 토글 중단');
      return;
    }

    try {
      const url = `${BASE_URL}/quests/${USER_ID}/weekly/complete/${questId}`;
      console.debug(`퀘스트 완료/미완료 API URL: ${url}`);

      if (!isCompleted) {
        console.debug('퀘스트 미완료 상태, POST 요청 전송');
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
        console.debug('숙제 완료 성공');
      } else {
        console.debug('퀘스트 이미 완료 상태, 건너뛰기');
        alert('이미 완료된 숙제입니다.');
        return;
      }

      fetchWeeklyQuests(); // UI 업데이트를 위해 다시 데이터를 가져옵니다.
      console.debug('toggleQuestCompletion 함수 종료 - fetchWeeklyQuests 호출');

    } catch (error: any) {
      console.debug(`숙제 완료 중 오류 발생: ${error.message}`);
      console.error('숙제 완료 중 오류 발생:', error);
      alert(`숙제 완료 실패: ${error.message}`);
    }
  };

  const resetQuests = async () => {
    console.debug('resetQuests 함수 진입');
    if (!characterId) {
      console.debug('characterId 없음, 퀘스트 초기화 중단');
      return;
    }

    try {
      const url = `${BASE_URL}/quests/${USER_ID}/weekly/reset`;
      console.debug(`퀘스트 초기화 API URL: ${url}`);

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

      alert(`주간 숙제 초기화 성공!`);
      console.debug('주간 숙제 초기화 성공');

      fetchWeeklyQuests(); // UI 업데이트를 위해 다시 데이터를 가져옵니다.
      console.debug('resetQuests 함수 종료 - fetchWeeklyQuests 호출');

    } catch (error: any) {
      console.debug(`숙제 초기화 중 오류 발생: ${error.message}`);
      console.error('숙제 초기화 중 오류 발생:', error);
      alert(`주간 숙제 초기화 실패: ${error.message}`);
    }
  };

  const weeklyCompletionRate =
    weeklyQuests.length > 0
      ? Math.round((weeklyQuests.filter((q) => q.is_completed).length / weeklyQuests.length) * 100)
      : 0
  console.debug(`주간 완료율: ${weeklyCompletionRate}%`);

  if (!selectedServer || !selectedCharacter) {
    console.debug('selectedServer 또는 selectedCharacter 없음, 경고 메시지 표시');
    return (
      <Alert>
        <AlertDescription>서버와 캐릭터를 먼저 선택해주세요.</AlertDescription>
      </Alert>
    )
  }

  if (!characterId) {
    console.debug('characterId 없음, 로딩 메시지 표시');
    return (
      <Alert>
        <AlertDescription>캐릭터 정보를 불러오는 중...</AlertDescription>
      </Alert>
    )
  }

  console.debug('WeeklyQuestsTab 렌더링');
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>주간 숙제</CardTitle>
            <CardDescription>매주 월요일 자정에 초기화됩니다</CardDescription>
          </div>
          <Badge variant="outline">
            {weeklyCompletionRate}% 완료
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button variant="destructive" size="sm" onClick={() => {
            console.debug('주간 숙제 초기화 버튼 클릭');
            resetQuests();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            주간 숙제 초기화
          </Button>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">완료</TableHead>
                  <TableHead>숙제명</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>카테고리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklyQuests.map((quest) => (
                  <TableRow key={quest.id}>
                    <TableCell>
                      <Checkbox
                        checked={quest.is_completed}
                        onCheckedChange={(checked) => {
                          console.debug(`체크박스 변경 - questId: ${quest.id}, checked: ${checked}`);
                          toggleQuestCompletion(quest.id, checked as boolean);
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{quest.quest_name}</TableCell>
                    <TableCell>{quest.quest_description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{quest.quest_category}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {weeklyQuests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
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
  )
} 