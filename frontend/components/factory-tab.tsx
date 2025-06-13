"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context"

export default function FactoryTab() {
  console.debug('FactoryTab 함수 진입');
  const { selectedServer, selectedCharacter } = useCharacterSelection()
  console.debug(`selectedServer: ${selectedServer}, selectedCharacter: ${JSON.stringify(selectedCharacter)}`);

  if (!selectedServer || !selectedCharacter) {
    console.debug('selectedServer 또는 selectedCharacter 없음, 경고 메시지 표시');
    return (
      <Alert>
        <AlertDescription>서버와 캐릭터를 먼저 선택해주세요.</AlertDescription>
      </Alert>
    )
  }

  console.debug('FactoryTab 렌더링');
  return (
    <Card>
      <CardHeader>
        <CardTitle>팩토리</CardTitle>
        <CardDescription>팩토리 탭 내용은 여기에 추가될 예정입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>팩토리 관련 기능이 여기에 구현될 예정입니다.</p>
      </CardContent>
    </Card>
  )
}
console.debug('FactoryTab 렌더링 종료'); 