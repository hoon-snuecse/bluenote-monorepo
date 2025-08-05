# Supabase Redirect URLs 설정

Supabase Dashboard > Authentication > URL Configuration > Redirect URLs에 다음 URL들을 추가해주세요:

## Production URLs
```
https://bluenote.site/auth/callback
https://quiz.bluenote.site/auth/callback
https://grading.bluenote.site/auth/callback
```

## Development URLs
```
http://localhost:3000/auth/callback
http://localhost:3002/auth/callback
http://localhost:3003/auth/callback
```

## 설정 방법
1. Supabase Dashboard 접속
2. Authentication > URL Configuration 이동
3. Redirect URLs 섹션에서 위의 모든 URL 추가
4. Save 클릭

이렇게 설정하면 각 앱이 독립적으로 OAuth 콜백을 처리할 수 있습니다.