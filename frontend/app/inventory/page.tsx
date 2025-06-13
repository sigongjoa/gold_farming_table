"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InventoryTab from "@/components/inventory-tab"
import CollectionItemsTab from "@/components/collection-items-tab"
import ResourcesTab from "@/components/resources-tab"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"; // Context 훅 임포트

export default function InventoryPage() {
  console.debug('InventoryPage 함수 진입');
  const { selectedServer, selectedCharacter } = useCharacterSelection(); // Context에서 상태 가져오기
  console.debug(`selectedServer: ${selectedServer}, selectedCharacter: ${JSON.stringify(selectedCharacter)}`);
  const [selectedTab, setSelectedTab] = useState<string>("my-items"); // 기본 탭 설정
  console.debug(`selectedTab 초기값: ${selectedTab}`);

  if (!selectedCharacter) {
    console.debug('selectedCharacter 없음, 캐릭터 선택 요청 메시지 표시');
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xl text-gray-500">캐릭터를 선택해주세요.</p>
      </div>
    );
  }

  console.debug('InventoryPage 렌더링');
  return (
    <Tabs value={selectedTab} onValueChange={(value) => {
      console.debug(`탭 변경: ${value}`);
      setSelectedTab(value);
    }} className="w-full">
      <TabsList className="grid grid-cols-3 w-full mb-6">
        <TabsTrigger value="my-items" onClick={() => console.debug('내 아이템 탭 클릭')}>내 아이템</TabsTrigger>
        <TabsTrigger value="collection-items" onClick={() => console.debug('채집 아이템 탭 클릭')}>채집 아이템</TabsTrigger>
        <TabsTrigger value="resources" onClick={() => console.debug('재화 정보 탭 클릭')}>재화 정보</TabsTrigger>
      </TabsList>

      <TabsContent value="my-items">
        <InventoryTab />
      </TabsContent>

      <TabsContent value="collection-items">
        <CollectionItemsTab />
      </TabsContent>

      <TabsContent value="resources">
        <ResourcesTab />
      </TabsContent>
    </Tabs>
  );
} 
console.debug('InventoryPage 렌더링 종료'); 