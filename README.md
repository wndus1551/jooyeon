# 💌 우리의 추억 퀴즈

여자친구를 위한 모바일 웹 게임입니다. 둘만 아는 퀴즈를 맞히면 추억 사진이 하나씩 열리고, 마지막에는 편지가 나옵니다.

## ✏️ 내용 바꾸기
**`config.js` 하나만 수정하면 됩니다.**
- `herName`, `myName`: 이름이나 애칭
- `quizzes`: 질문, 보기, 정답 번호(**0부터 시작**), 힌트, 사진, 추억 문구
- `letter`: 마지막 편지
- `finalSurprise`: 편지 아래 P.S. (실제 선물 위치 힌트 등)

## 📷 사진 넣기
`photos` 폴더에 `1.jpg`, `2.jpg` ... 처럼 넣으면 됩니다. 사진이 없으면 이모지가 대신 나옵니다.
> 휴대폰에서 빨리 열리도록 사진은 1000px 정도로 줄여서 넣는 걸 추천해요.

## 🚀 휴대폰으로 보내기 (GitHub Pages, 무료)
1. GitHub 저장소 → **Settings → Pages**
2. Source: `Deploy from a branch`, 브랜치 선택, 폴더 `/ (root)` → Save
3. 1~2분 뒤 나오는 링크(`https://<아이디>.github.io/jooyeon/`)를 카톡으로 보내면 끝!

⚠️ 공개 저장소라면 사진과 편지도 링크를 아는 사람은 누구나 볼 수 있어요.

## 💻 내 컴퓨터에서 미리 보기
```bash
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 열기
```
