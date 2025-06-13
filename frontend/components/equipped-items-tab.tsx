"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axios from "axios"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"

interface EquipmentSlot {
  slot: string;
  slotName: string;
  equipment: EquipmentItem | null;
  runes: Rune[];
  gems: Gem[];
}

interface EquipmentItem {
  id: number;
  name: string;
  type: string; // e.g., "weapon", "armor", "accessory"
  // Add other properties as needed based on API response (base_stats, description, etc.)
}

interface Rune {
  id: number;
  name: string;
  // Add other properties as needed (bonus_options, grade, etc.)
}

interface Gem {
  id: number;
  name: string;
  // Add other properties as needed (bonus_options, grade, etc.)
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

const EquippedItemsTab: React.FC = () => {
  console.debug("EquippedItemsTab: Component mounted.")
  const { selectedCharacter } = useCharacterSelection()
  const [equipmentData, setEquipmentData] = useState<EquipmentSlot[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null)
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
  const [availableItems, setAvailableItems] = useState<EquipmentItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [itemTypeFilter, setItemTypeFilter] = useState("all")

  useEffect(() => {
    console.debug("EquippedItemsTab: useEffect for fetching equipment data triggered.")
    if (selectedCharacter?.id) {
      fetchCharacterEquipment(selectedCharacter.id)
    } else {
      setError("캐릭터가 선택되지 않았습니다.")
      setIsLoading(false)
    }
  }, [selectedCharacter])

  const fetchCharacterEquipment = async (characterId: number) => {
    console.debug(`EquippedItemsTab: Fetching character equipment for characterId: ${characterId}`)
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${BASE_URL}/equipment/characters/${characterId}/equipment`)
      console.debug("EquippedItemsTab: Character equipment data fetched successfully.", response.data)
      setEquipmentData(response.data.equipment)
    } catch (err) {
      console.error("EquippedItemsTab: Failed to fetch character equipment:", err)
      setError("장비 정보를 불러오는 데 실패했습니다.")
    } finally {
      setIsLoading(false)
      console.debug("EquippedItemsTab: fetchCharacterEquipment function finished.")
    }
  }

  const fetchAvailableItems = async (slotType: string) => {
    console.debug(`EquippedItemsTab: Fetching available items for slot type: ${slotType}`)
    try {
      // For now, fetch all equipments. In a real app, filter by allowed_equipment_item_type_id from slot.
      const response = await axios.get(`${BASE_URL}/equipment`)
      console.debug("EquippedItemsTab: Available items fetched successfully.", response.data)
      // Further filter by slotType if needed, or rely on backend to filter
      const filteredItems = response.data.filter((item: EquipmentItem) => {
        if (slotType === 'all' || !item.type) return true // No type info or all items
        // Simplified mapping for now, assuming item.type matches slot.allowed_equipment_item_type_name
        const typeMap: { [key: string]: string } = {
          'HEAD': 'armor',
          'CHEST': 'armor',
          'WEAPON': 'weapon',
          'OFF_HAND': 'weapon_shield',
          'NECKLACE': 'accessory',
          'RING1': 'accessory',
          'RING2': 'accessory',
          // ... add more as needed
        }
        return item.type === typeMap[selectedSlot?.slot || ''] || item.type === slotType
      })
      setAvailableItems(filteredItems)
    } catch (err) {
      console.error("EquippedItemsTab: Failed to fetch available items:", err)
      setError("장착 가능한 아이템을 불러오는 데 실패했습니다.")
    }
  }

  const handleSlotClick = (slot: EquipmentSlot) => {
    console.debug("EquippedItemsTab: Slot clicked.", slot)
    setSelectedSlot(slot)
    setIsSelectionModalOpen(true)
    fetchAvailableItems(slot.slot) // Pass slot name for potential filtering
  }

  const handleEquipItem = async (equipmentId: number | null) => {
    console.debug(`EquippedItemsTab: Attempting to equip item. slot: ${selectedSlot?.slot}, equipmentId: ${equipmentId}`)
    if (!selectedCharacter || !selectedSlot) {
      console.debug("EquippedItemsTab: No character or slot selected for equipping.")
      return
    }

    try {
      const url = `${BASE_URL}/equipment/characters/${selectedCharacter.id}/equipment/${selectedSlot.slot}`
      const response = await axios.put(url, { equipmentId })
      console.debug("EquippedItemsTab: Equip item API response.", response.data)
      // Refresh the equipment data
      fetchCharacterEquipment(selectedCharacter.id)
      setIsSelectionModalOpen(false)
    } catch (err) {
      console.error("EquippedItemsTab: Failed to equip item:", err)
      setError("장비 장착/변경에 실패했습니다.")
    }
  }

  const handleAddRune = async (runeId: number) => {
    console.debug(`EquippedItemsTab: Attempting to add rune. char_equip_id: ${selectedSlot?.equipment?.id}, runeId: ${runeId}`)
    if (!selectedCharacter || !selectedSlot || !selectedSlot.equipment) return
    try {
      const url = `${BASE_URL}/equipment/characters/${selectedCharacter.id}/equipment/${selectedSlot.slot}/rune`
      await axios.post(url, { runeId })
      console.debug("EquippedItemsTab: Rune added successfully.")
      fetchCharacterEquipment(selectedCharacter.id) // Refresh data
    } catch (err) {
      console.error("EquippedItemsTab: Failed to add rune:", err)
      setError("룬 삽입에 실패했습니다.")
    }
  }

  const handleRemoveRune = async (runeId: number) => {
    console.debug(`EquippedItemsTab: Attempting to remove rune. char_equip_id: ${selectedSlot?.equipment?.id}, runeId: ${runeId}`)
    if (!selectedCharacter || !selectedSlot || !selectedSlot.equipment) return
    try {
      const url = `${BASE_URL}/equipment/characters/${selectedCharacter.id}/equipment/${selectedSlot.slot}/rune/${runeId}`
      await axios.delete(url)
      console.debug("EquippedItemsTab: Rune removed successfully.")
      fetchCharacterEquipment(selectedCharacter.id) // Refresh data
    } catch (err) {
      console.error("EquippedItemsTab: Failed to remove rune:", err)
      setError("룬 제거에 실패했습니다.")
    }
  }

  const handleAddGem = async (gemId: number) => {
    console.debug(`EquippedItemsTab: Attempting to add gem. char_equip_id: ${selectedSlot?.equipment?.id}, gemId: ${gemId}`)
    if (!selectedCharacter || !selectedSlot || !selectedSlot.equipment) return
    try {
      const url = `${BASE_URL}/equipment/characters/${selectedCharacter.id}/equipment/${selectedSlot.slot}/gem`
      await axios.post(url, { gemId })
      console.debug("EquippedItemsTab: Gem added successfully.")
      fetchCharacterEquipment(selectedCharacter.id) // Refresh data
    } catch (err) {
      console.error("EquippedItemsTab: Failed to add gem:", err)
      setError("보석 삽입에 실패했습니다.")
    }
  }

  const handleRemoveGem = async (gemId: number) => {
    console.debug(`EquippedItemsTab: Attempting to remove gem. char_equip_id: ${selectedSlot?.equipment?.id}, gemId: ${gemId}`)
    if (!selectedCharacter || !selectedSlot || !selectedSlot.equipment) return
    try {
      const url = `${BASE_URL}/equipment/characters/${selectedCharacter.id}/equipment/${selectedSlot.slot}/gem/${gemId}`
      await axios.delete(url)
      console.debug("EquippedItemsTab: Gem removed successfully.")
      fetchCharacterEquipment(selectedCharacter.id) // Refresh data
    } catch (err) {
      console.error("EquippedItemsTab: Failed to remove gem:", err)
      setError("보석 제거에 실패했습니다.")
    }
  }

  const filteredAvailableItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (itemTypeFilter === "all" || item.type === itemTypeFilter)
  )

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-2xl font-bold mb-4">캐릭터 장비 관리</h2>
      {isLoading ? (
        <p>장비 정보를 불러오는 중...</p>
      ) : error ? (
        <p className="text-red-500">오류: {error}</p>
      ) : !selectedCharacter?.id ? (
        <p>캐릭터를 선택해주세요.</p>
      ) : (
        <div className="flex flex-grow bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-inner">
          {/* 캐릭터 표시 영역 및 장비 슬롯 */}
          <div className="relative w-1/2 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
            <img src="/placeholder-character.png" alt="캐릭터 아바타" className="max-w-full h-auto opacity-70" />
            {equipmentData.map((slotInfo) => (
              <Button
                key={slotInfo.slot}
                variant="outline"
                className="absolute w-20 h-20 rounded-full flex items-center justify-center p-1 border-2 border-dashed border-gray-400 dark:border-gray-500 hover:border-blue-500 transition-colors"
                style={{
                  // Placeholder for dynamic positioning based on slot type or predefined coordinates
                  // This would typically come from a config or backend for a real game UI
                  top: slotInfo.slot === 'HEAD' ? '10%' :
                       slotInfo.slot === 'WEAPON' ? '50%' :
                       slotInfo.slot === 'CHEST' ? '30%' :
                       slotInfo.slot === 'RING1' ? '70%' : 'auto',
                  left: slotInfo.slot === 'HEAD' ? '40%' :
                        slotInfo.slot === 'WEAPON' ? '20%' :
                        slotInfo.slot === 'CHEST' ? '40%' :
                        slotInfo.slot === 'RING1' ? '60%' : 'auto',
                }}
                onClick={() => handleSlotClick(slotInfo)}
              >
                {slotInfo.equipment ? (
                  <img src={`/icons/${slotInfo.equipment.type}.png`} alt={slotInfo.equipment.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-3xl">+</span>
                )}
                <span className="absolute bottom-1 text-xs bg-black bg-opacity-50 text-white px-1 rounded">{slotInfo.slotName}</span>
              </Button>
            ))}
          </div>

          {/* 아이템 상세/변경 패널 */}
          <div className="w-1/2 ml-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            {selectedSlot ? (
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {selectedSlot.slotName} 슬롯 상세 정보
                </h3>
                {selectedSlot.equipment ? (
                  <div className="border p-3 rounded-md mb-4 bg-gray-50 dark:bg-gray-850">
                    <p className="font-medium text-lg">{selectedSlot.equipment.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      종류: {selectedSlot.equipment.type}
                    </p>
                    {/* Add more item details like stats, description here */}
                    <div className="mt-2">
                      <p className="font-medium">장착된 룬:</p>
                      {selectedSlot.runes.length > 0 ? (
                        selectedSlot.runes.map((rune) => (
                          <div key={rune.id} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-700 p-1 rounded mt-1">
                            <span>{rune.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveRune(rune.id)}>제거</Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">룬 없음</p>
                      )}
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => { /* Open rune selection modal */ }}>룬 추가</Button>
                    </div>
                    <div className="mt-2">
                      <p className="font-medium">장착된 보석:</p>
                      {selectedSlot.gems.length > 0 ? (
                        selectedSlot.gems.map((gem) => (
                          <div key={gem.id} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-700 p-1 rounded mt-1">
                            <span>{gem.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveGem(gem.id)}>제거</Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">보석 없음</p>
                      )}
                       <Button variant="outline" size="sm" className="mt-2" onClick={() => { /* Open gem selection modal */ }}>보석 추가</Button>
                    </div>
                    <Button
                      variant="destructive"
                      className="mt-4 w-full"
                      onClick={() => handleEquipItem(null)}
                    >
                      장비 해제
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    이 슬롯에 장비가 장착되지 않았습니다.
                  </p>
                )}
                <Button className="w-full mt-2" onClick={() => {
                  fetchAvailableItems(selectedSlot.slot);
                  setIsSelectionModalOpen(true);
                  }}>
                  {selectedSlot.equipment ? "장비 교체" : "장비 장착"}
                </Button>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                슬롯을 클릭하여 상세 정보를 확인하세요.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 아이템 선택/검색 창 모달 */}
      <Dialog open={isSelectionModalOpen} onOpenChange={setIsSelectionModalOpen}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedSlot?.slotName} 슬롯 아이템 선택</DialogTitle>
          </DialogHeader>
          <div className="flex-none mb-4">
            <Input
              placeholder="아이템 이름 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                console.debug(`EquippedItemsTab: Search query updated to: ${e.target.value}`);
              }}
              className="mb-2"
            />
            <Select onValueChange={(value) => {
              setItemTypeFilter(value);
              console.debug(`EquippedItemsTab: Item type filter updated to: ${value}`);
            }} value={itemTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="아이템 종류 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 종류</SelectItem>
                <SelectItem value="weapon">무기</SelectItem>
                <SelectItem value="armor">방어구</SelectItem>
                <SelectItem value="accessory">장신구</SelectItem>
                {/* Add more types based on your equipment_types table */}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="flex-grow">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
              {filteredAvailableItems.map((item) => (
                <div
                  key={item.id}
                  className="border p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center text-center"
                  onClick={() => handleEquipItem(item.id)}
                >
                  <img src={`/icons/${item.type || 'default'}.png`} alt={item.name} className="w-16 h-16 object-contain mb-2" />
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.type}</p>
                  {/* Add item grade/color based on design */}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end flex-none mt-4">
            <Button variant="outline" onClick={() => setIsSelectionModalOpen(false)}>닫기</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquippedItemsTab; 