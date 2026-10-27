# GALPI 심화탐구 상담 관리 (2026)

이 기능은 기존 **수업 도구 > 심화탐구 상담**에서 열리는 독립 HTML 화면입니다.

- 학생: 월별 예약 현황(타인의 실명 비공개), 학번+본인 비밀번호로 개인 1·2차 상담 조회.
- 교사: 별도 이메일 로그인, 일회용 초기 인증코드 발급, 예약 추가·수정, 1·2차·완료 처리, 날짜×시간표.
- 2026.10.22~11.12 기본 상담 시간대 생성 기능 포함.
- 실제 시간이 지났다는 이유만으로 상담을 완료 처리하지 않습니다.
- 보안: 공개 저장소에는 학생 명단·학번·비밀번호를 넣지 않습니다. Firebase Functions 내부에서 비밀번호를 salt+scrypt로 검사하고, Firebase 커스텀 토큰으로 인증합니다. Firestore 클라이언트 접근은 기본 전면 차단.
- 저장소만 배포한 상태에서는 **설정 전 안내 화면**이며 로그인과 예약 조회는 동작하지 않습니다.

## 활성화 순서

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 프로젝트를 생성하고 웹 앱을 등록합니다. 데이터는 한국 지역(가능한 경우 asia-northeast3)에 보관합니다.
2. Authentication > Sign-in method > **이메일/비밀번호**를 켭니다(교사 로그인용). 가입이 익명으로 가능해도 교사 권한은 따로 서버에서 확인합니다.
3. Cloud Firestore 기본 데이터베이스를 생성합니다. 배포한 `firestore.rules`는 학생 자료의 직접 읽기/쓰기를 전부 금지합니다.
4. **Cloud Functions** 배포에는 Blaze 요금제 연결이 필요합니다. Firebase의 무료 사용량과 청구 알림/예산을 먼저 확인합니다. 학생 실제 계정을 연결하기 전 학교의 개인정보 관련 지침도 확인하세요.
5. Node.js 20 및 Firebase CLI 설치 후 프로젝트 루트에서 아래 명령 실행:

   ```sh
   npm --prefix functions install
   firebase login
   firebase use --add
   firebase deploy --only functions,firestore:rules
   ```

6. Firebase Console > 프로젝트 설정 > 웹 앱 구성 값을 **`consultation-config.js`** 에 입력합니다. 이 값은 공개되는 웹 클라이언트 설정이며 서비스 계정 개인키가 **아닙니다**. 서비스 계정 JSON, Admin SDK 자격 증명, 실제 학번/비밀번호는 GitHub에 절대 업로드하지 마세요.
7. Authentication > Users에서 **교사 본인**을 이메일/비밀번호 사용자로 직접 생성합니다. 생성된 **UID**를 복사해 Firestore Console에서 문서 `admins/{교사_UID}`를 생성합니다. 필드 `role` = `teacher` (문자열). 학생이 임의로 교사 권한을 부여할 수 없습니다.
8. 갈피 사이트 > 수업 도구 > 심화탐구 상담 > **교사용 관리** 로그인 후 **올해 일정 시간대 만들기**를 클릭합니다. 초기 시간대는 예약 학생 이름이 없는 빈 시간입니다.
9. 기존 Google Calendar 예약은 자동으로 가져오지 **않습니다**. 교사용 화면에서 학생의 정확한 학번·이름·시간·1차/2차를 입력해야 합니다. 별도의 Google Calendar 연동 기능은 아직 없습니다. 입력이 실제 예약 명단과 일치하는지 교사가 검수한 뒤 학생에게 공개하세요.
10. 학생에게 학번별 **초기 인증코드**를 개별 전달합니다. 학생은 내 예약 확인 > 처음 이용하나요? 에서 인증코드 및 자신이 설정한 새 비밀번호를 입력합니다. 이후에는 **학번과 비밀번호**로 조회합니다. 비밀번호를 잊으면 교사가 **새 초기 인증코드**를 발급해 재설정할 수 있습니다.

## 실명 및 개인정보

- 전체 예약 현황(publicCalendar): **날짜·시간·1차/2차 수와 상태만** 응답합니다. 이름·학번·이메일 없음. 올해도 실명을 공개하지 않는 안전한 기본값입니다.
- 학생 내 예약(myBookings): 로그인 토큰에서 확인된 studentId와 연결된 **본인 예약만** 반환합니다.
- 교사용 명단(teacherBookings): Firestore의 `admins/{uid}` 문서가 있을 때만 반환합니다.
- 첫 인증코드는 무작위 40자리 16진수로 발급되고 서버에는 SHA-256 해시만 저장됩니다. 30일 동안 유효하며 사용 후 폐기됩니다.
- 비밀번호는 서버에 솔트된 scrypt 해시로 저장하며 평문 저장·공개 API 반환을 하지 않습니다.
- 웹 앱 학생 정보는 공용 컴퓨터에 남지 않도록 로그아웃 안내가 필요합니다. Firebase Auth는 로그인 상태를 기본적으로 유지합니다.
- Firebase App Check 및 요청별 속도 제한 등 추가 보안은 운영 전에 권장합니다. 현재 로그인은 학생 학번별 5회 실패 시 15분 제한합니다.
- 학생/보호자 및 학교의 학생 정보 처리 지침을 검토해 정보 공개 범위, 저장 기간, 삭제 시점을 정하세요.

## 파일

- `consultation.html`, `consultation.css`, `consultation.js`: UI/상호작용
- `consultation-config.js`: 웹 앱 구성
- `functions/index.js`: callable API 및 서버 권한 검사
- `firestore.rules`: 외부 직접 접근 차단
- `firebase.json`, `functions/package.json`: 배포 설정
- `toolkit.js`: 수업 도구 메뉴 연동

## 운영 전 확인 목록

- [ ] Firebase 계정·Blaze 결제/알림 구성
- [ ] Authentication 및 Firestore 활성화
- [ ] 함수/규칙 배포
- [ ] `consultation-config.js` 연결
- [ ] Firestore 교사 UID allowlist 구성
- [ ] 기존 Google Calendar 예약 정확하게 수동 반영
- [ ] 테스트 학생 학번+초기 코드 등록/로그인/자기 예약만 표시 검증
- [ ] 교사용 학생 수정 및 예약 완료 반영 검증
- [ ] 모바일 공개 달력의 이름 비공개 확인
- [ ] 학교 개인정보 보유·파기 기준 확인
