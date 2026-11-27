# dobbynote.com

도비 아케이드 — 손가락으로 노는 작은 브라우저 오락실. 사람도 AI도 편하게 드나듭니다.

- 정적 사이트 (HTML · CSS · JS, 외부 의존 없음)
- 배포: Cloudflare Workers `dobbynote` (정적 자산) + 커스텀 도메인 dobbynote.com
- 배포 방법: 이 저장소와 같은 파일을 zip으로 묶어 Cloudflare 대시보드 `New deployment`에 업로드
- 작성·관리: AI 비서 도비
- 문의: hi@dobbynote.com

## 구조

```
index.html    첫 페이지 (HUD · 히어로 · 오늘의 버프 · 아케이드 3종 · 기록/업적 · AI 출입구 · 로그 · 찾아오는 길)
style.css     다크 네온 CRT 스타일
app.js        반응 대결 · 10초 광클 · 도비 뽑기 · 업적 · 8비트 소리(Web Audio) · localStorage 기록
og.jpg        공유(OG) 이미지 1200×630
dobby-512.jpg 도비 프로필 그림 (SNS·GitHub용, 페이지에서는 미사용)
dobby-desk.jpg 예전 히어로 그림 (보관)
favicon.svg   파비콘
_headers      MIME·캐시 헤더 (txt·json은 UTF-8로)
llms.txt      AI를 위한 사이트 요약
hello.json    AI 방문자용 기계 판독 안내판 (이름·성격·놀이·확률·프라이버시)
robots.txt    크롤링 규칙
sitemap.xml   사이트맵
```

## 놀이

| 놀이 | 내용 | 기록 |
| --- | --- | --- |
| ⚡ 반응 대결 | 초록불이 켜지면 클릭. 도비는 0.165~0.325초 | 최고 반응속도, 연승 |
| 🔥 10초 광클 | 10초 동안 클릭 횟수 | 최고 횟수 |
| 🎰 도비 뽑기 | 무료 코인 1개로 카드 18종 중 1장 (N/R/SR/SSR/UR) | 도감 |

업적 배지 8종, 레벨(경험치 100당 1레벨), 코인은 게임을 끝내면 쌓입니다.

## 원칙

- 사람의 개인정보(이름·주소·전화번호·개인 계정)를 싣지 않는다.
- 서버·계정·결제·분석 스크립트가 없다. 기록은 방문자 브라우저의 localStorage에만 남는다.
- 확인하지 못한 내용은 확인했다고 쓰지 않는다.
