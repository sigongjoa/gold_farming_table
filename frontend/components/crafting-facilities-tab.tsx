"use client";

import { useState, useEffect } from 'react';
import { useCharacterSelection } from '@/lib/contexts/character-selection-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';

interface CraftingFacility {
  crafting_facility_id: number;
  crafting_facility_name: string;
  level: number;
  icon_url: string | null;
  
  // Level 2 upgrade details
  level2_special_part_name: string | null;
  level2_special_part_materials: string | null; // JSON string or comma-separated
  level2_shop_part_name: string | null;
  level2_npc_location: string | null;
  level2_purchase_currency: string | null;

  // Level 3 upgrade details
  level3_special_part_name: string | null;
  level3_special_part_materials: string | null; // JSON string or comma-separated
  level3_shop_part_name: string | null;
  level3_npc_location: string | null;
  level3_purchase_currency: string | null;
}

interface Server {
  server_id: number;
  name: string;
}

export default function CraftingFacilitiesTab() {
  console.debug('CraftingFacilitiesTab: Entering component');
  const { selectedServer } = useCharacterSelection();
  const [facilities, setFacilities] = useState<CraftingFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    console.debug('CraftingFacilitiesTab.useEffect: Running effect, selectedServer:', selectedServer);
    async function fetchCraftingFacilities() {
      console.debug(`fetchCraftingFacilities 함수 진입 (ID 기반 요청): selectedServer = ${selectedServer}`);
      try {
        // 1) 모든 서버를 가져와 이름으로 ID를 찾습니다.
        console.debug('fetchCraftingFacilities: Fetching all servers...');
        const serversRes = await fetch(`http://localhost:3001/servers`);
        if (!serversRes.ok) {
          console.debug(`fetchCraftingFacilities: Failed to fetch servers, status: ${serversRes.status}`);
          throw new Error(`Failed to fetch servers: ${serversRes.status}`);
        }
        const servers: Server[] = await serversRes.json();
        console.debug('fetchCraftingFacilities: Fetched servers:', servers);

        // 2) selectedServer와 일치하는 서버를 찾습니다.
        const server = servers.find(s => s.name === selectedServer);
        if (!server) {
          console.warn('fetchCraftingFacilities: Selected server not found in fetched servers:', selectedServer);
          toast.error("선택된 서버를 찾을 수 없습니다.");
          return;
        }
        console.debug('fetchCraftingFacilities: Found server ID:', server.server_id);

        // 3) server_id를 사용하여 크래프팅 시설을 요청합니다.
        console.debug(`fetchCraftingFacilities: Fetching crafting facilities for server ID: ${server.server_id}`);
        const facilitiesRes = await fetch(
          `http://localhost:3001/crafting-facilities/servers/${server.server_id}`
        );
        if (!facilitiesRes.ok) {
          console.debug(`fetchCraftingFacilities: 응답 상태 코드 = ${facilitiesRes.status}`);
          throw new Error(`HTTP ${facilitiesRes.status}`);
        }
        const facilities: CraftingFacility[] = await facilitiesRes.json();
        console.debug('fetchCraftingFacilities: 데이터 수신 성공', facilities);
        setFacilities(facilities);

        // Initialize levels state with fetched data
        const initialLevels = facilities.reduce((acc: Record<number, number>, facility: CraftingFacility) => {
          acc[facility.crafting_facility_id] = facility.level;
          return acc;
        }, {});
        setLevels(initialLevels);
      } catch (err) {
        console.error("크래프팅 시설 가져오기 오류 (ID 기반 요청):", err);
        setError(`크래프팅 시설 로드 실패: ${err instanceof Error ? err.message : String(err)}`);
        toast.error(`크래프팅 시설 로드 실패: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
        console.debug('fetchCraftingFacilities: Exiting function (finally)');
      }
    }

    fetchCraftingFacilities();
    console.debug('CraftingFacilitiesTab.useEffect: Effect cleanup (if any)');
  }, [selectedServer]);

  const handleLevelChange = (facilityId: number, value: string) => {
    console.debug(`handleLevelChange: Facility ID: ${facilityId}, Value: ${value}`);
    const newLevel = parseInt(value);
    if (!isNaN(newLevel) && newLevel >= 0) {
      setLevels(prevLevels => ({
        ...prevLevels,
        [facilityId]: newLevel
      }));
    } else if (value === '') { // Allow empty string for clearing input
        setLevels(prevLevels => ({
            ...prevLevels,
            [facilityId]: 0 // Or null, depending on desired behavior for empty
        }));
    }
    console.debug('handleLevelChange: Updated levels state:', levels);
  };

  const updateFacilityLevel = async (facilityId: number) => {
    console.debug(`updateFacilityLevel: Entering function for facility ID: ${facilityId}`);
    if (!selectedServer) {
      console.warn('updateFacilityLevel: No server selected');
      toast.error('서버를 선택해주세요.');
      return;
    }

    const currentLevel = levels[facilityId];
    if (currentLevel === undefined) {
        console.warn(`updateFacilityLevel: Level not found for facility ID: ${facilityId}`);
        toast.error('업데이트할 레벨을 찾을 수 없습니다.');
        return;
    }

    try {
      console.debug(`updateFacilityLevel: Updating level for facility ${facilityId} to ${currentLevel} on server ${selectedServer}`);
      // First, get the server_id from the server name
      const serverResponse = await fetch(`http://localhost:3001/servers`);
      if (!serverResponse.ok) {
        const errorData = await serverResponse.json();
        console.error('updateFacilityLevel: Failed to fetch servers:', serverResponse.status, errorData);
        throw new Error(`Failed to fetch servers: ${errorData.message || serverResponse.statusText}`);
      }
      const servers = await serverResponse.json();
      const server = servers.find((s: Server) => s.name === selectedServer);
      if (!server) {
        console.warn('updateFacilityLevel: Selected server not found in fetched servers');
        toast.error('선택된 서버를 찾을 수 없습니다.');
        return;
      }
      const serverId = server.server_id;
      console.debug('updateFacilityLevel: Resolved serverId:', serverId);

      const response = await fetch(`http://localhost:3001/crafting-facilities/servers/${serverId}/facilities/${facilityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level: currentLevel }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('updateFacilityLevel: Failed to update crafting facility level:', response.status, errorData);
        throw new Error(`Failed to update crafting facility level: ${errorData.message || response.statusText}`);
      }

      console.debug('updateFacilityLevel: Facility level updated successfully');
      toast.success('크래프팅 시설 레벨이 업데이트되었습니다.');
    } catch (err) {
      console.error('updateFacilityLevel: Error updating facility level:', err);
      toast.error(`레벨 업데이트 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        console.debug('updateFacilityLevel: Exiting function (finally)');
    }
  };

  console.debug('CraftingFacilitiesTab: Rendering JSX');
  if (loading) {
    return <div className="text-center py-4">크래프팅 시설 로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">오류: {error}</div>;
  }

  if (!selectedServer) {
    return <div className="text-center py-4">서버를 선택해주세요.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {facilities.map((facility) => (
        <Card key={facility.crafting_facility_id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/* facility.icon_url이 있다면 여기에 img 태그를 넣을 수 있습니다 */}
              <span>{facility.crafting_facility_name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-grow flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4">현재 레벨: {facility.level}</p>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="0"
                value={levels[facility.crafting_facility_id] || 0}
                onChange={(e) => handleLevelChange(facility.crafting_facility_id, e.target.value)}
                className="w-24"
              />
              <Button onClick={() => updateFacilityLevel(facility.crafting_facility_id)}>
                레벨 설정
              </Button>
            </div>

            {/* 크래프팅 시설 업그레이드 상세 정보 추가 */}
            <Collapsible className="w-full mt-4 space-y-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between pr-0 pl-2">
                  <span className="text-sm font-medium">업그레이드 정보</span>
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 px-2 pt-2 pb-0">
                {facility.level2_special_part_name && (
                  <div className="border rounded-md p-2">
                    <h4 className="text-base font-semibold mb-1">2레벨 업그레이드</h4>
                    <p className="text-sm">**특수 부품:** {facility.level2_special_part_name}</p>
                    <p className="text-sm">**재료:** {facility.level2_special_part_materials}</p>
                    <p className="text-sm">**상점 부품:** {facility.level2_shop_part_name}</p>
                    <p className="text-sm">**판매 NPC:** {facility.level2_npc_location}</p>
                    <p className="text-sm">**구매 재화:** {facility.level2_purchase_currency}</p>
                  </div>
                )}
                {facility.level3_special_part_name && (
                  <div className="border rounded-md p-2">
                    <h4 className="text-base font-semibold mb-1">3레벨 업그레이드</h4>
                    <p className="text-sm">**특수 부품:** {facility.level3_special_part_name}</p>
                    <p className="text-sm">**재료:** {facility.level3_special_part_materials}</p>
                    <p className="text-sm">**상점 부품:** {facility.level3_shop_part_name}</p>
                    <p className="text-sm">**판매 NPC:** {facility.level3_npc_location}</p>
                    <p className="text-sm">**구매 재화:** {facility.level3_purchase_currency}</p>
                  </div>
                )}
                {!facility.level2_special_part_name && !facility.level3_special_part_name && (
                    <p className="text-sm text-muted-foreground">등록된 업그레이드 정보가 없습니다.</p>
                )}
              </CollapsibleContent>
            </Collapsible>

          </CardContent>
        </Card>
      ))}
    </div>
  );
} 