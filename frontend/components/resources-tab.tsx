"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Minus } from "lucide-react"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"; // Context 훅 임포트

interface Resource {
  silver_coins: number
  silver_coins_last_recharge_at: string
  demon_tribute: number
  demon_tribute_last_recharge_at: string
  silverCoinMaxCapacity: number
  demonTributeMaxCapacity: number
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

export default function ResourcesTab() {
  console.debug('ResourcesTab: Entering component');
  const { selectedServer, selectedCharacter } = useCharacterSelection(); // Context에서 상태 가져오기
  const [resources, setResources] = useState<Resource | null>(null)
  const [changeAmount, setChangeAmount] = useState<Record<string, number>>({
    "silver-coins": 0,
    "demon-tribute": 0,
  })

  const fetchResources = useCallback(async () => {
    console.debug('fetchResources: Entering function');
    if (!selectedCharacter) {
      console.debug('fetchResources: No character selected, returning');
      return; // 캐릭터가 없으면 조회하지 않음
    }
    try {
      console.debug('fetchResources: Fetching resources for user ID:', USER_ID);
      const response = await fetch(`${BASE_URL}/resources/user/${USER_ID}`);
      if (!response.ok) {
        const errorMsg = `HTTP error! status: ${response.status}`;
        console.error('fetchResources: HTTP error during fetch:', errorMsg);
        throw new Error(errorMsg);
      }
      const data: Resource = await response.json();
      console.debug('fetchResources: Fetched data:', data);
      setResources(data);
    } catch (error: any) {
      console.error('fetchResources: Error loading resource info:', error);
      setResources(null);
    }
    console.debug('fetchResources: Exiting function');
  }, [selectedCharacter]);

  useEffect(() => {
    console.debug('useEffect: selectedServer or selectedCharacter changed');
    if (selectedServer && selectedCharacter) {
      console.debug('useEffect: Server and character selected, fetching resources');
      fetchResources();
    } else {
      console.debug('useEffect: Server or character not selected, resetting resources');
      setResources(null);
    }
    console.debug('useEffect: Exiting effect');
  }, [selectedServer, selectedCharacter, fetchResources]);

  const handleChangeAmount = (resourceId: string, value: string) => {
    console.debug('handleChangeAmount: Entering function with resourceId:', resourceId, 'and value:', value);
    const amount = Number.parseInt(value) || 0
    console.debug('handleChangeAmount: Parsed amount:', amount);
    setChangeAmount({
      ...changeAmount,
      [resourceId]: amount,
    })
    console.debug('handleChangeAmount: Exiting function');
  }

  const updateResource = async (resourceId: "silver-coins" | "demon-tribute", isAdd: boolean) => {
    console.debug('updateResource: Entering function with resourceId:', resourceId, 'isAdd:', isAdd);
    const amount = changeAmount[resourceId] || 0
    console.debug('updateResource: Amount to change:', amount);

    if (amount <= 0) {
      console.debug('updateResource: Amount is 0 or less, returning');
      return
    }

    let payload: { silver_coins_change?: number; demon_tribute_change?: number } = {};
    if (resourceId === "silver-coins") {
      console.debug('updateResource: Resource is silver-coins');
      payload.silver_coins_change = isAdd ? amount : -amount;
    } else if (resourceId === "demon-tribute") {
      console.debug('updateResource: Resource is demon-tribute');
      payload.demon_tribute_change = isAdd ? amount : -amount;
    }
    console.debug('updateResource: Payload created:', payload);

    try {
      console.debug('updateResource: Sending update request to API');
      const response = await fetch(`${BASE_URL}/resources/${USER_ID}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.debug('updateResource: API response received, status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.message || `HTTP error! status: ${response.status}`;
        console.error('updateResource: HTTP error during update:', errorMsg, 'Error data:', errorData);
        throw new Error(errorMsg);
      }
      console.debug('updateResource: Resource update successful, refreshing resources');
      alert('재화 업데이트 성공!');
      fetchResources(); // 성공 시 재화 정보 새로고침

    } catch (error: any) {
      console.error('updateResource: Error updating resource:', error);
      alert(`재화 업데이트 실패: ${error.message}`);
    }

    // Reset input
    console.debug('updateResource: Resetting change amount for resourceId:', resourceId);
    setChangeAmount({
      ...changeAmount,
      [resourceId]: 0,
    })
    console.debug('updateResource: Exiting function');
  }

  const calculateTimeToFull = (resource: Resource, type: "silver-coins" | "demon-tribute") => {
    console.debug('calculateTimeToFull: Entering function with resource and type:', type);
    if (!resource) {
      console.debug('calculateTimeToFull: Resource is null, returning "로딩 중..."');
      return "로딩 중...";
    }

    let current: number;
    let max: number;
    let regenerationTime: number; // in minutes
    let lastRechargeAt: string;

    if (type === "silver-coins") {
      console.debug('calculateTimeToFull: Type is silver-coins');
      current = resource.silver_coins;
      max = resource.silverCoinMaxCapacity;
      regenerationTime = 30; // 30분마다 1개
      lastRechargeAt = resource.silver_coins_last_recharge_at;
    } else {
      console.debug('calculateTimeToFull: Type is demon-tribute');
      current = resource.demon_tribute;
      max = resource.demonTributeMaxCapacity;
      regenerationTime = 12 * 60; // 12시간마다 1개
      lastRechargeAt = resource.demon_tribute_last_recharge_at;
    }
    console.debug('calculateTimeToFull: Current:', current, 'Max:', max, 'Regeneration Time:', regenerationTime, 'Last Recharge At:', lastRechargeAt);


    if (current >= max) {
      console.debug('calculateTimeToFull: Current is at or above max, returning "최대치 도달"');
      return "최대치 도달"
    }

    const now = new Date();
    const lastRechargeDate = new Date(lastRechargeAt);
    const minutesElapsedSinceLastRecharge = (now.getTime() - lastRechargeDate.getTime()) / (1000 * 60);
    console.debug('calculateTimeToFull: Minutes elapsed since last recharge:', minutesElapsedSinceLastRecharge);

    // 이미 충전된 양을 반영하여 현재로부터 남은 시간 계산
    const rechargedSinceLastFetch = Math.floor(minutesElapsedSinceLastRecharge / regenerationTime);
    const effectiveCurrent = Math.min(current + rechargedSinceLastFetch, max);
    console.debug('calculateTimeToFull: Recharged since last fetch:', rechargedSinceLastFetch, 'Effective current:', effectiveCurrent);

    if (effectiveCurrent >= max) {
      console.debug('calculateTimeToFull: Effective current is at or above max, returning "최대치 도달"');
      return "최대치 도달";
    }

    const remaining = max - effectiveCurrent;
    const minutesNeeded = remaining * regenerationTime;
    console.debug('calculateTimeToFull: Remaining:', remaining, 'Minutes needed:', minutesNeeded);

    // 다음 충전까지 남은 시간 계산
    const minutesIntoCurrentCycle = minutesElapsedSinceLastRecharge % regenerationTime;
    const timeLeftForNextUnit = regenerationTime - minutesIntoCurrentCycle;
    console.debug('calculateTimeToFull: Minutes into current cycle:', minutesIntoCurrentCycle, 'Time left for next unit:', timeLeftForNextUnit);

    const totalMinutesNeeded = minutesNeeded + timeLeftForNextUnit;
    console.debug('calculateTimeToFull: Total minutes needed:', totalMinutesNeeded);

    let result;
    if (totalMinutesNeeded < 60) {
      result = `${Math.ceil(totalMinutesNeeded)}분`;
    } else if (totalMinutesNeeded < 1440) {
      const hours = Math.floor(totalMinutesNeeded / 60)
      const minutes = Math.ceil(totalMinutesNeeded % 60)
      result = `${hours}시간 ${minutes}분`;
    } else {
      const days = Math.floor(totalMinutesNeeded / 1440)
      const hours = Math.ceil((totalMinutesNeeded % 1440) / 60)
      result = `${days}일 ${hours}시간`;
    }
    console.debug('calculateTimeToFull: Calculated time to full:', result);
    console.debug('calculateTimeToFull: Exiting function');
    return result;
  }

  if (!selectedServer || !selectedCharacter) {
    console.debug('ResourcesTab: Server or character not selected, displaying alert');
    return (
      <Alert>
        <AlertDescription>서버와 캐릭터를 먼저 선택해주세요.</AlertDescription>
      </Alert>
    )
  }

  if (!resources) {
    console.debug('ResourcesTab: Resources not loaded, displaying loading alert');
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
  console.debug('ResourcesTab: Resource data prepared for rendering:', resourceData);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle>재화 정보</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">서버: {selectedServer}</Badge>
            <Badge variant="outline">캐릭터: {selectedCharacter.name}</Badge>
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
