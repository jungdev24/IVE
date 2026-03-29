# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

IVE를 좋아하는 딸을 위해 만든 팬 앱 컬렉션. 순수 HTML/CSS/JavaScript로 작성되었으며 프레임워크 없음.

## 앱 구성

| 앱 | 파일 | 핵심 기능 |
|---|---|---|
| 포토카드 리스트 | `index.html` | 포카 보유/위시 관리, 포카마켓·번개장터 시세 조회 |
| IVE 퀴즈 | `quiz.html` | 100문제 객관식 퀴즈 (ALL_QUESTIONS 배열) |
| 유진 사진 모음 | `yujin.html` | 사진 갤러리 (드래그&드롭, X/인스타 수집, 태그, 즐겨찾기) |

## 배포

Cloudflare Workers로 배포. `worker.js`가 소셜미디어 스크래핑용 CORS 프록시 역할.

```bash
# Cloudflare Workers 배포
npx wrangler deploy
```

## 아키텍처

- **프론트엔드**: 각 HTML 파일이 독립된 SPA. `<style>`과 `<script>` 인라인 포함.
- **백엔드**: `worker.js` — X(Twitter), Instagram, Naver 이미지 프록시 엔드포인트 제공
  - `/x/{username}` — 트위터 계정 미디어 추출
  - `/search?q=query` — 트위터 검색
  - `/insta/{username}` — 인스타그램 이미지 추출
  - `/naver?q=query&cid=xxx&csec=xxx` — 네이버 이미지 검색 프록시
- **데이터 저장**: LocalStorage (ive_owned, ive_wish, yujin_photos, yujin_favs 등)
- **외부 API**: pocali-backend.onrender.com (포카 DB), api.phocamarket.com (시세), api.bunjang.co.kr (번개장터)

## 핵심 상수 (index.html)

- `POCA_GROUP = 21` (IVE 그룹 ID)
- 멤버 ID: 175(유진)~180(이서)
- `MEM_EN`, `MEM_KR`, `CAT_KR`, `TITLE_KR` 등 매핑 객체로 한글 로컬라이징

## 코드 패턴

- 상태 관리: 전역 변수 + LocalStorage, Set 기반 보유/위시 추적
- UI 렌더링: `render()` 함수가 innerHTML로 전체 재구성
- API 호출: fetch + 다중 fallback 체인 (CORS 프록시 포함)
- 한국어 UI 전체
