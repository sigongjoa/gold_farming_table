"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Minus } from "lucide-react"

interface ResourcesTabProps {
  server: string
  character: string
}

interface Resource {
  silver_coins: number
  silver_coins_last_recharge_at: string
  demon_tribute: number
  demon_tribute_last_recharge_at: string
  silverCoinMaxCapacity: number
  demonTributeMaxCapacity: number
}

const BASE_URL = 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

export default function ResourcesTab({ server, character }: ResourcesTabProps) {
  const [resources, setResources] = useState<Resource | null>(null)
  const [changeAmount, setChangeAmount] = useState<Record<string, number>>({
    "silver-coins": 0,
    "demon-tribute": 0,
  })

  const fetchResources = useCallback(async () => {
    if (!character) return; // 캐릭터가 없으면 조회하지 않음
    try {
      const response = await fetch(`${BASE_URL}/resources/user/${USER_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Resource = await response.json();
      setResources(data);
    } catch (error) {
      console.error('재화 정보 로드 중 오류 발생:', error);
      setResources(null);
    }
  }, [character]);

  useEffect(() => {
    if (server && character) {
      fetchResources();
    } else {
      setResources(null);
    }
  }, [server, character, fetchResources]);

  const handleChangeAmount = (resourceId: string, value: string) => {
    const amount = Number.parseInt(value) || 0
    setChangeAmount({
      ...changeAmount,
      [resourceId]: amount,
    })
  }

  const updateResource = async (resourceId: "silver-coins" | "demon-tribute", isAdd: boolean) => {
    const amount = changeAmount[resourceId] || 0

    if (amount <= 0) return

    let payload: { silver_coins_change?: number; demon_tribute_change?: number } = {};
    if (resourceId === "silver-coins") {
      payload.silver_coins_change = isAdd ? amount : -amount;
    } else if (resourceId === "demon-tribute") {
      payload.demon_tribute_change = isAdd ? amount : -amount;
    }

    try {
      const response = await fetch(`${BASE_URL}/resources/user/${USER_ID}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      alert('재화 업데이트 성공!');
      fetchResources(); // 성공 시 재화 정보 새로고침

    } catch (error: any) {
      console.error('재화 업데이트 중 오류 발생:', error);
      alert(`재화 업데이트 실패: ${error.message}`);
    }

    // Reset input
    setChangeAmount({
      ...changeAmount,
      [resourceId]: 0,
    })
  }

  const calculateTimeToFull = (resource: Resource, type: "silver-coins" | "demon-tribute") => {
    if (!resource) return "로딩 중...";

    let current: number;
    let max: number;
    let regenerationTime: number; // in minutes
    let lastRechargeAt: string;

    if (type === "silver-coins") {
      current = resource.silver_coins;
      max = resource.silverCoinMaxCapacity;
      regenerationTime = 30; // 30분마다 1개
      lastRechargeAt = resource.silver_coins_last_recharge_at;
    } else {
      current = resource.demon_tribute;
      max = resource.demonTributeMaxCapacity;
      regenerationTime = 12 * 60; // 12시간마다 1개
      lastRechargeAt = resource.demon_tribute_last_recharge_at;
    }

    if (current >= max) {
      return "최대치 도달"
    }

    const now = new Date();
    const lastRechargeDate = new Date(lastRechargeAt);
    const minutesElapsedSinceLastRecharge = (now.getTime() - lastRechargeDate.getTime()) / (1000 * 60);

    // 이미 충전된 양을 반영하여 현재로부터 남은 시간 계산
    const rechargedSinceLastFetch = Math.floor(minutesElapsedSinceLastRecharge / regenerationTime);
    const effectiveCurrent = Math.min(current + rechargedSinceLastFetch, max);

    if (effectiveCurrent >= max) {
      return "최대치 도달";
    }

    const remaining = max - effectiveCurrent;
    const minutesNeeded = remaining * regenerationTime;

    // 다음 충전까지 남은 시간 계산
    const minutesIntoCurrentCycle = minutesElapsedSinceLastRecharge % regenerationTime;
    const timeLeftForNextUnit = regenerationTime - minutesIntoCurrentCycle;

    const totalMinutesNeeded = minutesNeeded + timeLeftForNextUnit;

    if (totalMinutesNeeded < 60) {
      return `${Math.ceil(totalMinutesNeeded)}분`
    } else if (totalMinutesNeeded < 1440) {
      const hours = Math.floor(totalMinutesNeeded / 60)
      const minutes = Math.ceil(totalMinutesNeeded % 60)
      return `${hours}시간 ${minutes}분`
    } else {
      const days = Math.floor(totalMinutesNeeded / 1440)
      const hours = Math.ceil((totalMinutesNeeded % 1440) / 60)
      return `${days}일 ${hours}시간`
    }
  }

  if (!server || !character) {
    return (
      <Alert>
        <AlertDescription>서버와 캐릭터를 먼저 선택해주세요.</AlertDescription>
      </Alert>
    )
  }

  if (!resources) {
    return (
      <Alert>
        <AlertDescription>재화 정보를 불러오는 중...</AlertDescription>
      </Alert>
    )
  }

  const resourceData = [
    {
      id: "silver-coins",
      name: "은동전",
      current: resources.silver_coins,
      max: resources.silverCoinMaxCapacity,
      lastUpdated: resources.silver_coins_last_recharge_at,
      timeToFull: calculateTimeToFull(resources, "silver-coins"),
    },
    {
      id: "demon-tribute",
      name: "마족 공물",
      current: resources.demon_tribute,
      max: resources.demonTributeMaxCapacity,
      lastUpdated: resources.demon_tribute_last_recharge_at,
      timeToFull: calculateTimeToFull(resources, "demon-tribute"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle>재화 정보</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">서버: {server}</Badge>
            <Badge variant="outline">캐릭터: {character}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {resourceData.map((resource) => (
            <Card key={resource.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{resource.name}</CardTitle>
                <CardDescription>최대 수량까지 남은 시간: {resource.timeToFull}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>현재 수량: {resource.current}</span>
                    <span>최대: {resource.max}</span>
                  </div>
                  <Progress value={(resource.current / resource.max) * 100} />
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    value={changeAmount[resource.id] || ""}
                    onChange={(e) => handleChangeAmount(resource.id, e.target.value)}
                    placeholder="변경 수량"
                    className="w-24"
                  />
                  <Button
                    variant="outline"
                    onClick={() => updateResource(resource.id as "silver-coins" | "demon-tribute", true)}
                    disabled={!changeAmount[resource.id] || resource.current >= resource.max}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    추가
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateResource(resource.id as "silver-coins" | "demon-tribute", false)}
                    disabled={!changeAmount[resource.id] || resource.current <= 0}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    사용
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
