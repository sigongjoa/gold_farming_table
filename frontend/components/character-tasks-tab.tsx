"use client"

import React, { useState, useEffect } from 'react';
import { useCharacterSelection } from '@/lib/contexts/character-selection-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { MinusCircledIcon, PlusCircledIcon, TrashIcon } from '@radix-ui/react-icons';

interface UserCharacterTask {
  id: number;
  character_id: number;
  task_description: string;
  target_item_id: number | null;
  target_item_name: string | null;
  target_quantity: number;
  current_quantity: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface Item {
  id: number;
  name: string;
}

export default function CharacterTasksTab() {
  console.debug('CharacterTasksTab: Entering component');
  const { selectedCharacter } = useCharacterSelection();
  const [tasks, setTasks] = useState<UserCharacterTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskTargetItem, setNewTaskTargetItem] = useState('');
  const [newTaskTargetQuantity, setNewTaskTargetQuantity] = useState<number>(0);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedTargetItem, setSelectedTargetItem] = useState<Item | null>(null);
  const { toast } = useToast();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    console.debug('CharacterTasksTab: useEffect triggered');
    const fetchTasksAndItems = async () => {
      console.debug('fetchTasksAndItems: Entering function');
      if (!selectedCharacter || selectedCharacter.id === undefined) {
        console.debug('fetchTasksAndItems: No character selected or character ID is undefined, skipping fetch');
        setTasks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.debug('fetchTasksAndItems: Attempting to fetch tasks for character:', selectedCharacter.id);
        const tasksResponse = await fetch(`${BASE_URL}/api/user-character-tasks/${selectedCharacter.id}`);
        console.debug('fetchTasksAndItems: Tasks fetch response received');
        if (!tasksResponse.ok) {
          const errorData = await tasksResponse.json();
          console.error('fetchTasksAndItems: Failed to fetch tasks:', tasksResponse.status, errorData);
          throw new Error(`Failed to fetch tasks: ${errorData.message || tasksResponse.statusText}`);
        }
        const tasksData: UserCharacterTask[] = await tasksResponse.json();
        console.debug('fetchTasksAndItems: Tasks data parsed:', tasksData);
        setTasks(tasksData);

        console.debug('fetchTasksAndItems: Attempting to fetch all items');
        const itemsResponse = await fetch(`${BASE_URL}/items`);
        console.debug('fetchTasksAndItems: Items fetch response received');
        if (!itemsResponse.ok) {
          const errorData = await itemsResponse.json();
          console.error('fetchTasksAndItems: Failed to fetch items:', itemsResponse.status, errorData);
          throw new Error(`Failed to fetch items: ${errorData.message || itemsResponse.statusText}`);
        }
        const itemsData: Item[] = await itemsResponse.json();
        console.debug('fetchTasksAndItems: Items data parsed:', itemsData);
        setAvailableItems(itemsData);
        setFilteredItems(itemsData);

      } catch (error: any) {
        console.error('fetchTasksAndItems: Error during fetch operations:', error);
        setError(error.message);
        toast({
          title: '데이터 로딩 오류',
          description: `캐릭터 작업 또는 아이템 목록을 불러오는 데 실패했습니다: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        console.debug('fetchTasksAndItems: Exiting function (finally block)');
      }
    };

    fetchTasksAndItems();
    console.debug('CharacterTasksTab: useEffect ended');
  }, [selectedCharacter, BASE_URL, toast]);

  const handleSearchItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.debug('handleSearchItem: Entering function');
    const query = e.target.value;
    console.debug('handleSearchItem: Search query:', query);
    setNewTaskTargetItem(query);
    if (query) {
      const filtered = availableItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      console.debug('handleSearchItem: Filtered items:', filtered);
      setFilteredItems(filtered);
    } else {
      console.debug('handleSearchItem: Empty query, showing all available items');
      setFilteredItems(availableItems);
    }
    console.debug('handleSearchItem: Exiting function');
  };

  const handleSelectItem = (item: Item) => {
    console.debug('handleSelectItem: Entering function', item);
    setSelectedTargetItem(item);
    setNewTaskTargetItem(item.name);
    setFilteredItems([]); // Close dropdown
    console.debug('handleSelectItem: Exiting function');
  };

  const handleAddTask = async () => {
    console.debug('handleAddTask: Entering function');
    if (!selectedCharacter || selectedCharacter.id === undefined) {
      console.warn('handleAddTask: No character selected or character ID is undefined');
      toast({
        title: '캐릭터 선택 필요',
        description: '작업을 추가하려면 먼저 캐릭터를 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (!newTaskDescription.trim()) {
      console.warn('handleAddTask: Task description is empty');
      toast({
        title: '작업 설명 필요',
        description: '작업 설명을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    console.debug('handleAddTask: Attempting to add task', { newTaskDescription, selectedTargetItem, newTaskTargetQuantity });

    try {
      const response = await fetch(`${BASE_URL}/api/user-character-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character_id: selectedCharacter.id,
          task_description: newTaskDescription.trim(),
          target_item_id: selectedTargetItem?.id || null,
          target_quantity: newTaskTargetQuantity || 0,
        }),
      });
      console.debug('handleAddTask: Add task response received');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('handleAddTask: Failed to add task:', response.status, errorData);
        throw new Error(`Failed to add task: ${errorData.message || response.statusText}`);
      }

      const newTask = await response.json();
      console.debug('handleAddTask: New task added successfully:', newTask);
      // Re-fetch tasks to get the latest list including the newly added one
      const tasksResponse = await fetch(`${BASE_URL}/api/user-character-tasks/${selectedCharacter.id}`);
      const updatedTasks: UserCharacterTask[] = await tasksResponse.json();
      setTasks(updatedTasks);

      toast({
        title: '작업 추가 성공',
        description: '새로운 작업이 성공적으로 추가되었습니다.',
      });
      setNewTaskDescription('');
      setNewTaskTargetItem('');
      setNewTaskTargetQuantity(0);
      setSelectedTargetItem(null);
      setIsAddTaskDialogOpen(false);
    } catch (error: any) {
      console.error('handleAddTask: Error adding task:', error);
      setError(error.message);
      toast({
        title: '작업 추가 오류',
        description: `작업을 추가하는 데 실패했습니다: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      console.debug('handleAddTask: Exiting function');
    }
  };

  const handleUpdateQuantity = async (taskId: number, newQuantity: number) => {
    console.debug('handleUpdateQuantity: Entering function', { taskId, newQuantity });
    if (newQuantity < 0) {
      console.warn('handleUpdateQuantity: Quantity cannot be negative');
      toast({
        title: '수량 오류',
        description: '현재 수량은 0 미만이 될 수 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (taskToUpdate && newQuantity > taskToUpdate.target_quantity && taskToUpdate.target_quantity > 0) {
      console.warn('handleUpdateQuantity: Current quantity exceeds target quantity');
      toast({
        title: '수량 초과',
        description: '현재 수량은 목표 수량을 초과할 수 없습니다.',
        variant: 'default',
      });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/user-character-tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ current_quantity: newQuantity }),
      });
      console.debug('handleUpdateQuantity: Update quantity response received');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('handleUpdateQuantity: Failed to update quantity:', response.status, errorData);
        throw new Error(`Failed to update quantity: ${errorData.message || response.statusText}`);
      }

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, current_quantity: newQuantity } : task
        )
      );
      console.debug('handleUpdateQuantity: Task quantity updated successfully');
      toast({
        title: '수량 업데이트 성공',
        description: '작업 수량이 성공적으로 업데이트되었습니다.',
      });
    } catch (error: any) {
      console.error('handleUpdateQuantity: Error updating quantity:', error);
      setError(error.message);
      toast({
        title: '수량 업데이트 오류',
        description: `수량 업데이트에 실패했습니다: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      console.debug('handleUpdateQuantity: Exiting function');
    }
  };

  const handleToggleCompletion = async (taskId: number, is_completed: boolean) => {
    console.debug('handleToggleCompletion: Entering function', { taskId, is_completed });
    try {
      const response = await fetch(`${BASE_URL}/api/user-character-tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed: is_completed }),
      });
      console.debug('handleToggleCompletion: Toggle completion response received');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('handleToggleCompletion: Failed to toggle completion:', response.status, errorData);
        throw new Error(`Failed to toggle completion: ${errorData.message || response.statusText}`);
      }

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, is_completed: is_completed } : task
        )
      );
      console.debug('handleToggleCompletion: Task completion toggled successfully');
      toast({
        title: '완료 상태 업데이트 성공',
        description: '작업 완료 상태가 성공적으로 업데이트되었습니다.',
      });
    } catch (error: any) {
      console.error('handleToggleCompletion: Error toggling completion:', error);
      setError(error.message);
      toast({
        title: '완료 상태 업데이트 오류',
        description: `완료 상태 업데이트에 실패했습니다: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      console.debug('handleToggleCompletion: Exiting function');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    console.debug('handleDeleteTask: Entering function', { taskId });
    try {
      const response = await fetch(`${BASE_URL}/api/user-character-tasks/${taskId}`, {
        method: 'DELETE',
      });
      console.debug('handleDeleteTask: Delete task response received');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('handleDeleteTask: Failed to delete task:', response.status, errorData);
        throw new Error(`Failed to delete task: ${errorData.message || response.statusText}`);
      }

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      console.debug('handleDeleteTask: Task deleted successfully');
      toast({
        title: '작업 삭제 성공',
        description: '작업이 성공적으로 삭제되었습니다.',
      });
    } catch (error: any) {
      console.error('handleDeleteTask: Error deleting task:', error);
      setError(error.message);
      toast({
        title: '작업 삭제 오류',
        description: `작업 삭제에 실패했습니다: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      console.debug('handleDeleteTask: Exiting function');
    }
  };

  if (isLoading) {
    console.debug('CharacterTasksTab: Displaying loading state');
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (error) {
    console.debug('CharacterTasksTab: Displaying error state', error);
    return <div className="text-center py-8 text-red-500">오류: {error}</div>;
  }

  if (!selectedCharacter || selectedCharacter.id === undefined) {
    console.debug('CharacterTasksTab: Displaying no character selected state or character ID is undefined');
    return (
      <div className="text-center py-8">
        <p>캐릭터를 선택해주세요.</p>
        <p>서버 및 캐릭터 탭에서 캐릭터를 선택하거나 생성할 수 있습니다.</p>
      </div>
    );
  }

  console.debug('CharacterTasksTab: Rendering main component with tasks', tasks);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">내 작업 목록</h2>
        <Button onClick={() => {
          console.debug('CharacterTasksTab: Open add task dialog button clicked');
          setIsAddTaskDialogOpen(true);
          // Reset form fields when opening dialog
          setNewTaskDescription('');
          setNewTaskTargetItem('');
          setNewTaskTargetQuantity(0);
          setSelectedTargetItem(null);
          setFilteredItems(availableItems); // Show all items initially
        }}>
              작업 추가
            </Button>
          </div>

      {tasks.length === 0 ? (
        <p className="text-center py-8">아직 등록된 작업이 없습니다. 새로운 작업을 추가해보세요!</p>
      ) : (
        <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead className="w-[50px]">완료</TableHead>
                <TableHead>작업 설명</TableHead>
                <TableHead>목표 아이템</TableHead>
                <TableHead>현재/목표 수량</TableHead>
                <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {tasks.map(task => (
                <TableRow key={task.id} className={task.is_completed ? "bg-green-100 dark:bg-green-900" : ""}>
                    <TableCell>
                      <Checkbox 
                      checked={task.is_completed}
                      onCheckedChange={(checked: boolean) => {
                        console.debug('CharacterTasksTab: Checkbox changed for task:', task.id, 'new state:', checked);
                        handleToggleCompletion(task.id, checked);
                      }}
                      />
                    </TableCell>
                  <TableCell>{task.task_description}</TableCell>
                  <TableCell>{task.target_item_name || '-'}</TableCell>
                    <TableCell>
                    {task.target_item_id ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(task.id, Math.max(0, task.current_quantity - 1))}
                          disabled={task.current_quantity <= 0}
                        >
                          <MinusCircledIcon className="h-4 w-4" />
                        </Button>
                        <span>{task.current_quantity} / {task.target_quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(task.id, task.current_quantity + 1)}
                          disabled={task.current_quantity >= task.target_quantity && task.target_quantity > 0}
                        >
                          <PlusCircledIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                      <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      )}

      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>새 작업 추가</DialogTitle>
            <DialogDescription>
              새로운 사용자 지정 작업을 여기에 추가하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskDescription" className="text-right">
                작업 설명
              </Label>
              <Input
                id="taskDescription"
                value={newTaskDescription}
                onChange={(e) => {
                  console.debug('CharacterTasksTab: New task description changed:', e.target.value);
                  setNewTaskDescription(e.target.value);
                }}
                className="col-span-3"
                placeholder="예: 낚시 100회 하기, 나무 1000개 모으기"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 relative">
              <Label htmlFor="targetItem" className="text-right">
                목표 아이템
              </Label>
              <Input
                id="targetItem"
                value={newTaskTargetItem}
                onChange={handleSearchItem}
                className="col-span-3"
                placeholder="아이템 이름 (선택 사항)"
                onFocus={() => setFilteredItems(availableItems)} // Show all items on focus
                onBlur={() => setTimeout(() => setFilteredItems([]), 200)} // Hide after a short delay
              />
              {newTaskTargetItem && filteredItems.length > 0 && (
                <ul className="absolute z-10 w-full bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto mt-2 top-full left-0 col-span-4 ">
                  {filteredItems.map(item => (
                    <li
                      key={item.id}
                      className="px-4 py-2 cursor-pointer hover:bg-accent"
                      onClick={() => handleSelectItem(item)}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedTargetItem && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="targetQuantity" className="text-right">
                  목표 수량
                </Label>
                <Input
                  id="targetQuantity"
                  type="number"
                  value={newTaskTargetQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    console.debug('CharacterTasksTab: New task target quantity changed:', value);
                    setNewTaskTargetQuantity(isNaN(value) ? 0 : value);
                  }}
                  className="col-span-3"
                  min="0"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddTask}>작업 추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
  );
}
