"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2 } from "lucide-react"

interface CharacterTasksTabProps {
  server: string
  character: string
}

interface Task {
  task_id: number;
  task_name: string;
  is_completed: boolean | null;
  completed_date: string | null;
}

const BASE_URL = 'http://localhost:3001';
const USER_ID = 1; // 임시 사용자 ID (향후 로그인 기능 추가 시 변경)

export default function CharacterTasksTab({ server, character }: CharacterTasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskName, setNewTaskName] = useState("")
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

  const fetchTasks = useCallback(async () => {
    if (!characterId) {
      setTasks([]);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/tasks/character/${characterId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('작업 목록 로드 중 오류 발생:', error);
      setTasks([]);
    }
  }, [characterId]);

  useEffect(() => {
    fetchCharacterId();
  }, [fetchCharacterId]);

  useEffect(() => {
    if (characterId) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [characterId, fetchTasks]);

  const addTask = async () => {
    if (!newTaskName.trim() || !characterId) return

    try {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskName: newTaskName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      alert('작업 추가 성공!');
      fetchTasks(); // 작업 목록 새로고침
      setNewTaskName(""); // 입력 필드 초기화

    } catch (error: any) {
      console.error('작업 추가 중 오류 발생:', error);
      alert(`작업 추가 실패: ${error.message}`);
    }
  }

  const toggleTaskCompletion = async (taskId: number, isCompleted: boolean | null) => {
    if (!characterId) return;

    try {
      const response = await fetch(`${BASE_URL}/tasks/${taskId}/character/${characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isCompleted: !isCompleted })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      alert('작업 상태 업데이트 성공!');
      fetchTasks(); // 작업 목록 새로고침
    } catch (error: any) {
      console.error('작업 상태 업데이트 중 오류 발생:', error);
      alert(`작업 상태 업데이트 실패: ${error.message}`);
    }
  }

  const deleteTask = async (taskId: number) => {
    if (!characterId) return;

    try {
      const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      alert('작업 삭제 성공!');
      fetchTasks(); // 작업 목록 새로고침

    } catch (error: any) {
      console.error('작업 삭제 중 오류 발생:', error);
      alert(`작업 삭제 실패: ${error.message}`);
    }
  }

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
        <CardTitle>캐릭터 작업 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="새 작업명을 입력하세요"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTask()
                }
              }}
              className="flex-grow"
            />
            <Button onClick={addTask} disabled={!newTaskName.trim() || !characterId}>
              <Plus className="h-4 w-4 mr-2" />
              작업 추가
            </Button>
          </div>

          {(!server || !character) && (
            <Alert>
              <AlertDescription>작업을 추가하려면 서버와 캐릭터를 먼저 선택해주세요.</AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>작업명</TableHead>
                  <TableHead>캐릭터명</TableHead>
                  <TableHead>진행여부</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.task_id} className={task.is_completed ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">{task.task_name}</TableCell>
                    <TableCell>{character} {/* Displaying selected character name */}</TableCell>
                    <TableCell>
                      <Checkbox 
                        checked={task.is_completed || false} 
                        onCheckedChange={() => toggleTaskCompletion(task.task_id, task.is_completed)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteTask(task.task_id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {tasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      등록된 작업이 없습니다.
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
