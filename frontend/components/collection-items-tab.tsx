"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface CollectionItemsTabProps {
  server: string
  character: string
}

interface CollectionItem {
  item_id: number;
  name: string;
  description: string | null;
  category: string;
  collection_target: string | null;
  required_level: number | null;
  usage_details: string | null;
  quantity: number; // User's current quantity
}

const BASE_URL = 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

export default function CollectionItemsTab({ server, character }: CollectionItemsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
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

  const fetchCollectionItems = useCallback(async () => {
    if (!characterId) {
      setCollectionItems([]);
      return;
    }
    try {
      // This API returns all items categorized as collection items, along with user's quantity
      const response = await fetch(`${BASE_URL}/items/user-inventory/${USER_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allItems: CollectionItem[] = await response.json();
      // Filter only collection-related items as per the original backend query in itemController.js
      const filteredCollectionItems = allItems.filter(item => 
        ['나무 베기', '광석 캐기', '약초 채집', '양털 깎기', '호미질', '곤충 채집', '낚시 채집', '일상 채집', '곡물 추수'].includes(item.category)
      );
      setCollectionItems(filteredCollectionItems);
    } catch (error) {
      console.error('채집 아이템 로드 중 오류 발생:', error);
      setCollectionItems([]);
    }
  }, [characterId]);

  useEffect(() => {
    fetchCharacterId();
  }, [fetchCharacterId]);

  useEffect(() => {
    if (characterId) {
      fetchCollectionItems();
    } else {
      setCollectionItems([]);
    }
  }, [characterId, fetchCollectionItems]);

  const filteredItems = collectionItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.collection_target && item.collection_target.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.usage_details && item.usage_details.toLowerCase().includes(searchTerm.toLowerCase())),
  );

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
          <CardTitle>마비노기 채집 아이템 정보</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">서버: {server}</Badge>
            <Badge variant="outline">캐릭터: {character}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="아이템명, 채집 방식 등으로 검색..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>아이템명</TableHead>
                  <TableHead>채집 방식</TableHead>
                  <TableHead>채집 대상</TableHead>
                  <TableHead>필요 레벨</TableHead>
                  <TableHead>활용 예시</TableHead>
                  <TableHead>보유 수량</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.item_id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.collection_target}</TableCell>
                    <TableCell>{item.required_level}</TableCell>
                    <TableCell>{item.usage_details}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
