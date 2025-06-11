"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InventoryTabProps {
  server: string
  character: string
}

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

const BASE_URL = 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

export default function InventoryTab({ server, character }: InventoryTabProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [craftableItems, setCraftableItems] = useState<CraftableItem[]>([])

  const fetchInventory = useCallback(async () => {
    if (!character) return; // 캐릭터가 없으면 조회하지 않음
    try {
      const response = await fetch(`${BASE_URL}/items/user-inventory/${USER_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: InventoryItem[] = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('인벤토리 로드 중 오류 발생:', error);
    }
  }, [character]);

  const fetchCraftableItems = useCallback(async () => {
    if (!character) return; // 캐릭터가 없으면 조회하지 않음
    try {
      const response = await fetch(`${BASE_URL}/crafting/${USER_ID}/craftable`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CraftableItem[] = await response.json();
      setCraftableItems(data);
    } catch (error) {
      console.error('제작 가능한 아이템 로드 중 오류 발생:', error);
    }
  }, [character]);

  useEffect(() => {
    if (server && character) {
      fetchInventory();
      fetchCraftableItems();
    } else {
      setInventory([]);
      setCraftableItems([]);
    }
  }, [server, character, fetchInventory, fetchCraftableItems]);

  const updateItemQuantity = async (itemId: number, change: number) => {
    const currentItem = inventory.find(item => item.item_id === itemId);
    const newQuantity = Math.max(0, (currentItem?.quantity || 0) + change);

    try {
      const response = await fetch(`${BASE_URL}/items/user-inventory/${USER_ID}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item_id: itemId, quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchInventory(); // 성공 시 인벤토리 새로고침
    } catch (error) {
      console.error('아이템 수량 업데이트 중 오류 발생:', error);
      alert('아이템 수량 업데이트에 실패했습니다.');
    }
  };

  const refreshCraftableItems = () => {
    fetchCraftableItems();
  };

  const craftItem = async (recipeId: number) => {
    try {
      const response = await fetch(`${BASE_URL}/crafting/${USER_ID}/craft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipe_id: recipeId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      alert('아이템 제작 성공!');
      fetchInventory(); // 인벤토리 새로고침
      fetchCraftableItems(); // 제작 가능 아이템 새로고침

    } catch (error: any) {
      console.error('아이템 제작 중 오류 발생:', error);
      alert(`아이템 제작 실패: ${error.message}`);
    }
  };

  if (!server || !character) {
    return (
      <Alert>
        <AlertDescription>서버와 캐릭터를 먼저 선택해주세요.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle>내 아이템 관리</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">서버: {server}</Badge>
            <Badge variant="outline">캐릭터: {character}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>아이템</TableHead>
                  <TableHead>수량</TableHead>
                  <TableHead>변경</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.item_id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.item_id, -1)}
                          disabled={item.quantity <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => updateItemQuantity(item.item_id, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4">
            <Button onClick={refreshCraftableItems}>
              <RefreshCw className="h-4 w-4 mr-2" />
              제작 가능 아이템 보기
            </Button>

            {craftableItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">제작 가능 아이템</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {craftableItems.map((recipe) => (
                    <Card key={recipe.recipe_id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{recipe.output_item_name} (제작 가능: {recipe.craftable_quantity})</h4>
                          <div className="text-sm text-muted-foreground">
                            재료:{" "}
                            {recipe.materials
                              .map((ing) => {
                                const inventoryItem = inventory.find((i) => i.item_id === ing.item_id)
                                return `${ing.name} ${ing.quantity}개 (보유: ${inventoryItem?.quantity || 0})`
                              })
                              .join(", ")}
                          </div>
                        </div>
                        <Button size="sm" onClick={() => craftItem(recipe.recipe_id)} disabled={recipe.craftable_quantity === 0}>
                          제작
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
