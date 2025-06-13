"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"; // Context 훅 임포트

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

const BASE_URL = 'http://localhost:3001'; // 환경 변수 대신 명시적으로 설정
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

export default function CollectionItemsTab() {
  console.debug('CollectionItemsTab 함수 진입');
  const { selectedServer, selectedCharacter } = useCharacterSelection(); // Context에서 상태 가져오기
  console.debug(`selectedServer: ${selectedServer}, selectedCharacter: ${JSON.stringify(selectedCharacter)}`);
  const [searchTerm, setSearchTerm] = useState("");
  console.debug(`searchTerm 초기값: ${searchTerm}`);
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  console.debug(`collectionItems 초기값: ${JSON.stringify(collectionItems)}`);
  const [characterId, setCharacterId] = useState<number | null>(null);
  console.debug(`characterId 초기값: ${characterId}`);

  const fetchCharacterId = useCallback(async () => {
    console.debug('fetchCharacterId 함수 진입');
    if (!selectedServer || !selectedCharacter) {
      console.debug('selectedServer 또는 selectedCharacter 없음, fetchCharacterId 중단');
      return;
    }
    try {
      console.debug(`캐릭터 ID API 호출: ${BASE_URL}/characters/user/${USER_ID}/server/${selectedServer}`);
      const response = await fetch(`${BASE_URL}/characters/user/${USER_ID}/server/${selectedServer}`);
      if (!response.ok) {
        console.debug(`HTTP 오류 발생: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.debug(`캐릭터 ID API 응답 데이터: ${JSON.stringify(data)}`);
      const foundChar = data.find((char: any) => char.character_name === selectedCharacter.name);
      console.debug(`찾은 캐릭터: ${JSON.stringify(foundChar)}`);
      if (foundChar) {
        setCharacterId(foundChar.character_id);
        console.debug(`characterId 설정: ${foundChar.character_id}`);
      } else {
        setCharacterId(null);
        console.debug('캐릭터를 찾을 수 없음, characterId를 null로 설정');
      }
    } catch (error: any) {
      console.debug(`캐릭터 ID 로드 중 오류 발생: ${error.message}`);
      console.error('캐릭터 ID 로드 중 오류 발생:', error);
      setCharacterId(null);
    }
    console.debug('fetchCharacterId 함수 종료');
  }, [selectedServer, selectedCharacter]);

  const fetchCollectionItems = useCallback(async () => {
    console.debug('fetchCollectionItems 함수 진입');
    if (!selectedCharacter || selectedCharacter.id === undefined) {
      console.debug('selectedCharacter 없음 또는 ID 정의되지 않음, collectionItems를 빈 배열로 설정');
      setCollectionItems([]);
      return;
    }
    try {
      console.debug(`캐릭터 인벤토리 API 호출: ${BASE_URL}/items/inventory/${selectedCharacter.id}`);
      const response = await fetch(`${BASE_URL}/items/inventory/${selectedCharacter.id}`);
      if (!response.ok) {
        console.debug(`HTTP 오류 발생: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allItems: CollectionItem[] = await response.json();
      console.debug(`사용자 인벤토리 API 응답 데이터: ${JSON.stringify(allItems)}`);
      const filteredCollectionItems = allItems.filter(item => {
        const categories = ['나무 베기', '광석 캐기', '약초 채집', '양털 깎기', '호미질', '곤충 채집', '낚시 채집', '일상 채집', '곡물 추수'];
        const isCollectionItem = categories.includes(item.category);
        console.debug(`아이템: ${item.name}, 카테고리: ${item.category}, 채집 아이템 여부: ${isCollectionItem}`);
        return isCollectionItem;
      });
      setCollectionItems(filteredCollectionItems);
      console.debug(`필터링된 채집 아이템 설정: ${JSON.stringify(filteredCollectionItems)}`);
    } catch (error: any) {
      console.debug(`채집 아이템 로드 중 오류 발생: ${error.message}`);
      console.error('채집 아이템 로드 중 오류 발생:', error);
      setCollectionItems([]);
    }
    console.debug('fetchCollectionItems 함수 종료');
  }, [selectedCharacter]);

  useEffect(() => {
    console.debug('fetchCharacterId useEffect 실행');
    fetchCharacterId();
  }, [fetchCharacterId]);

  useEffect(() => {
    console.debug('characterId useEffect 실행');
    if (characterId) {
      console.debug('characterId 존재, fetchCollectionItems 호출');
      fetchCollectionItems();
    } else {
      console.debug('characterId 없음, collectionItems를 빈 배열로 설정');
      setCollectionItems([]);
    }
    console.debug('characterId useEffect 종료');
  }, [characterId, fetchCollectionItems]);

  const filteredItems = collectionItems.filter(
    (item) => {
      const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollectionTarget = (item.collection_target && item.collection_target.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesUsageDetails = (item.usage_details && item.usage_details.toLowerCase().includes(searchTerm.toLowerCase()));
      console.debug(`아이템 ${item.name} 필터링 - 검색어: ${searchTerm}, 이름 일치: ${matchesName}, 카테고리 일치: ${matchesCategory}, 채집 대상 일치: ${matchesCollectionTarget}, 활용 예시 일치: ${matchesUsageDetails}`);
      return matchesName || matchesCategory || matchesCollectionTarget || matchesUsageDetails;
    }
  );
  console.debug(`필터링된 아이템 수: ${filteredItems.length}`);

  if (!selectedServer || !selectedCharacter) {
    console.debug('selectedServer 또는 selectedCharacter 없음, 경고 메시지 표시');
    return (
      <Alert>
        <AlertDescription>서버와 캐릭터를 먼저 선택해주세요.</AlertDescription>
      </Alert>
    )
  }

  if (!characterId) {
    console.debug('characterId 없음, 로딩 메시지 표시');
    return (
      <Alert>
        <AlertDescription>캐릭터 정보를 불러오는 중...</AlertDescription>
      </Alert>
    )
  }

  console.debug('CollectionItemsTab 렌더링');
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle>마비노기 채집 아이템 정보</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">서버: {selectedServer}</Badge>
            <Badge variant="outline">캐릭터: {selectedCharacter.name}</Badge>
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
              onChange={(e) => {
                console.debug(`검색어 변경: ${e.target.value}`);
                setSearchTerm(e.target.value);
              }}
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
                  console.debug('검색 결과 없음 메시지 표시'),
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
