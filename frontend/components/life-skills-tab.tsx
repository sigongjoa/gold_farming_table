"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronUp, ChevronDown } from "lucide-react"

interface LifeSkillsTabProps {
  server: string
  character: string
}

interface LifeSkill {
  life_skill_id: number;
  life_skill_name: string;
  icon_url: string | null;
  level: number;
}

const BASE_URL = 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

export default function LifeSkillsTab({ server, character }: LifeSkillsTabProps) {
  const [lifeSkills, setLifeSkills] = useState<LifeSkill[]>([])
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

  const fetchLifeSkills = useCallback(async () => {
    if (!characterId) {
      setLifeSkills([]);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/life-skills/character/${characterId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: LifeSkill[] = await response.json();
      setLifeSkills(data);
    } catch (error) {
      console.error('생활스킬 로드 중 오류 발생:', error);
      setLifeSkills([]);
    }
  }, [characterId]);

  useEffect(() => {
    fetchCharacterId();
  }, [fetchCharacterId]);

  useEffect(() => {
    if (characterId) {
      fetchLifeSkills();
    } else {
      setLifeSkills([]);
    }
  }, [characterId, fetchLifeSkills]);

  const updateLifeSkillLevel = async (lifeSkillId: number, change: number) => {
    if (!characterId) return;
    const currentSkill = lifeSkills.find(skill => skill.life_skill_id === lifeSkillId);
    if (!currentSkill) return;

    const newLevel = Math.max(0, currentSkill.level + change);
    // Assume a max level of 10 for all skills for now, adjust if backend provides this
    const MAX_LEVEL = 10; // This should ideally come from backend or a global config
    if (newLevel > MAX_LEVEL) return; 

    try {
      const response = await fetch(`${BASE_URL}/life-skills/character/${characterId}/skill/${lifeSkillId}/update-level`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ level: newLevel })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      fetchLifeSkills(); // 성공 시 생활스킬 새로고침
    } catch (error: any) {
      console.error('생활스킬 레벨 업데이트 중 오류 발생:', error);
      alert(`생활스킬 레벨 업데이트 실패: ${error.message}`);
    }
  };

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
          <CardTitle>생활스킬</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">서버: {server}</Badge>
            <Badge variant="outline">캐릭터: {character}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lifeSkills.map((skill) => (
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
                  <Button variant="outline" size="sm" onClick={() => updateLifeSkillLevel(skill.life_skill_id, -1)} disabled={skill.level <= 0}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateLifeSkillLevel(skill.life_skill_id, 1)}
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
