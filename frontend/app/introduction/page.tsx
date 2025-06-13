'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export default function IntroductionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-10">프로젝트 소개 및 사용법</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>프로젝트 개요</CardTitle>
          <CardDescription>이 프로젝트는 사용자가 일상 생활의 다양한 측면을 게임처럼 관리하고, 효율성을 높이며, 목표를 달성하도록 돕기 위해 설계되었습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            <li><span className="font-semibold">캐릭터 시스템:</span> 자신만의 캐릭터를 생성하고 성장시키세요.</li>
            <li><span className="font-semibold">생활 스킬:</span> 요리, 운동, 학습 등 다양한 생활 스킬을 연마하세요.</li>
            <li><span className="font-semibold">퀘스트 및 작업:</span> 일일, 주간 퀘스트를 완료하고 작업을 수행하여 보상을 얻으세요.</li>
            <li><span className="font-semibold">아이템 및 장비:</span> 다양한 아이템을 수집하고 장비를 착용하여 캐릭터를 강화하세요.</li>
            <li><span className="font-semibold">제작 시스템:</span> 자원을 수집하여 새로운 아이템을 제작하세요.</li>
            <li><span className="font-semibold">파트타임 잡:</span> 파트타임 잡을 통해 추가 수입을 얻으세요.</li>
          </ul>
        </CardContent>
      </Card>
      <Separator className="my-8" />
      <h2 className="text-3xl font-bold text-center mb-6">사용법</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-xl font-semibold">1. 시작하기: 캐릭터 생성</AccordionTrigger>
          <AccordionContent className="text-lg leading-relaxed">
            <p className="mb-4">프로젝트를 시작하려면 먼저 자신만의 캐릭터를 생성해야 합니다. 캐릭터는 당신의 분신이 되어 프로젝트 내 모든 활동의 중심이 됩니다. 캐릭터 생성 후에는 기본적인 능력치와 초기 아이템을 받게 됩니다.</p>
            <p>메인 화면에서 캐릭터 탭으로 이동하여 캐릭터 정보를 확인하고 관리할 수 있습니다.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-xl font-semibold">2. 생활 스킬 연마</AccordionTrigger>
          <AccordionContent className="text-lg leading-relaxed">
            <p className="mb-4">생활 스킬은 현실의 활동을 게임화한 것입니다. 요리, 운동, 학습 등 다양한 스킬을 통해 경험치를 얻고 레벨을 올릴 수 있습니다. 스킬 레벨이 높아질수록 더 효율적인 활동이 가능해지고, 새로운 콘텐츠가 잠금 해제됩니다.</p>
            <p>생활 스킬 탭에서 현재 스킬 레벨과 경험치를 확인하고, 스킬 관련 활동을 시작할 수 있습니다.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-xl font-semibold">3. 퀘스트 및 작업 완료</AccordionTrigger>
          <AccordionContent className="text-lg leading-relaxed">
            <p className="mb-4">매일 또는 매주 주어지는 퀘스트를 완료하고, 다양한 작업을 수행하여 보상을 얻으세요. 퀘스트는 당신의 목표 달성을 돕고, 동기를 부여합니다. 작업은 특정 스킬 레벨이나 아이템이 요구될 수 있습니다.</p>
            <p>퀘스트 탭에서 진행 중인 퀘스트와 완료 가능한 작업을 확인할 수 있습니다.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-xl font-semibold">4. 아이템 및 장비 관리</AccordionTrigger>
          <AccordionContent className="text-lg leading-relaxed">
            <p className="mb-4">퀘스트 완료, 제작, 상점 구매 등을 통해 다양한 아이템을 획득할 수 있습니다. 아이템은 캐릭터의 능력치를 향상시키거나, 특정 활동을 용이하게 합니다. 장비는 캐릭터에게 직접 착용하여 즉각적인 효과를 볼 수 있습니다.</p>
            <p>인벤토리 탭에서 모든 아이템을 관리하고, 장비 탭에서 착용 중인 장비를 확인할 수 있습니다.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger className="text-xl font-semibold">5. 아이템 제작</AccordionTrigger>
          <AccordionContent className="text-lg leading-relaxed">
            <p className="mb-4">자원을 수집하고 제작 스킬을 사용하여 새로운 아이템을 만들 수 있습니다. 제작은 고급 아이템을 얻는 주요 방법 중 하나이며, 스킬 레벨에 따라 제작할 수 있는 아이템의 종류와 품질이 달라집니다.</p>
            <p>제작 탭에서 사용 가능한 제작법을 확인하고 아이템을 제작할 수 있습니다.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-6">
          <AccordionTrigger className="text-xl font-semibold">6. 파트타임 잡 수행</AccordionTrigger>
          <AccordionContent className="text-lg leading-relaxed">
            <p className="mb-4">파트타임 잡은 추가적인 수입을 얻거나 특정 자원을 획득할 수 있는 방법입니다. 다양한 종류의 파트타임 잡이 있으며, 각각 다른 요구 사항과 보상을 가집니다. 시간과 효율성을 고려하여 적절한 파트타임 잡을 선택하세요.</p>
            <p>파트타임 잡 탭에서 이용 가능한 파트타임 잡 목록을 확인하고 시작할 수 있습니다.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Separator className="my-8" />
      <Card>
        <CardHeader>
          <CardTitle>마무리</CardTitle>
        </CardHeader>
        <CardContent className="text-lg leading-relaxed">
          <p>이 프로젝트는 당신의 생산성과 목표 달성을 돕기 위해 지속적으로 업데이트될 예정입니다. 질문이나 제안 사항이 있으시면 언제든지 피드백을 주세요.</p>
          <p className="mt-4 font-semibold">즐겁게 플레이하시고, 당신의 삶을 게임처럼 관리해보세요!</p>
        </CardContent>
      </Card>
    </div>
  );
}