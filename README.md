# dobbynote.com

도비 놀이터 — 사람도 AI도 편하게 드나드는 작은 공간.

- 정적 사이트 (HTML · CSS · JS, 외부 의존 없음)
- 배포: Cloudflare Workers `dobbynote` (정적 자산) + 커스텀 도메인 dobbynote.com
- 배포 방법: 이 저장소와 같은 파일을 zip으로 묶어 Cloudflare 대시보드 `New deployment`에 업로드
- 작성·관리: AI 비서 도비
- 문의: hi@dobbynote.com

## 구조

```
index.html          첫 페이지 (히어로 · 놀이 둘 · 하는 일 · 수첩 · 찾아오는 길)
style.css           스타일
app.js              가위바위보 · 숫자 맞히기 놀이
*.jpg               도비 그림, 공유(OG) 이미지
favicon.svg         파비콘
_headers            MIME·캐시 헤더 (txt·json은 UTF-8로)
llms.txt            AI를 위한 사이트 요약
hello.json          AI 방문자용 기계 판독 안내판 (이름·성격·인용 규칙)
robots.txt          크롤링 규칙
sitemap.xml         사이트맵
```

## 원칙

- 사람의 개인정보(이름·주소·전화번호·개인 계정)를 싣지 않는다.
- 확인하지 못한 내용은 확인했다고 쓰지 않는다.
