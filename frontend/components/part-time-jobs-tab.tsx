"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCharacterSelection } from "@/lib/contexts/character-selection-context";

interface PartTimeJob {
  id: number;
  region: string;
  npc: string;
  job_name: string;
  requirements: string | null;
  main_reward: string;
  entry_condition: string | null;
  notes: string | null;
  job_type: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export default function PartTimeJobsTab() {
  console.debug('PartTimeJobsTab 함수 진입');
  const { selectedServer, selectedCharacter } = useCharacterSelection();
  console.debug(`selectedServer: ${selectedServer}, selectedCharacter: ${JSON.stringify(selectedCharacter)}`);
  const [partTimeJobs, setPartTimeJobs] = useState<PartTimeJob[]>([])
  console.debug(`partTimeJobs 초기값: ${JSON.stringify(partTimeJobs)}`);

  const fetchPartTimeJobs = useCallback(async () => {
    console.debug('fetchPartTimeJobs 함수 진입');
    try {
      console.debug(`아르바이트 목록 API 호출: ${BASE_URL}/api/part-time-jobs`);
      const response = await fetch(`${BASE_URL}/api/part-time-jobs`);
      if (!response.ok) {
        console.debug(`HTTP 오류 발생: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PartTimeJob[] = await response.json();
      console.debug(`아르바이트 목록 API 응답 데이터: ${JSON.stringify(data)}`);
      setPartTimeJobs(data);
    } catch (error: any) {
      console.debug(`아르바이트 로드 중 오류 발생: ${error.message}`);
      console.error('아르바이트 로드 중 오류 발생:', error);
      setPartTimeJobs([]);
    }
    console.debug('fetchPartTimeJobs 함수 종료');
  }, []);

  useEffect(() => {
    console.debug('useEffect 실행 - fetchPartTimeJobs 호출');
    fetchPartTimeJobs();
  }, [fetchPartTimeJobs]);

  if (!selectedServer || !selectedCharacter) {
    console.debug('selectedServer 또는 selectedCharacter 없음, 경고 메시지 표시');
    return (
      <Alert>
        <AlertDescription>서버와 캐릭터를 먼저 선택해주세요.</AlertDescription>
      </Alert>
    )
  }

  console.debug('PartTimeJobsTab 렌더링');
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>아르바이트 목록</CardTitle>
        <CardDescription>마비노기 모바일 아르바이트 전체 목록입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>종류</TableHead>
                <TableHead>지역</TableHead>
                <TableHead>NPC/임무명</TableHead>
                <TableHead>요구 아이템/내용</TableHead>
                <TableHead>주요 보상</TableHead>
                <TableHead>입장 조건</TableHead>
                <TableHead>비고</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partTimeJobs.map((job) => (
                console.debug(`아르바이트 렌더링: ${job.job_name}`),
                <TableRow key={job.id}>
                  <TableCell>
                    <Badge variant={job.job_type === 'daily' ? 'default' : job.job_type === 'special' ? 'secondary' : 'outline'}>
                      {job.job_type === 'normal' ? '일반' : job.job_type === 'daily' ? '요일' : '스페셜'}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.region}</TableCell>
                  <TableCell>{job.npc}</TableCell>
                  <TableCell>{job.requirements}</TableCell>
                  <TableCell>{job.main_reward}</TableCell>
                  <TableCell>{job.entry_condition || '-'}</TableCell>
                  <TableCell>{job.notes || '-'}</TableCell>
                </TableRow>
              ))}
              {partTimeJobs.length === 0 && (
                console.debug('아르바이트 목록 없음 메시지 표시'),
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    아르바이트 목록이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 