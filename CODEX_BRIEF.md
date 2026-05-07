# 메타리치 시그널그룹 — signal-homepage 개선 브리핑
# Codex 협업용 공유 문서

> 작성일: 2026-05-07  
> 작성: Claude (기획·검토 담당)  
> 실행: Codex (코드 생성·수정 담당)

---

## 1. 프로젝트 현황 파악

### 파일 구조
```
signal-homepage/
├── index.html          ← 메인 홈페이지 (통합)
├── landing.html        ← 보험 무료 점검 랜딩 (가장 완성도 높음)
├── consult.html        ← 보험 상담 신청 폼
├── recruit.html        ← 채용 지원 페이지
├── chuncheon/index.html ← 춘천 센터
├── icheon/index.html   ← 이천 센터
├── seongnam/index.html ← 성남 센터
├── wonju/index.html    ← 원주 본부
├── experts/            ← 임직원 프로필 4개
│   ├── hk0203.html (채홍교 팀장)
│   ├── jw1035.html (박주완 총괄본부장)
│   ├── jw2565.html (배진우 팀장)
│   └── yk1873.html (김연경 센터장)
└── assets/images/      ← 실제 사진 파일
    ├── members/        ← 임직원 사진 (jpg/png)
    ├── chuncheonmain.png
    ├── icheonmain.png
    ├── seongnammain.png
    └── wonjumain.png
```

---

## 2. 현황 진단 (페이지별)

### ✅ landing.html — 완성도 높음 (기준 파일)
- 브랜드 CSS 변수 완비 (--navy #1A2744, --gold #C9A96E 등)
- Pretendard Variable 폰트 적용
- Supanova 모션 패턴 적용 (cubic-bezier .16,1,.3,1)
- 이 파일의 스타일 시스템을 다른 페이지에 전파해야 함

### ⚠️ index.html — 부분 수정 필요
- 폰트: Pretendard + Black Han Sans 사용 ✅ / 일부 `Noto Sans KR` 잔존 ❌
- 색상: `#2563eb` (일반 파란색) 다수 사용 → 브랜드 네이비 `#1A2744`로 교체 필요
- 히어로 이미지: Unsplash 외부 이미지 → 실제 assets 이미지 활용 가능
- 지점 카드: 3개 노출 중 (원주·춘천·이천) → 성남 센터 추가 필요 (4개 or 그리드 재편)
- 아이콘: Iconify Solar 미사용 → 추가 권장
- 애니메이션: AOS 라이브러리 사용 중 (Supanova 인라인 방식으로 통일 권장)

### ❌ consult.html — 대폭 개선 필요
- 폰트: `Noto Sans KR`만 사용 (Pretendard 없음)
- 브랜드 변수 미적용
- 히어로: `linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)` → AI 클리셰 그라디언트
- 전체 재스타일링 필요

### ❌ recruit.html — 대폭 개선 필요
- 폰트: `Noto Sans KR`만 사용 (Pretendard 없음)
- 브랜드 변수 미적용
- 어두운 단색 그라디언트 히어로
- 전체 재스타일링 필요

### 🔲 지점 페이지 (wonju/chuncheon/icheon/seongnam) — 현황 미확인
- 각 지점별 고유 실제 사진 assets 존재 (assets/images/에 png 파일 있음)
- 실제 사진을 히어로에 적용해야 함

---

## 3. 공통 적용 디자인 시스템

### 필수 폰트 로드 (모든 HTML 파일에 적용)
```html
<!-- 본문 필수 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"/>
<!-- 디스플레이 폰트 -->
<link href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@700;800&family=Black+Han+Sans&family=Noto+Serif+KR:wght@700;900&display=swap" rel="stylesheet">
<!-- NanumSquareRound -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nanumfont@1.0.0/NanumSquareRound.css">
```

### 브랜드 CSS 변수 (모든 파일에 통일)
```css
:root {
  --primary: #1A2744;        /* 딥 네이비 */
  --primary-light: #2D4A8A;  /* 미디엄 블루 */
  --accent: #C9A96E;         /* 골드 */
  --accent-warm: #E8A84B;    /* 따뜻한 골드 */
  --bg-light: #FAFAF8;
  --bg-surface: #F5F2ED;
  --text-primary: #111111;
  --text-secondary: #4B5563;
  --text-muted: #9CA3AF;
}
```

### 기본 body 설정
```css
body {
  font-family: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif;
  word-break: keep-all;
  overflow-wrap: break-word;
  -webkit-font-smoothing: antialiased;
}
```

### 표준 모션 패턴 (AOS 대신 인라인 적용)
```css
.fu { opacity: 0; transform: translateY(28px);
  transition: opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1); }
.fu.on { opacity: 1; transform: none; }
.d1 { transition-delay: .08s; } .d2 { transition-delay: .16s; } .d3 { transition-delay: .24s; }
```
```javascript
// IntersectionObserver로 .fu 요소 활성화
const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) e.target.classList.add('on'); }), { threshold: 0.1 });
document.querySelectorAll('.fu').forEach(el => io.observe(el));
```

### 아이콘 (Iconify Solar)
```html
<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
<!-- 사용 예시 -->
<iconify-icon icon="solar:shield-check-bold" width="24"></iconify-icon>
<iconify-icon icon="solar:document-bold" width="24"></iconify-icon>
<iconify-icon icon="solar:user-check-bold" width="24"></iconify-icon>
<iconify-icon icon="solar:phone-calling-bold" width="24"></iconify-icon>
```

---

## 4. 수정 작업 목록 (우선순위 순)

### Phase 1 — 공통 기반 통일 (전체 파일)
- [ ] consult.html: 폰트를 Pretendard로 교체 + 브랜드 변수 적용
- [ ] recruit.html: 폰트를 Pretendard로 교체 + 브랜드 변수 적용
- [ ] consult.html: 히어로 그라디언트를 `#1A2744 → #2D4A8A` 딥 네이비로 교체
- [ ] recruit.html: 히어로 동일 처리

### Phase 2 — index.html 세부 수정
- [ ] `#2563eb` 컬러를 `var(--primary)` `#1A2744`로 전체 교체
- [ ] `Noto Sans KR` 잔존 부분을 `Pretendard Variable`로 교체
- [ ] 지점 네트워크 카드에 성남 센터 추가 (3→4개, 2x2 그리드)
- [ ] 히어로 이미지를 실제 사진으로 교체 검토
- [ ] AOS 라이브러리 제거 → 인라인 IntersectionObserver로 대체

### Phase 3 — 지점 페이지 업데이트
- [ ] 각 지점 히어로에 실제 사진 사용 (`../assets/images/wonjumain.png` 등)
- [ ] 브랜드 색상 통일

### Phase 4 — 전문가 프로필 페이지
- [ ] 스타일 통일성 검토 후 업데이트

---

## 5. 변경하면 안 되는 것들

- 실제 임직원 이름, 직함 (박주완/총괄본부장, 김연경/센터장, 배진우/팀장, 채홍교/팀장 등)
- 실제 연락처, 주소 정보
- 제휴 보험사 목록 (생명보험 17개 + 손해보험 12개)
- 임직원 사진 파일 경로 (`./assets/images/members/`)
- 지점 페이지 링크 구조 (`./wonju/index.html` 등)
- `consult.html`, `recruit.html` 폼 필드 구조 (DB 연동 가능성)
- 임직원 로그인 링크: `https://metarich-signal.vercel.app/login`
- CJ온스타일 외부 링크

---

## 6. Codex 작업 요청 시 참고사항

### 작업 요청 포맷 예시
```
[대상 파일]: index.html
[변경 내용]: 모든 #2563eb 컬러를 #1A2744로 교체하고, btn-action 클래스의 폰트를 Pretendard Variable로 변경
[유지 사항]: 내용(텍스트, 링크, 이미지 경로)은 그대로 유지
```

### 금지 사항
- Inter 폰트 추가 금지
- 보라/파랑 AI 그라디언트 사용 금지
- `혁신적인`, `차세대`, `스마트한` 문구 추가 금지
- 기존 텍스트 내용 임의 변경 금지
- 외부 이미지 URL 임의 변경 금지

---

*이 문서는 Claude가 기획·분석하고 Codex가 실행하는 협업 기준 문서입니다.*
*변경사항 확정 후 Claude에게 공유하면 검토·피드백 진행합니다.*
