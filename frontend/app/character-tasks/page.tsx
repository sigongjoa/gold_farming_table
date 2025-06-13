'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CharacterTasksTab from '@/components/character-tasks-tab';

export default function CharacterTasksPage() {
  console.debug('CharacterTasksPage: Entering component');
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">캐릭터 작업</h1>
      <Tabs defaultValue="tasks">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-1">
          <TabsTrigger value="tasks">작업 목록</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <CharacterTasksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
} 