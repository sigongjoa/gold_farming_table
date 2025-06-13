"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LifeSkillsTab from "@/components/life-skills-tab"
import CraftingFacilitiesTab from "@/components/crafting-facilities-tab"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"

export default function CraftingPage() {
  console.debug('CraftingPage 컴포넌트 렌더링 시작');
  const { selectedServer, selectedCharacter } = useCharacterSelection();
  console.debug(`현재 선택된 서버: ${selectedServer}, 캐릭터: ${selectedCharacter || '없음'}`);
  const [selectedTab, setSelectedTab] = useState<string>("life-skills");
  console.debug(`현재 선택된 탭: ${selectedTab}`);

  // setSelectedTab이 호출될 때마다 로깅
  const handleTabChange = (value: string) => {
    console.debug(`탭 변경 요청: ${value}`);
    setSelectedTab(value);
  };

  console.debug('CraftingPage 컴포넌트 JSX 반환');
  return (
    <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-2 w-full mb-6">
        <TabsTrigger value="life-skills">생활 스킬</TabsTrigger>
        <TabsTrigger value="crafting-facilities">크래프팅 시설</TabsTrigger>
      </TabsList>

      <TabsContent value="life-skills">
        <LifeSkillsTab />
      </TabsContent>

      <TabsContent value="crafting-facilities">
        <CraftingFacilitiesTab />
      </TabsContent>
    </Tabs>
  );
} 