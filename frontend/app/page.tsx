"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ServerCharacterTab from "@/components/server-character-tab"
import InventoryTab from "@/components/inventory-tab"
import CollectionItemsTab from "@/components/collection-items-tab"
import ResourcesTab from "@/components/resources-tab"
import QuestsTab from "@/components/quests-tab"
import CharacterTasksTab from "@/components/character-tasks-tab"
import LifeSkillsTab from "@/components/life-skills-tab"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  const [selectedServer, setSelectedServer] = useState<string>("")
  const [selectedCharacter, setSelectedCharacter] = useState<string>("")

  const handleServerCharacterSelect = (server: string, character: string) => {
    setSelectedServer(server)
    setSelectedCharacter(character)
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="mabinogi-theme">
      <div className="min-h-screen bg-background p-4 md:p-6">
        <Card className="max-w-6xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl md:text-3xl font-bold">마비노기 제작 계산기</CardTitle>
            <ModeToggle />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="server-char" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full mb-6">
                <TabsTrigger value="server-char">서버 및 캐릭터</TabsTrigger>
                <TabsTrigger value="inventory">내 아이템</TabsTrigger>
                <TabsTrigger value="collection-items">채집 아이템</TabsTrigger>
                <TabsTrigger value="resources">재화 정보</TabsTrigger>
                <TabsTrigger value="quests">일일/주간 숙제</TabsTrigger>
                <TabsTrigger value="character-tasks">캐릭터 작업</TabsTrigger>
                <TabsTrigger value="life-skills">생활스킬</TabsTrigger>
              </TabsList>

              <TabsContent value="server-char">
                <ServerCharacterTab onSelect={handleServerCharacterSelect} />
              </TabsContent>

              <TabsContent value="inventory">
                <InventoryTab server={selectedServer} character={selectedCharacter} />
              </TabsContent>

              <TabsContent value="collection-items">
                <CollectionItemsTab />
              </TabsContent>

              <TabsContent value="resources">
                <ResourcesTab server={selectedServer} character={selectedCharacter} />
              </TabsContent>

              <TabsContent value="quests">
                <QuestsTab server={selectedServer} character={selectedCharacter} />
              </TabsContent>

              <TabsContent value="character-tasks">
                <CharacterTasksTab server={selectedServer} character={selectedCharacter} />
              </TabsContent>

              <TabsContent value="life-skills">
                <LifeSkillsTab server={selectedServer} character={selectedCharacter} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  )
}
