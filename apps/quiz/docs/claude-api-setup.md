# Claude API 설정 가이드

## 문제 해결

### 500 에러: "문항 생성 중 오류가 발생했습니다"

이 에러는 Claude API 키가 설정되지 않았을 때 발생합니다.

### 해결 방법

1. **Vercel 대시보드로 이동**
   - https://vercel.com/dashboard
   - bluenote-quiz 프로젝트 선택

2. **Settings > Environment Variables**

3. **다음 중 하나를 추가:**
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```
   또는
   ```
   CLAUDE_API_KEY=sk-ant-api03-...
   ```

4. **모든 환경에 적용**
   - Production ✓
   - Preview ✓
   - Development ✓

5. **저장 후 재배포**
   - Deployments 탭에서 최신 배포 선택
   - "Redeploy" 클릭

### API 키 얻기

1. https://console.anthropic.com 접속
2. API Keys 섹션에서 새 키 생성
3. 키를 안전하게 복사하여 Vercel에 추가

### 확인 방법

배포 후 다음 단계로 확인:
1. Quiz 생성 페이지로 이동
2. 주제 입력 후 "AI로 문항 생성" 클릭
3. 정상적으로 문항이 생성되면 성공

### 주의사항

- API 키는 절대 코드에 직접 포함하지 마세요
- 환경 변수로만 관리하세요
- Web 앱과 동일한 API 키를 사용할 수 있습니다