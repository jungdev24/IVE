# IVE 팬 앱 프로젝트 진행사항

## 프로젝트 개요
- IVE를 좋아하는 딸을 위해 만든 팬 앱 컬렉션
- 배포: https://ive-fan-app.pages.dev
- GitHub: https://github.com/jungdev24/IVE
- Worker API: https://ive-api.jungdev24.workers.dev

---

## 현재 배포된 앱 (3개)

### 1. 💜 포토카드 시세 (`/index.html`)
- pocali API에서 IVE 포토카드 ~500장 로드
- 멤버별 / 앨범별 / 혜택처별 필터 + 검색
- 카드 클릭 → 보유 토글, 우클릭/길게 누르기 → 상세 모달
- **보유 / 위시** 분리 관리 (키보드 9=보유, 1=위시)
- **포카마켓 한국 시세** (`api.phocamarket.com`, 원화 KRW)
  - 3열 사진 그리드로 같은 카드 시각적 비교 (최대 12장)
  - 4단계 검색: 정확 → 앨범+혜택처 → 앨범만 → 글로벌 폴백
  - 거래가 + 최저 판매가 표시
- **번개장터 실시간 매물** (3열 사진 그리드, 최대 12개)
- 카테고리 매핑: REVIVE+, IVESECRET, dicon, eider, SuperStar, MINIVEpopup3TP 등
- `ver.` 접두사 파싱 (ver.MD → MD, ver.LOVED IVE → LOVED IVE)

### 2. 📸 안유진 사진 모음 (`/yujin.html`)
- **𝕏(트위터) 자동 수집** — Cloudflare Worker 경유, API 키 불필요
  - @계정 타임라인 수집 (syndication API)
  - #해시태그 검색 수집
- **수집 계정 관리** — ⚙️에서 추가/삭제
  - 기본: @_yujjin_an, @_yujin_an_, @IVEstarship, @_yoojin_an, #안유진, #anyujin, #아이브안유진
- GIF/동영상 지원 (마우스 올리면 재생)
- **크기 조절** 슬라이더 (2열~6열, 설정 저장)
- **자동 태그** — 트윗 해시태그 자동 추출 → 사진 태그로 저장
- 뷰어에서 수동 태그 편집 가능
- 즐겨찾기 ♡ + 필터 (전체/즐겨찾기/트위터/직접추가)
- 직접 추가: 파일 선택, 드래그&드롭, Ctrl+V 붙여넣기
- 뷰어: ← → 키, ESC 닫기
- 인스타그램은 서버 접근 차단으로 자동 수집 불가 (직접 추가만 가능)

### 3. 💜 IVE 퀴즈 (`/quiz.html`)
- IVE 관련 **100문제** (50 → 100 확장)
  - 그룹 기본 (10), 멤버 프로필 (30+), 음악/앨범 (14), 수상/기록 (7), 활동/예능 (9)
- 10 / 20 / 50 / 100문제 모드
- 랜덤 출제 + 선택지 셔플 + 해설

---

## 삭제된 앱
- ~~연예인 이름 맞추기 (`celeb.html`)~~ — 삭제됨
- ~~이상형 월드컵 (`worldcup.html`)~~ — 삭제됨
- ~~눈 맞추기 (`eyes.html`)~~ — 삭제됨

---

## 인프라

### Cloudflare Pages
- 프로젝트명: `ive-fan-app`
- URL: https://ive-fan-app.pages.dev
- 배포 명령: `npx wrangler pages deploy /Users/Seunghun/Development/IVE --project-name ive-fan-app --branch main --commit-message "update"`

### Cloudflare Worker (`ive-api`)
- URL: https://ive-api.jungdev24.workers.dev
- 배포 명령: `npx wrangler deploy worker.js --name ive-api --compatibility-date 2024-01-01`
- 엔드포인트:
  - `GET /x/{username}` — X 계정 타임라인에서 이미지+GIF+해시태그 추출
  - `GET /search?q={query}` — X 해시태그 검색
  - `GET /insta/{username}` — 인스타그램 (현재 차단됨)
  - `GET /naver?q=&cid=&csec=` — 네이버 이미지 검색 프록시

### GitHub
- 리포: https://github.com/jungdev24/IVE
- 계정: jungdev24

---

## 외부 API 정리

| API | 용도 | 인증 | 비고 |
|-----|------|------|------|
| pocali-backend.onrender.com | 포토카드 목록 | 없음 | IVE 카드 ~500장 |
| api.phocamarket.com | 한국 포카마켓 시세 (KRW) | 없음 | `/card/v2/search?group=21&member={id}` |
| pocamarket.com/apis | 글로벌 포카마켓 시세 (USD) | 없음 | 한국 API 폴백용 |
| api.bunjang.co.kr | 번개장터 매물 | 없음 | 직접 호출 + CORS 프록시 폴백 |
| syndication.twitter.com | X 트위터 타임라인 | 없음 | Worker 경유 |

### IVE 포카마켓 멤버 ID
| 멤버 | ID |
|------|-----|
| 유진 | 175 |
| 가을 | 176 |
| 레이 | 177 |
| 원영 | 178 |
| 리즈 | 179 |
| 이서 | 180 |

### 포카마켓 검색 카테고리 매핑 (pocalist → pocamarket)
| pocalist category | 검색어 | 카드 수 |
|---|---|---|
| REVIVE+ | REVIVE | 286 |
| IVESECRET | SECRET | 60 |
| dicon | DICON | 15 |
| SuperStar | SUPERSTAR | 6 |
| MINIVEpopup3TP | MINIVE POP-UP | 6 |
| eider | EIDER | 4 |
| nationalgeograpic | NATIONAL GEOGRAPHIC | 4 |
| Hapa Kristin | HAPA KRISTIN | 4 (포카마켓에 없음) |
| misekiseoul | MISE EN SCENE | 3 |

---

## 작업 이력 (2026-03-17 기준)

1. IVE 포토카드 리스트 앱 생성 (pocali API 연동)
2. 번개장터 시세 연동 (allorigins 프록시 → 직접 호출로 변경)
3. 포카마켓 글로벌 API 발견 및 연동 (pocamarket.com)
4. 포카마켓 한국 API 발견 및 연동 (api.phocamarket.com, 원화)
5. 카테고리 매핑 대폭 개선 (매칭률 5% → 90%+)
6. 번개장터 검색어 개선 ("포카" 제거)
7. 시세 사진 그리드 3열로 변경 (시각적 비교)
8. 보유/위시 분리 관리 기능 추가 (키보드 9/1)
9. 안유진 사진 모음 앱 생성
10. X(트위터) 자동 수집 기능 (Cloudflare Worker)
11. 해시태그 검색, GIF 지원, 자동 태그
12. 인스타그램 시도 → 서버 차단으로 제거
13. 크기 조절 슬라이더 추가
14. IVE 퀴즈 앱 생성 (50문제 → 100문제)
15. 이상형 월드컵, 연예인 맞추기, 눈 맞추기 생성 후 삭제
16. GitHub 커밋 + Cloudflare Pages/Worker 배포
