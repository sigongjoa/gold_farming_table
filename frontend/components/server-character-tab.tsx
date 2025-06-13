"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"; // Context 훅 임포트
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"; // Table 컴포넌트 임포트
import { ArrowUpDown } from "lucide-react"; // 정렬 아이콘 임포트
import { Checkbox } from "@/components/ui/checkbox"; // Checkbox 컴포넌트 임포트

// 서버+캐릭터 목록용 타입 정의
interface ServerWithCharacters {
  server_id: number;
  server_name: string;
  characters: CharacterData[];
}

interface CharacterData {
  character_id: number
  character_name: string
  level: number
  profession_name: string
  server_name: string
  user_id: number
  silver_coins: number; // 은동전
  demonic_offerings: number; // 마족공물
  last_silver_coin_collection: number; // 마지막 은동전 수령 시간 (Unix timestamp)
  last_demonic_offering_collection: number; // 마지막 마족공물 수령 시간 (Unix timestamp)
}

interface Profession {
  id: number;
  tier: string;
  name: string;
  description: string;
}

type SortKey = keyof CharacterData | 'server_name';
type SortDirection = 'asc' | 'desc';

const BASE_URL = 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

const SILVER_COIN_REGEN_INTERVAL_MIN = 30; // 30분마다 1개
const SILVER_COIN_MAX_CAPACITY = 20; // 은동전 최대 20개
const DEMONIC_OFFERING_REGEN_INTERVAL_MIN = 12 * 60; // 12시간마다 1개
const DEMONIC_OFFERING_MAX_CAPACITY = 10; // 마족공물 최대 10개

// 헬퍼 함수: 현재 시간에 따라 재화 수량 계산
const calculateCurrentResource = (lastCollectionTime: number, regenIntervalMin: number, maxCapacity: number, initialAmount: number = 0) => {
  console.debug('calculateCurrentResource: Entering function');
  const now = Date.now();
  const minutesElapsed = (now - lastCollectionTime) / (1000 * 60);
  const regeneratedAmount = Math.floor(minutesElapsed / regenIntervalMin);
  const currentAmount = Math.min(initialAmount + regeneratedAmount, maxCapacity);
  console.debug(`calculateCurrentResource: Current Amount: ${currentAmount}, Regen Amount: ${regeneratedAmount}`);
  return currentAmount;
};

// 헬퍼 함수: localStorage에서 특정 캐릭터의 재화 정보 불러오기
const getCharacterResourcesFromLocalStorage = (characterId: number) => {
  console.debug(`getCharacterResourcesFromLocalStorage: Attempting to load resources for characterId: ${characterId}`);
  try {
    const data = localStorage.getItem(`character_resources_${characterId}`);
    if (data) {
      const parsedData = JSON.parse(data);
      console.debug(`getCharacterResourcesFromLocalStorage: Found data for ${characterId}:`, parsedData);
      return parsedData;
    }
  } catch (e) {
    console.error(`getCharacterResourcesFromLocalStorage: Error parsing localStorage data for ${characterId}:`, e);
  }
  console.debug(`getCharacterResourcesFromLocalStorage: No data found for characterId: ${characterId}`);
  return null;
};

// 헬퍼 함수: localStorage에 특정 캐릭터의 재화 정보 저장
const saveCharacterResourcesToLocalStorage = (characterId: number, resources: { silver_coins: number, demonic_offerings: number, last_silver_coin_collection: number, last_demonic_offering_collection: number }) => {
  console.debug(`saveCharacterResourcesToLocalStorage: Saving resources for characterId: ${characterId}:`, resources);
  try {
    localStorage.setItem(`character_resources_${characterId}`, JSON.stringify(resources));
  } catch (e) {
    console.error(`saveCharacterResourcesToLocalStorage: Error saving localStorage data for ${characterId}:`, e);
  }
};

export default function ServerCharacterTab() {
  console.debug('ServerCharacterTab: Entering component');
  const { selectedServer, selectedCharacter, handleServerCharacterSelect } = useCharacterSelection(); // Context 훅 임포트
  console.debug('ServerCharacterTab: selectedServer initialized to', selectedServer);
  console.debug('ServerCharacterTab: selectedCharacter initialized to', selectedCharacter);

  const [servers, setServers] = useState<string[]>([])
  console.debug('ServerCharacterTab: servers state initialized to', servers);
  const [characters, setCharacters] = useState<CharacterData[]>([])
  console.debug('ServerCharacterTab: characters state initialized to', characters);
  const [professions, setProfessions] = useState<Profession[]>([]); // 직업 목록 상태 추가
  console.debug('ServerCharacterTab: professions state initialized to', professions);
  const [localSelectedServer, setLocalSelectedServer] = useState<string | null>(selectedServer); // Context 값으로 초기화
  console.debug('ServerCharacterTab: localSelectedServer state initialized to', localSelectedServer);
  const [localSelectedCharacter, setLocalSelectedCharacter] = useState<string | null>(selectedCharacter ? selectedCharacter.name : null); // Context 값으로 초기화
  console.debug('ServerCharacterTab: localSelectedCharacter state initialized to', localSelectedCharacter);
  const [serversWithCharacters, setServersWithCharacters] = useState<ServerWithCharacters[]>([])
  console.debug('ServerCharacterTab: serversWithCharacters state initialized to', serversWithCharacters);
  const [editingCharacters, setEditingCharacters] = useState<{
    character_name: string;
    level: number;
    profession_name: string;
  }[]>([]); // 편집할 캐릭터 상태
  console.debug('ServerCharacterTab: editingCharacters state initialized to', editingCharacters);
  const [sortKey, setSortKey] = useState<SortKey>('server_name'); // 정렬 기준
  console.debug('ServerCharacterTab: sortKey state initialized to', sortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc'); // 정렬 방향
  console.debug('ServerCharacterTab: sortDirection state initialized to', sortDirection);
  const [displayCharacters, setDisplayCharacters] = useState<CharacterData[]>([]); // 테이블에 표시될 캐릭터 데이터 (계산된 자원 포함)
  console.debug('ServerCharacterTab: displayCharacters state initialized to', displayCharacters);

  // 서버 목록 가져오기
  useEffect(() => {
    console.debug('useEffect: Fetching servers (re-rendering)');
    const fetchServers = async () => {
      console.debug('fetchServers: Entering function to fetch servers');
      try {
        console.debug(`fetchServers: Attempting to fetch from ${BASE_URL}/servers`);
        const response = await fetch(`${BASE_URL}/servers`);
        console.debug(`fetchServers: Response received, status: ${response.status}, ok: ${response.ok}`);
        if (!response.ok) {
          console.debug('fetchServers: Response not ok, entering error block');
          const errorMsg = `HTTP error! status: ${response.status}`;
          console.error('fetchServers: HTTP error during fetch:', errorMsg);
          throw new Error(errorMsg);
        }
        console.debug('fetchServers: Response ok, proceeding to parse JSON');
        const rawData: { server_id: number; name: string; }[] = await response.json();
        console.debug('fetchServers: Fetched raw server data:', rawData);

        const formattedServers: ServerWithCharacters[] = rawData.map(s => ({
          server_id: s.server_id,
          server_name: s.name,
          characters: [] // 초기에는 캐릭터를 빈 배열로 설정
        }));
        console.debug('fetchServers: Formatted servers data:', formattedServers);

        setServers(rawData.map(s => s.name)); // 기존 servers 상태 업데이트 (문자열 배열)
        console.debug('fetchServers: Servers state updated to', rawData.map(s => s.name));
        setServersWithCharacters(formattedServers); // serversWithCharacters 상태 업데이트 (객체 배열)
        console.debug('fetchServers: serversWithCharacters state updated to', formattedServers);

        if (formattedServers.length > 0 && !localSelectedServer) {
          console.debug('fetchServers: No localSelectedServer, setting first server as default');
          setLocalSelectedServer(formattedServers[0].server_name); // 첫 번째 서버를 기본값으로 설정
          console.debug('fetchServers: localSelectedServer set to', formattedServers[0].server_name);
        } else if (formattedServers.length === 0) {
          console.debug('fetchServers: No servers found');
        } else {
          console.debug('fetchServers: localSelectedServer already set or no servers to set as default');
        }
      } catch (error: any) {
        console.debug('fetchServers: Entering catch block for error');
        console.error('fetchServers: Error loading server list:', error);
      }
      console.debug('fetchServers: Exiting function (fetch servers)');
    };
    fetchServers();
    console.debug('useEffect: Exiting effect (server fetch logic)');
  }, [localSelectedServer]); // localSelectedServer가 변경될 때마다 실행

  // 직업 목록 가져오기
  useEffect(() => {
    console.debug('useEffect: Fetching professions (re-rendering)');
    const fetchProfessions = async () => {
      console.debug('fetchProfessions: Entering function to fetch professions');
      try {
        console.debug(`fetchProfessions: Attempting to fetch from ${BASE_URL}/professions`);
        const response = await fetch(`${BASE_URL}/professions`);
        console.debug(`fetchProfessions: Response received, status: ${response.status}, ok: ${response.ok}`);
        if (!response.ok) {
          console.debug('fetchProfessions: Response not ok, entering error block');
          const errorMsg = `HTTP error! status: ${response.status}`;
          console.error('fetchProfessions: HTTP error during fetch:', errorMsg);
          throw new Error(errorMsg);
        }
        console.debug('fetchProfessions: Response ok, proceeding to parse JSON');
        const data: Profession[] = await response.json();
        console.debug('fetchProfessions: Fetched raw profession data:', data);
        setProfessions(data);
        console.debug('fetchProfessions: Professions state updated to', data);
      } catch (error: any) {
        console.debug('fetchProfessions: Entering catch block for error');
        console.error('fetchProfessions: Error loading profession list:', error);
      }
      console.debug('fetchProfessions: Exiting function (fetch professions)');
    };
    fetchProfessions();
    console.debug('useEffect: Exiting effect (profession fetch logic)');
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 선택된 서버에 따라 캐릭터 목록 가져오기
  useEffect(() => {
    console.debug('useEffect: Fetching characters based on selected server (re-rendering)');
    const fetchCharacters = async () => {
      console.debug('fetchCharacters: Entering function to fetch characters');
      if (!localSelectedServer) {
        console.debug('fetchCharacters: No localSelectedServer, resetting characters');
        setCharacters([]);
        setLocalSelectedCharacter(null);
        setEditingCharacters([]);
        return;
      }
      console.debug('fetchCharacters: localSelectedServer is present', localSelectedServer);
      try {
        console.debug(`fetchCharacters: Attempting to fetch from ${BASE_URL}/servers/${localSelectedServer}/characters?userId=${USER_ID}`);
        const response = await fetch(`${BASE_URL}/servers/${localSelectedServer}/characters?userId=${USER_ID}`);
        console.debug(`fetchCharacters: Response received, status: ${response.status}, ok: ${response.ok}`);
        if (!response.ok) {
          console.debug('fetchCharacters: Response not ok, entering error block');
          const errorMsg = `HTTP error! status: ${response.status}`;
          console.error('fetchCharacters: HTTP error during fetch:', errorMsg);
          throw new Error(errorMsg);
        }
        console.debug('fetchCharacters: Response ok, proceeding to parse JSON');
        const rawData: CharacterData[] = await response.json();
        console.debug('fetchCharacters: Fetched raw character data:', rawData);

        const charactersWithResources: CharacterData[] = rawData.map(char => {
          const savedResources = getCharacterResourcesFromLocalStorage(char.character_id);
          const now = Date.now();

          let initialSilverCoins = savedResources?.silver_coins || 0;
          let initialDemonicOfferings = savedResources?.demonic_offerings || 0;
          let lastSilverCoinCollection = savedResources?.last_silver_coin_collection || now;
          let lastDemonicOfferingCollection = savedResources?.last_demonic_offering_collection || now;

          // Calculate current resources based on last collection time
          const currentSilverCoins = calculateCurrentResource(lastSilverCoinCollection, SILVER_COIN_REGEN_INTERVAL_MIN, SILVER_COIN_MAX_CAPACITY, initialSilverCoins);
          const currentDemonicOfferings = calculateCurrentResource(lastDemonicOfferingCollection, DEMONIC_OFFERING_REGEN_INTERVAL_MIN, DEMONIC_OFFERING_MAX_CAPACITY, initialDemonicOfferings);
          
          const updatedChar: CharacterData = {
            ...char,
            silver_coins: currentSilverCoins,
            demonic_offerings: currentDemonicOfferings,
            last_silver_coin_collection: lastSilverCoinCollection, // 저장된 시간 사용
            last_demonic_offering_collection: lastDemonicOfferingCollection // 저장된 시간 사용
          };

          // Save updated resources back to localStorage (especially if initialized or regenerated)
          saveCharacterResourcesToLocalStorage(char.character_id, {
            silver_coins: updatedChar.silver_coins,
            demonic_offerings: updatedChar.demonic_offerings,
            last_silver_coin_collection: updatedChar.last_silver_coin_collection,
            last_demonic_offering_collection: updatedChar.last_demonic_offering_collection,
          });

          console.debug(`fetchCharacters: Character ${char.character_name} updated with resources:`, updatedChar);
          return updatedChar;
        });

        setCharacters(charactersWithResources);
        setEditingCharacters(rawData.map(char => ({
          character_name: char.character_name,
          level: char.level || 1,
          profession_name: char.profession_name || ''
        })));
        console.debug('fetchCharacters: Characters state updated with data:', charactersWithResources);
        console.debug('fetchCharacters: Editing characters state initialized with data:', editingCharacters);

        // Update characters in serversWithCharacters state as well
        setServersWithCharacters(prevServers => {
          console.debug('fetchCharacters: Updating characters in serversWithCharacters state');
          const updatedServers = prevServers.map(server => {
            if (server.server_name === localSelectedServer) {
              // Replace characters array with the new charactersWithResources array
              return { ...server, characters: charactersWithResources };
            }
            return server;
          });
          console.debug('fetchCharacters: serversWithCharacters state after character update:', updatedServers);
          return updatedServers;
        });

        if (charactersWithResources.length > 0 && !localSelectedCharacter) {
          console.debug('fetchCharacters: No localSelectedCharacter, setting first character as default');
          setLocalSelectedCharacter(charactersWithResources[0].character_name); // 첫 번째 캐릭터를 기본값으로 설정
          console.debug('fetchCharacters: localSelectedCharacter set to', charactersWithResources[0].character_name);
        } else if (charactersWithResources.length === 0) {
          console.debug('fetchCharacters: No characters found for selected server');
        } else {
          console.debug('fetchCharacters: localSelectedCharacter already set or no characters to set as default');
        }
      } catch (error: any) {
        console.debug('fetchCharacters: Entering catch block for error');
        console.error('fetchCharacters: Error loading character list:', error);
        setCharacters([]);
        setLocalSelectedCharacter(null);
        setEditingCharacters([]);
      }
      console.debug('fetchCharacters: Exiting function (fetch characters)');
    };
    fetchCharacters();
    console.debug('useEffect: Exiting effect (character fetch logic)');
  }, [localSelectedServer, localSelectedCharacter]); // localSelectedServer 또는 localSelectedCharacter 변경 시 실행

  // 주기적으로 재화 업데이트
  useEffect(() => {
    console.debug('useEffect: Setting up interval for resource update');
    const interval = setInterval(() => {
      console.debug(`Interval: Updating all characters' resources`);
      setCharacters(prevCharacters => {
        const updatedCharacters = prevCharacters.map(char => {
          const savedResources = getCharacterResourcesFromLocalStorage(char.character_id);
          const now = Date.now();

          let currentSilverCoins = char.silver_coins;
          let currentDemonicOfferings = char.demonic_offerings;
          let lastSilverCoinCollection = char.last_silver_coin_collection;
          let lastDemonicOfferingCollection = char.last_demonic_offering_collection;

          if (savedResources) {
            lastSilverCoinCollection = savedResources.last_silver_coin_collection;
            lastDemonicOfferingCollection = savedResources.last_demonic_offering_collection;
          }
          
          const newSilverCoins = calculateCurrentResource(lastSilverCoinCollection, SILVER_COIN_REGEN_INTERVAL_MIN, SILVER_COIN_MAX_CAPACITY, currentSilverCoins);
          const newDemonicOfferings = calculateCurrentResource(lastDemonicOfferingCollection, DEMONIC_OFFERING_REGEN_INTERVAL_MIN, DEMONIC_OFFERING_MAX_CAPACITY, currentDemonicOfferings);

          if (newSilverCoins !== currentSilverCoins || newDemonicOfferings !== currentDemonicOfferings) {
            const updatedChar = {
              ...char,
              silver_coins: newSilverCoins,
              demonic_offerings: newDemonicOfferings,
            };
            saveCharacterResourcesToLocalStorage(char.character_id, {
              silver_coins: updatedChar.silver_coins,
              demonic_offerings: updatedChar.demonic_offerings,
              last_silver_coin_collection: updatedChar.last_silver_coin_collection,
              last_demonic_offering_collection: updatedChar.last_demonic_offering_collection,
            });
            console.debug(`Interval: Character ${char.character_name} resources updated: Silver ${newSilverCoins}, Demonic ${newDemonicOfferings}`);
            return updatedChar;
          }
          return char;
        });
        return updatedCharacters;
      });
    }, 60 * 1000); // 1분마다 업데이트

    return () => {
      console.debug('useEffect: Cleaning up resource update interval');
      clearInterval(interval);
    };
  }, []); // 빈 배열로 컴포넌트 마운트 시 한 번만 실행

  // 로컬 상태 변경 시 Context 업데이트
  useEffect(() => {
    console.debug('useEffect: localSelectedServer or localSelectedCharacter changed, updating context');
    if (localSelectedServer && localSelectedCharacter) {
      console.debug('useEffect: Both localSelectedServer and localSelectedCharacter are present');
      const characterObject = characters.find((char: CharacterData) => {
        console.debug('useEffect: Finding character - current char name:', char.character_name, 'localSelectedCharacter:', localSelectedCharacter);
        return char.character_name === localSelectedCharacter;
      });
      if (characterObject) {
        console.debug('useEffect: Character object found:', characterObject);
        const formattedCharacter = { 
          id: characterObject.character_id,
          name: characterObject.character_name,
          level: characterObject.level,
          profession_name: characterObject.profession_name
        };
        console.debug('useEffect: Formatted character for context:', formattedCharacter);
        handleServerCharacterSelect(localSelectedServer, formattedCharacter);
        console.debug('useEffect: Context updated');
      } else {
        console.debug('useEffect: Could not find character object for:', localSelectedCharacter);
      }
    } else {
      console.debug('useEffect: localSelectedServer or localSelectedCharacter is missing, not updating context');
    }
    console.debug('useEffect: Exiting effect (context update)');
  }, [localSelectedServer, localSelectedCharacter, handleServerCharacterSelect, characters]);

  const handleCollectSilverCoins = (characterId: number) => {
    console.debug(`handleCollectSilverCoins: Collecting for characterId: ${characterId}`);
    setCharacters(prevCharacters => prevCharacters.map(char => {
      if (char.character_id === characterId) {
        const now = Date.now();
        const updatedChar = {
          ...char,
          silver_coins: SILVER_COIN_MAX_CAPACITY,
          last_silver_coin_collection: now,
        };
        saveCharacterResourcesToLocalStorage(characterId, {
          silver_coins: updatedChar.silver_coins,
          demonic_offerings: updatedChar.demonic_offerings,
          last_silver_coin_collection: updatedChar.last_silver_coin_collection,
          last_demonic_offering_collection: updatedChar.last_demonic_offering_collection,
        });
        console.debug(`handleCollectSilverCoins: Character ${char.character_name} silver coins collected.`);
        return updatedChar;
      }
      return char;
    }));
  };

  const handleCollectDemonicOfferings = (characterId: number) => {
    console.debug(`handleCollectDemonicOfferings: Collecting for characterId: ${characterId}`);
    setCharacters(prevCharacters => prevCharacters.map(char => {
      if (char.character_id === characterId) {
        const now = Date.now();
        const updatedChar = {
          ...char,
          demonic_offerings: DEMONIC_OFFERING_MAX_CAPACITY,
          last_demonic_offering_collection: now,
        };
        saveCharacterResourcesToLocalStorage(characterId, {
          silver_coins: updatedChar.silver_coins,
          demonic_offerings: updatedChar.demonic_offerings,
          last_silver_coin_collection: updatedChar.last_silver_coin_collection,
          last_demonic_offering_collection: updatedChar.last_demonic_offering_collection,
        });
        console.debug(`handleCollectDemonicOfferings: Character ${char.character_name} demonic offerings collected.`);
        return updatedChar;
      }
      return char;
    }));
  };

  const handleAddCharacter = () => {
    console.debug('handleAddCharacter: Adding new character row');
    setEditingCharacters(prev => [...prev, { character_name: '', level: 1, profession_name: '' }]);
    console.debug('handleAddCharacter: editingCharacters after add:', editingCharacters);
  };

  const handleRemoveCharacter = (index: number) => {
    console.debug(`handleRemoveCharacter: Removing character at index ${index}`);
    setEditingCharacters(prev => prev.filter((_, i) => i !== index));
    console.debug('handleRemoveCharacter: editingCharacters after remove:', editingCharacters);
  };

  const handleCharacterChange = (index: number, field: string, value: string | number) => {
    console.debug(`handleCharacterChange: Updating character at index ${index}, field ${field} with value ${value}`);
    setEditingCharacters(prev =>
      prev.map((char, i) =>
        i === index ? { ...char, [field]: value } : char
      )
    );
    console.debug('handleCharacterChange: editingCharacters after change:', editingCharacters);
  };

  const handleSaveCharacters = async () => {
    console.debug('handleSaveCharacters: Attempting to save characters');
    if (!localSelectedServer) {
      console.debug('handleSaveCharacters: No server selected, cannot save');
      return;
    }

    try {
      console.debug(`handleSaveCharacters: Sending POST request to ${BASE_URL}/servers/${localSelectedServer}/characters`);
      const response = await fetch(`${BASE_URL}/servers/${localSelectedServer}/characters`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: USER_ID,
            characters: editingCharacters.filter(char => char.character_name.trim() !== '') // 비어있는 캐릭터명 제외
          }),
        }
      );
      console.debug(`handleSaveCharacters: Response received, status: ${response.status}, ok: ${response.ok}`);

      if (!response.ok) {
        console.debug('handleSaveCharacters: Response not ok, entering error block');
        const errorData = await response.json();
        console.error('handleSaveCharacters: Error saving characters:', errorData);
        alert(`캐릭터 저장 실패: ${errorData.message || response.statusText}`);
        return;
      }

      console.debug('handleSaveCharacters: Characters saved successfully');
      alert('캐릭터 정보가 성공적으로 저장되었습니다.');
      // 저장 후 캐릭터 목록을 다시 불러와서 UI 업데이트
      const fetchCharacters = async () => {
        if (!localSelectedServer) return;
        try {
          const response = await fetch(`${BASE_URL}/servers/${localSelectedServer}/characters?userId=${USER_ID}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: CharacterData[] = await response.json();
          setCharacters(data);
          setEditingCharacters(data.map(char => ({
            character_name: char.character_name,
            level: char.level || 1,
            profession_name: char.profession_name || ''
          })));
        } catch (error) {
          console.error('Failed to refetch characters after save:', error);
        }
      };
      fetchCharacters();
    } catch (error: any) {
      console.debug('handleSaveCharacters: Entering catch block for error');
      console.error('handleSaveCharacters: Network error during save:', error);
      alert(`네트워크 오류: ${error.message}`);
    }
    console.debug('handleSaveCharacters: Exiting function');
  };

  const handleSort = (key: SortKey) => {
    console.debug(`handleSort: Sorting by ${key}`);
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      console.debug(`handleSort: Toggled sort direction to ${sortDirection === 'asc' ? 'desc' : 'asc'} for key ${key}`);
    } else {
      setSortKey(key);
      setSortDirection('asc');
      console.debug(`handleSort: Set sort key to ${key} and direction to asc`);
    }
  };

  useEffect(() => {
    console.debug('useEffect: Recalculating display characters for table (re-rendering)');
    let allCharacters: CharacterData[] = [];
    serversWithCharacters.forEach(server => {
      server.characters.forEach(char => {
        allCharacters.push({
          ...char,
          server_name: server.server_name // 캐릭터 객체에 서버 이름 추가
        });
      });
    });

    console.debug('useEffect: All characters before sorting:', allCharacters);

    const sorted = [...allCharacters].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      // null 또는 undefined 값 처리
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    console.debug('useEffect: Sorted characters:', sorted);
    setDisplayCharacters(sorted);
  }, [serversWithCharacters, sortKey, sortDirection]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>서버 및 캐릭터 목록</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {selectedServer && selectedCharacter && (
          <Alert>
            <AlertDescription>
              현재 선택된 서버: <strong>{selectedServer}</strong>, 캐릭터: <strong>{selectedCharacter?.name}</strong> (Lv.{selectedCharacter?.level}) - {selectedCharacter?.profession_name}
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('server_name')}>
                    서버
                    {sortKey === 'server_name' && (
                      <span className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>
                        <ArrowUpDown />
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('character_name')}>
                    캐릭터 이름
                    {sortKey === 'character_name' && (
                      <span className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>
                        <ArrowUpDown />
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('level')}>
                    레벨
                    {sortKey === 'level' && (
                      <span className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>
                        <ArrowUpDown />
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('profession_name')}>
                    직업
                    {sortKey === 'profession_name' && (
                      <span className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>
                        <ArrowUpDown />
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('silver_coins')}>
                    은동전
                    {sortKey === 'silver_coins' && (
                      <span className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>
                        <ArrowUpDown />
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('demonic_offerings')}>
                    마족공물
                    {sortKey === 'demonic_offerings' && (
                      <span className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>
                        <ArrowUpDown />
                      </span>
                    )}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayCharacters.length > 0 ? (
                displayCharacters.map(char => (
                  <TableRow
                    key={char.character_id}
                    onClick={() => {
                      console.debug(`Table Row Clicked: Server ${char.server_name}, Character ${char.character_name}`);
                      setLocalSelectedServer(char.server_name);
                      setLocalSelectedCharacter(char.character_name);
                      handleServerCharacterSelect(char.server_name, {
                        id: char.character_id,
                        name: char.character_name,
                        level: char.level,
                        profession_name: char.profession_name
                      });
                    }}
                    className={char.server_name === selectedServer && char.character_name === selectedCharacter?.name ? "bg-accent/50" : "cursor-pointer hover:bg-accent/50"}
                  >
                    <TableCell>{char.server_name}</TableCell>
                    <TableCell className="font-medium">{char.character_name}</TableCell>
                    <TableCell>{char.level}</TableCell>
                    <TableCell>{char.profession_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{char.silver_coins}/{SILVER_COIN_MAX_CAPACITY}</span>
                        {char.silver_coins > 0 && char.silver_coins < SILVER_COIN_MAX_CAPACITY && (
                           <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleCollectSilverCoins(char.character_id);
                          }}>
                            수령
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{char.demonic_offerings}/{DEMONIC_OFFERING_MAX_CAPACITY}</span>
                        {char.demonic_offerings > 0 && char.demonic_offerings < DEMONIC_OFFERING_MAX_CAPACITY && (
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleCollectDemonicOfferings(char.character_id);
                          }}>
                            수령
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    캐릭터가 없습니다. 새 캐릭터를 추가하거나 서버를 선택하세요.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Separator className="my-4" />

        <h3 className="text-lg font-semibold">캐릭터 관리</h3>
        {!localSelectedServer && (
          <Alert variant="destructive">
            <AlertDescription>
              캐릭터를 관리하려면 먼저 서버를 선택해야 합니다.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="manage-server">관리할 서버 선택</Label>
          <Select
            value={localSelectedServer || ''}
            onValueChange={value => {
              setLocalSelectedServer(value);
              setEditingCharacters([]); // 서버 변경 시 편집 중인 캐릭터 목록 초기화
            }}
          >
            <SelectTrigger id="manage-server" className="w-full">
              <SelectValue placeholder="서버를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {serversWithCharacters.map(server => (
                <SelectItem key={server.server_id} value={server.server_name}>
                  {server.server_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {localSelectedServer && editingCharacters.map((char, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              type="text"
              placeholder="캐릭터 이름"
              value={char.character_name}
              onChange={e => handleCharacterChange(index, 'character_name', e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="레벨"
              value={char.level}
              onChange={e => handleCharacterChange(index, 'level', parseInt(e.target.value))}
              className="w-20"
              min="1"
            />
            <Select
              value={char.profession_name || 'unselected'}
              onValueChange={value => handleCharacterChange(index, 'profession_name', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="직업 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unselected">직업 선택 안함</SelectItem>
                {professions.map(p => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="destructive" onClick={() => handleRemoveCharacter(index)}>
              삭제
            </Button>
          </div>
        ))}
        {localSelectedServer && (
          <Button onClick={handleAddCharacter} className="mt-2">
            캐릭터 추가
          </Button>
        )}
        {localSelectedServer && editingCharacters.length > 0 && (
          <Button onClick={handleSaveCharacters} className="mt-4 w-full">
            캐릭터 정보 저장
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

