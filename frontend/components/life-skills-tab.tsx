"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronUp, ChevronDown } from "lucide-react"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"; // Context 훅 임포트

interface LifeSkill {
  life_skill_id: number;
  life_skill_name: string;
  icon_url: string | null;
  level: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

export default function LifeSkillsTab() {
  console.debug('LifeSkillsTab 함수 진입');
  const { selectedServer } = useCharacterSelection(); // Context에서 selectedServer만 가져오기
  console.debug(`selectedServer: ${selectedServer}`);
  const [lifeSkills, setLifeSkills] = useState<LifeSkill[]>([])
  console.debug(`lifeSkills 초기값: ${JSON.stringify(lifeSkills)}`);

  const fetchLifeSkills = useCallback(async () => {
    console.debug('fetchLifeSkills 함수 진입');
    if (!selectedServer) {
      console.debug('selectedServer 없음, lifeSkills를 빈 배열로 설정');
      setLifeSkills([]);
      return;
    }
    try {
      console.debug(`생활스킬 API 호출: ${BASE_URL}/life-skills/server/${selectedServer}`);
      const response = await fetch(`${BASE_URL}/life-skills/server/${selectedServer}`);
      if (!response.ok) {
        console.debug(`HTTP 오류 발생: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: LifeSkill[] = await response.json();
      console.debug(`생활스킬 API 응답 데이터: ${JSON.stringify(data)}`);
      setLifeSkills(data);
    } catch (error: any) {
      console.debug(`생활스킬 로드 중 오류 발생: ${error.message}`);
      console.error('생활스킬 로드 중 오류 발생:', error);
      setLifeSkills([]);
    }
    console.debug('fetchLifeSkills 함수 종료');
  }, [selectedServer]);

  useEffect(() => {
    console.debug('useEffect 실행');
    fetchLifeSkills();
    console.debug('useEffect 종료 - fetchLifeSkills 호출');
  }, [fetchLifeSkills]);

  const updateLifeSkillLevel = async (lifeSkillId: number, change: number) => {
    console.debug(`updateLifeSkillLevel 함수 진입 - lifeSkillId: ${lifeSkillId}, change: ${change}`);
    if (!selectedServer) {
      console.debug('selectedServer 없음, 생활스킬 레벨 업데이트 중단');
      return;
    }
    const currentSkill = lifeSkills.find(skill => skill.life_skill_id === lifeSkillId);
    console.debug(`현재 스킬: ${JSON.stringify(currentSkill)}`);
    if (!currentSkill) {
      console.debug('현재 스킬 없음, 생활스킬 레벨 업데이트 중단');
      return;
    }

    const newLevel = Math.max(0, currentSkill.level + change);
    console.debug(`새로운 레벨: ${newLevel}`);
    // Assume a max level of 10 for all skills for now, adjust if backend provides this
    const MAX_LEVEL = 10; // This should ideally come from backend or a global config
    console.debug(`최대 레벨: ${MAX_LEVEL}`);
    if (newLevel > MAX_LEVEL) {
      console.debug('새로운 레벨이 최대 레벨 초과, 생활스킬 레벨 업데이트 중단');
      return; 
    }

    try {
      console.debug(`생활스킬 레벨 업데이트 API 호출: ${BASE_URL}/life-skills/server/${selectedServer}/${lifeSkillId}/update - level: ${newLevel}`);
      const response = await fetch(`${BASE_URL}/life-skills/server/${selectedServer}/${lifeSkillId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ level: newLevel })
      });

      if (!response.ok) {
        console.debug(`HTTP 오류 발생: ${response.status}`);
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      fetchLifeSkills(); // 성공 시 생활스킬 새로고침
      console.debug('생활스킬 레벨 업데이트 성공, 생활스킬 새로고침');
    } catch (error: any) {
      console.debug(`생활스킬 레벨 업데이트 중 오류 발생: ${error.message}`);
      console.error('생활스킬 레벨 업데이트 중 오류 발생:', error);
      alert(`생활스킬 레벨 업데이트 실패: ${error.message}`);
    }
    console.debug('updateLifeSkillLevel 함수 종료');
  };

  if (!selectedServer) {
    console.debug('selectedServer 없음, 경고 메시지 표시');
    return (
      <Alert>
        <AlertDescription>서버를 먼저 선택해주세요.</AlertDescription>
      </Alert>
    )
  }

  console.debug('LifeSkillsTab 렌더링');
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle>생활스킬</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">서버: {selectedServer}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lifeSkills.map((skill: LifeSkill) => (
            console.debug(`생활스킬 렌더링: ${skill.life_skill_name}`),
            <Card key={skill.life_skill_id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{skill.life_skill_name}</CardTitle>
                  <Badge>
                    Lv. {skill.level}/10 {/* Assuming max level is 10 for all skills for now */}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Removed experience bar for now as backend only provides level */}
                {/* <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      경험치: {skill.exp}/{skill.maxExp}
                    </span>
                    <span>{Math.round((skill.exp / skill.maxExp) * 100)}%</span>
                  </div>
                  <Progress value={(skill.exp / skill.maxExp) * 100} />
                </div> */}

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    console.debug(`레벨 감소 버튼 클릭 - lifeSkillId: ${skill.life_skill_id}`);
                    updateLifeSkillLevel(skill.life_skill_id, -1);
                  }} disabled={skill.level <= 0}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.debug(`레벨 증가 버튼 클릭 - lifeSkillId: ${skill.life_skill_id}`);
                      updateLifeSkillLevel(skill.life_skill_id, 1);
                    }}
                    disabled={skill.level >= 10} // Assuming max level is 10
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
