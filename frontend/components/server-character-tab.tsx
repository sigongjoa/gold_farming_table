"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, Download } from "lucide-react"

interface ServerCharacterTabProps {
  onSelect: (server: string, character: string) => void
}

const BASE_URL = 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID

export default function ServerCharacterTab({ onSelect }: ServerCharacterTabProps) {
  const [servers, setServers] = useState<string[]>([]); // 빈 배열로 초기화
  const [selectedServer, setSelectedServer] = useState<string>("")
  const [characters, setCharacters] = useState<string[]>(["", "", "", ""])
  const [activeCharacter, setActiveCharacter] = useState<string>("")
  const [allCharactersData, setAllCharactersData] = useState<Array<{ character_id: number; character_name: string; db_name: string; }>>([]); // 백엔드에서 로드된 캐릭터 전체 데이터

  // Load characters for the selected server from backend
  const loadCharactersFromBackend = useCallback(async () => {
    if (!selectedServer) {
      setCharacters(["", "", "", ""]);
      setActiveCharacter("");
      setAllCharactersData([]);
      onSelect("", "");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/characters/user/${USER_ID}/server/${selectedServer}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedCharacters: Array<{ character_id: number; character_name: string; db_name: string; }> = await response.json();
      setAllCharactersData(fetchedCharacters);

      const charNames = ["", "", "", ""];
      fetchedCharacters.slice(0, 4).forEach((char: { character_name: string }, index: number) => {
        charNames[index] = char.character_name;
      });
      setCharacters(charNames);

      // 기존 선택된 캐릭터가 있다면 유지, 없다면 초기화
      if (activeCharacter && fetchedCharacters.some((c: { character_name: string }) => c.character_name === activeCharacter)) {
        // Do nothing, activeCharacter is already set
      } else if (fetchedCharacters.length > 0) {
        setActiveCharacter(fetchedCharacters[0].character_name);
        onSelect(selectedServer, fetchedCharacters[0].character_name);
      } else {
        setActiveCharacter("");
        onSelect(selectedServer, "");
      }

    } catch (error) {
      console.error('캐릭터 로드 중 오류 발생:', error);
      alert('캐릭터를 불러오는 데 실패했습니다.');
    }
  }, [selectedServer, activeCharacter, onSelect]); // 종속성 배열에 activeCharacter와 onSelect 추가

  // 서버 목록 로드
  useEffect(() => {
    async function fetchServers() {
      try {
        const res = await fetch(`${BASE_URL}/servers`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Array<{ name: string }> = await res.json();
        setServers(data.map((s: { name: string }) => s.name));
      } catch (error) {
        console.error('서버 로드 중 오류 발생:', error);
      }
    }
    fetchServers();
  }, []);

  useEffect(() => {
    loadCharactersFromBackend();
  }, [loadCharactersFromBackend]); // useCallback으로 감싼 함수를 의존성으로 추가

  const handleServerChange = (value: string) => {
    setSelectedServer(value)
    // setSelectedServer가 변경되면 useEffect가 실행되어 캐릭터가 자동으로 로드됨
  }

  const handleCharacterChange = (index: number, value: string) => {
    const newCharacters = [...characters]
    newCharacters[index] = value
    setCharacters(newCharacters)
  }

  const handleCharacterSelect = (characterName: string) => {
    if (characterName) {
      setActiveCharacter(characterName);
      onSelect(selectedServer, characterName);
    } else {
      setActiveCharacter("");
      onSelect(selectedServer, "");
    }
  }

  const saveCharacters = async () => {
    if (!selectedServer) {
      alert('캐릭터를 저장하려면 먼저 서버를 선택해야 합니다.');
      return;
    }

    const characterNamesToSave = characters.filter((name: string) => name.trim() !== '');

    if (characterNamesToSave.length === 0) {
      alert('저장할 캐릭터 이름을 최소 하나 이상 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/characters/${USER_ID}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          server_name: selectedServer,
          character_names: characterNamesToSave
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '캐릭터 저장에 실패했습니다.');
      }

      alert('캐릭터가 성공적으로 저장되었습니다.');
      // 저장 후 캐릭터 목록 새로고침
      loadCharactersFromBackend();

    } catch (error: any) {
      console.error('캐릭터 저장 중 오류 발생:', error);
      alert(`캐릭터 저장 실패: ${error.message}`);
    }
  }

  const loadCharacters = () => {
    loadCharactersFromBackend();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>서버 및 캐릭터 선택</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="serverSelect" className="text-sm font-medium">
              서버 선택:
            </label>
            <Select value={selectedServer} onValueChange={handleServerChange}>
              <SelectTrigger id="serverSelect" className="w-full">
                <SelectValue placeholder="서버를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server: string) => (
                  <SelectItem key={server} value={server}>
                    {server}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">캐릭터 관리</h3>
              <div className="space-x-2">
                <Button onClick={saveCharacters} size="sm" variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
                <Button onClick={loadCharacters} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  불러오기
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">캐릭터 이름을 입력하고 저장하세요 (최대 4개).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map((character: string, index: number) => (
                <div key={index} className="space-y-1">
                  <label htmlFor={`character-${index}`} className="text-sm font-medium">
                    캐릭터 {index + 1}:
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id={`character-${index}`}
                      value={character}
                      onChange={(e) => handleCharacterChange(index, e.target.value)}
                      placeholder="캐릭터 이름"
                    />
                    <Button
                      onClick={() => handleCharacterSelect(character)}
                      disabled={!character}
                      variant={activeCharacter === character ? "default" : "secondary"}
                    >
                      선택
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                선택된 서버: {selectedServer || "없음"}
              </Badge>
              <Badge variant="outline" className="text-sm">
                선택된 캐릭터: {activeCharacter || "없음"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

