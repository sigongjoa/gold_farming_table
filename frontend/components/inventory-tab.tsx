"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"; // Context 훅 임포트
import React from 'react';
import axios, { AxiosResponse } from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input'; // Input 컴포넌트 추가

const logger = console; // 임시로 console을 logger로 사용. 실제 로깅 라이브러리 (예: winston)로 교체 필요

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

interface InventoryItem {
  item_id: number
  name: string
  quantity: number
}

interface CraftableItem {
  recipe_id: number
  recipe_name: string
  output_item_id: number
  output_item_name: string
  craftable_quantity: number
  required_facility: string | null
  success_rate: number | null
  materials: Array<{ item_id: number; name: string; quantity: number; current_quantity_in_inventory: number }>
}

interface ItemTabProps {
  userInventory: any[];
  updateItemQuantity: (itemId: number, change: number) => Promise<void>;
  fetchInventory: () => Promise<void>;
}

const ConsumablesTab = ({ userInventory, updateItemQuantity }: ItemTabProps) => {
  const [consumables, setConsumables] = useState<any[]>([]);
  useEffect(() => {
    logger.debug('ConsumablesTab 마운트');
    axios.get(`${BASE_URL}/items/consumables`).then((res: AxiosResponse<any[]>) => {
      logger.debug('소비 아이템 목록:', res.data);
      setConsumables(res.data);
    });
  }, []);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">소비물약</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">이름</TableHead>
            <TableHead className="w-[200px]">효과/용도</TableHead>
            <TableHead className="w-[150px]">보유 개수</TableHead>
            <TableHead className="w-[250px]">제작 재료</TableHead>
            <TableHead className="w-[150px]">제작 시설(레벨)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consumables.map((item: any) => {
            const inv = userInventory.find((i: any) => i.item_id === item.id);
            const currentQuantity = inv ? inv.quantity : 0;
            const [effect, ingredients, facility] = (item.usage_details || '').split(' | ');
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{effect ? effect.replace('효과: ', '') : ''}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateItemQuantity(item.id, -1)}
                      disabled={currentQuantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={currentQuantity}
                      className="w-20 text-center"
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        if (!isNaN(newQuantity)) {
                          // Note: Direct quantity setting here. For increment/decrement, use button.
                          // This is a simplified approach, a full implementation would
                          // calculate the difference and call updateItemQuantity with it.
                          // For now, we assume user uses buttons or directly inputs a valid number.
                          updateItemQuantity(item.id, newQuantity - currentQuantity);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateItemQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{ingredients ? ingredients.replace('재료: ', '') : ''}</TableCell>
                <TableCell>{facility ? facility.replace('시설: ', '') : ''}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const EmblemsTab = ({ userInventory, updateItemQuantity }: ItemTabProps) => {
  const [emblems, setEmblems] = useState<any[]>([]);
  useEffect(() => {
    logger.debug('EmblemsTab 마운트');
    axios.get(`${BASE_URL}/items/emblems`).then((res: AxiosResponse<any[]>) => {
      logger.debug('엠블럼/룬 목록:', res.data);
      setEmblems(res.data);
    });
  }, []);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">엠블럼/룬</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">이름</TableHead>
            <TableHead>티어</TableHead>
            <TableHead>주요 효과</TableHead>
            <TableHead>보유 개수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emblems.map((item: any) => {
            const inv = userInventory.find((i: any) => i.item_id === item.id);
            const currentQuantity = inv ? inv.quantity : 0;
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.usage_details || ''}</TableCell>
                <TableCell>{item.description || ''}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateItemQuantity(item.id, -1)}
                      disabled={currentQuantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={currentQuantity}
                      className="w-20 text-center"
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        if (!isNaN(newQuantity)) {
                          updateItemQuantity(item.id, newQuantity - currentQuantity);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateItemQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const GemsTab = ({ userInventory, updateItemQuantity }: ItemTabProps) => {
  const [gems, setGems] = useState<any[]>([]);
  useEffect(() => {
    logger.debug('GemsTab 마운트');
    axios.get(`${BASE_URL}/items/gems`).then((res: AxiosResponse<any[]>) => {
      logger.debug('보석 목록:', res.data);
      setGems(res.data);
    });
  }, []);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">보석</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">이름</TableHead>
            <TableHead>등급</TableHead>
            <TableHead>태그수</TableHead>
            <TableHead>주요 태그</TableHead>
            <TableHead>보유 개수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gems.map((item: any) => {
            const inv = userInventory.find((i: any) => i.item_id === item.id);
            const currentQuantity = inv ? inv.quantity : 0;
            const [grade, tagCount, tagExample] = (item.usage_details || '').split(' | ');
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{grade ? grade.replace('등급: ', '') : ''}</TableCell>
                <TableCell>{tagCount ? tagCount.replace('태그수: ', '') : ''}</TableCell>
                <TableCell>{tagExample ? tagExample.replace('주요 태그 예시: ', '') : ''}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateItemQuantity(item.id, -1)}
                      disabled={currentQuantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={currentQuantity}
                      className="w-20 text-center"
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        if (!isNaN(newQuantity)) {
                          updateItemQuantity(item.id, newQuantity - currentQuantity);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateItemQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const CurrenciesTab = ({ userInventory, updateItemQuantity }: ItemTabProps) => {
  const [currencies, setCurrencies] = useState<any[]>([]);
  useEffect(() => {
    logger.debug('CurrenciesTab 마운트');
    axios.get(`${BASE_URL}/items/currencies`).then((res: AxiosResponse<any[]>) => {
      logger.debug('재화 목록:', res.data);
      setCurrencies(res.data);
    });
  }, []);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">재화</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">이름</TableHead>
            <TableHead>주요 사용처</TableHead>
            <TableHead>주요 획득 방법</TableHead>
            <TableHead>보유 개수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencies.map((item: any) => {
            const inv = userInventory.find((i: any) => i.item_id === item.id);
            const currentQuantity = inv ? inv.quantity : 0;
            const [usage, acquire] = (item.usage_details || '').split(' | ');
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{usage ? usage.replace('사용처: ', '') : ''}</TableCell>
                <TableCell>{acquire ? acquire.replace('획득: ', '') : ''}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateItemQuantity(item.id, -1)}
                      disabled={currentQuantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={currentQuantity}
                      className="w-20 text-center"
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        if (!isNaN(newQuantity)) {
                          updateItemQuantity(item.id, newQuantity - currentQuantity);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateItemQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const AllItemsTab = ({ userInventory, updateItemQuantity, fetchInventory }: ItemTabProps) => {
  logger.debug('AllItemsTab: Entering component');
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">전체 아이템</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">이름</TableHead>
            <TableHead>설명</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>보유 개수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userInventory.map(item => (
            <TableRow key={item.item_id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Badge variant="secondary">{item.category}</Badge>
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const CraftableItemsTab = () => {
  console.debug('CraftableItemsTab: Entering component');
  return (
    <div className="flex flex-col items-center justify-center h-48">
      <p className="text-muted-foreground">제작 가능한 아이템이 없습니다.</p>
    </div>
  );
};

const InventoryTab = () => {
  console.debug('InventoryTab: Entering component');
  const { selectedCharacter } = useCharacterSelection(); // Context 훅 임포트
  const { toast } = useToast();
  const [tab, setTab] = useState('all');
  console.debug('InventoryTab: tab state initialized to', tab);
  const [userInventory, setUserInventory] = useState<any[]>([])
  console.debug('InventoryTab: userInventory state initialized to', userInventory);

  const fetchInventory = useCallback(async () => {
    console.debug('fetchInventory: Entering function');
    if (!selectedCharacter) {
      console.debug('fetchInventory: No character selected, returning');
      setUserInventory([]);
      return; // 캐릭터가 없으면 조회하지 않음
    }
    try {
      console.debug(`fetchInventory: Fetching inventory for character ID: ${selectedCharacter.id}`);
      const response = await axios.get(`${BASE_URL}/items/inventory/${selectedCharacter.id}`);
      logger.debug('fetchInventory: 인벤토리 목록:', response.data);
      setUserInventory(response.data);
    } catch (error: any) {
      console.error('fetchInventory: 인벤토리 로딩 실패:', error);
      toast({
        title: "인벤토리 로딩 실패",
        description: error.response?.data?.message || "서버 오류",
        variant: "destructive",
      });
      setUserInventory([]);
    }
    console.debug('fetchInventory: Exiting function');
  }, [selectedCharacter, toast]);

  useEffect(() => {
    console.debug('useEffect: selectedCharacter changed, fetching inventory');
    fetchInventory();
    console.debug('useEffect: Exiting effect (inventory fetch logic)');
  }, [selectedCharacter, fetchInventory]);

  const updateItemQuantity = useCallback(async (itemId: number, change: number) => {
    console.debug(`updateItemQuantity: Updating item ${itemId} by ${change}`);
    if (!selectedCharacter) {
      console.debug('updateItemQuantity: No character selected, returning');
      toast({
        title: "캐릭터 선택 필요",
        description: "아이템 수량을 변경하려면 먼저 캐릭터를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    try {
      console.debug(`updateItemQuantity: Sending update request to ${BASE_URL}/items/inventory/${selectedCharacter.id}/update-quantity`);
      const response = await axios.post(`${BASE_URL}/items/inventory/${selectedCharacter.id}/update-quantity`, {
        itemId,
        change,
      });
      logger.debug('updateItemQuantity: 아이템 수량 업데이트 응답:', response.data);
      fetchInventory(); // 인벤토리 새로고침
      toast({
        title: "아이템 수량 업데이트 성공",
        description: `${response.data.itemName} 수량이 ${change > 0 ? '증가' : '감소'}했습니다.`, 
      });
    } catch (error: any) {
      console.error('updateItemQuantity: 아이템 수량 업데이트 실패:', error);
      toast({
        title: "아이템 수량 업데이트 실패",
        description: error.response?.data?.message || "서버 오류",
        variant: "destructive",
      });
    }
    console.debug('updateItemQuantity: Exiting function');
  }, [selectedCharacter, fetchInventory, toast]);

  const craftItem = async (recipeId: number) => {
    console.debug(`craftItem: Crafting item with recipeId: ${recipeId}`);
    if (!selectedCharacter) {
      console.debug('craftItem: No character selected, returning');
      toast({
        title: "캐릭터 선택 필요",
        description: "아이템을 제작하려면 먼저 캐릭터를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    try {
      console.debug(`craftItem: Sending craft request to ${BASE_URL}/crafting/characters/${selectedCharacter.id}/craft`);
      const response = await axios.post(`${BASE_URL}/crafting/characters/${selectedCharacter.id}/craft`, {
        recipeId,
      });
      logger.debug('craftItem: 제작 응답:', response.data);
      toast({
        title: "아이템 제작 성공",
        description: `${response.data.outputItemName} ${response.data.quantity}개 제작 완료!`, 
      });
      fetchInventory(); // 인벤토리 새로고침
    } catch (error: any) {
      console.error('craftItem: 아이템 제작 실패:', error);
      toast({
        title: "아이템 제작 실패",
        description: error.response?.data?.message || "서버 오류",
        variant: "destructive",
      });
    }
    console.debug('craftItem: Exiting function');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>내 아이템</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Button onClick={() => setTab('all')} variant={tab === 'all' ? 'default' : 'outline'}>
            전체
          </Button>
          <Button onClick={() => setTab('consumables')} variant={tab === 'consumables' ? 'default' : 'outline'}>
            소비물약
          </Button>
          <Button onClick={() => setTab('emblems')} variant={tab === 'emblems' ? 'default' : 'outline'}>
            엠블럼/룬
          </Button>
          <Button onClick={() => setTab('gems')} variant={tab === 'gems' ? 'default' : 'outline'}>
            보석
          </Button>
          <Button onClick={() => setTab('currencies')} variant={tab === 'currencies' ? 'default' : 'outline'}>
            재화
          </Button>
          <Button onClick={() => setTab('craftable-items')} variant={tab === 'craftable-items' ? 'default' : 'outline'}>
            제작 가능한 아이템
          </Button>
        </div>

        {tab === 'all' && (
          <AllItemsTab userInventory={userInventory} updateItemQuantity={updateItemQuantity} fetchInventory={fetchInventory} />
        )}
        {tab === 'consumables' && (
          <ConsumablesTab userInventory={userInventory} updateItemQuantity={updateItemQuantity} fetchInventory={fetchInventory} />
        )}
        {tab === 'emblems' && (
          <EmblemsTab userInventory={userInventory} updateItemQuantity={updateItemQuantity} fetchInventory={fetchInventory} />
        )}
        {tab === 'gems' && (
          <GemsTab userInventory={userInventory} updateItemQuantity={updateItemQuantity} fetchInventory={fetchInventory} />
        )}
        {tab === 'currencies' && (
          <CurrenciesTab userInventory={userInventory} updateItemQuantity={updateItemQuantity} fetchInventory={fetchInventory} />
        )}
        {tab === 'craftable-items' && (
          <CraftableItemsTab />
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryTab;