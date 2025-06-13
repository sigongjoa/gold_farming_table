"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DailyQuestsTab from "@/components/daily-quests-tab"
import WeeklyQuestsTab from "@/components/weekly-quests-tab"
import PartTimeJobsTab from "@/components/part-time-jobs-tab"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"

export default function QuestsPage() {
  console.debug('QuestsPage 함수 진입');
  const { selectedCharacter } = useCharacterSelection();
  console.debug(`selectedCharacter: ${JSON.stringify(selectedCharacter)}`);
  const [activeTab, setActiveTab] = useState('daily');
  console.debug(`activeTab 초기값: ${activeTab}`);

  if (!selectedCharacter) {
    console.debug('selectedCharacter 없음, 캐릭터 선택 요청 메시지 표시');
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xl text-gray-500">캐릭터를 선택해주세요.</p>
      </div>
    );
  }

  console.debug('QuestsPage 렌더링');
  return (
    <Tabs value={activeTab} onValueChange={(value) => {
      console.debug(`퀘스트 탭 변경: ${value}`);
      setActiveTab(value);
    }} className="w-full">
      <TabsList className="grid grid-cols-3 w-full mb-6">
        <TabsTrigger value="daily" onClick={() => console.debug('일일 퀘스트 탭 클릭')}>일일 퀘스트</TabsTrigger>
        <TabsTrigger value="weekly" onClick={() => console.debug('주간 퀘스트 탭 클릭')}>주간 퀘스트</TabsTrigger>
        <TabsTrigger value="part-time" onClick={() => console.debug('아르바이트 탭 클릭')}>아르바이트</TabsTrigger>
      </TabsList>

      <TabsContent value="daily">
        <DailyQuestsTab />
      </TabsContent>

      <TabsContent value="weekly">
        <WeeklyQuestsTab />
      </TabsContent>

      <TabsContent value="part-time">
        <PartTimeJobsTab />
      </TabsContent>
    </Tabs>
  );
} 
console.debug('QuestsPage 렌더링 종료'); 