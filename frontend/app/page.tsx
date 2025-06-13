"use client"

import ServerCharacterTab from "@/components/server-character-tab"

export default function Home() {
  console.debug('Home 컴포넌트 렌더링 시작');
  // ServerCharacterTab 컴포넌트가 렌더링됩니다.
  console.debug('ServerCharacterTab 컴포넌트를 렌더링합니다.');
  return (
    <ServerCharacterTab />
  )
  // console.debug('Home 컴포넌트 렌더링 완료'); // JSX 반환 후에는 이 코드가 실행되지 않습니다.
}
