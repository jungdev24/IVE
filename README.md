# IVE 팬 앱 모음 💜

IVE를 좋아하는 딸을 위해 만든 팬 앱 컬렉션입니다.

## 앱 목록

| 앱 | 파일 | 설명 |
|---|---|---|
| 💜 포토카드 리스트 | `index.html` | IVE 포토카드 보유/위시 관리 + 포카마켓·번개장터 시세 조회 |
| 💜 IVE 퀴즈 | `quiz.html` | IVE에 대한 100문제 객관식 퀴즈 |
| 📸 유진 사진 모음 | `yujin.html` | 안유진 사진 갤러리 (드래그&드롭, X/인스타 수집, 태그, 즐겨찾기) |

## 백엔드 API (Pages Functions)

`functions/` 디렉터리의 Cloudflare Pages Functions로 소셜미디어 이미지 프록시 제공:

| 엔드포인트 | 기능 |
|---|---|
| `/x/{username}` | X(트위터) 계정 미디어 추출 |
| `/search?q=query` | X 검색 |
| `/insta/{username}` | 인스타그램 이미지 추출 |
| `/naver?q=query&cid=xxx&csec=xxx` | 네이버 이미지 검색 프록시 |

## 기술 스택

- 순수 HTML/CSS/JavaScript (프레임워크 없음)
- Cloudflare Pages + Pages Functions (GitHub 자동 배포)
- 외부 API: pocali, phocamarket, bunjang
- 로컬스토리지 기반 데이터 저장
