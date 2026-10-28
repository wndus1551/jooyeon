---
name: spec-writer
description: 세아제강 설비 시방서(.docx)를 회사 양식으로 작성한다. 검토보고서·회의록·메모·견적 자료를 받아 content.yaml 을 쓰고 build_spec.py 로 docx 를 만든다. "시방서 써줘", "시방서 작성", "구매의뢰용 사양서", "이 검토보고서로 시방서" 같은 요청에 사용.
---

# 시방서 작성 스킬

회사 시방서 양식은 하나다. 표지·머리말·안전보건 페이지·Common List·별첨은 `assets/master.docx` 에 고정돼 있고,
Claude 는 **내용(content.yaml)만 작성**한다. 서식·장 번호·표 모양은 스크립트가 맞춘다.

```
spec-writer/
├─ SKILL.md
├─ assets/master.docx          # 회사 양식 (손대지 않음)
├─ data/factories.yaml         # 공장 → 라인 → Pipe Size
├─ data/boilerplate.yaml       # 설치환경·설치공사·기타사항·문서·Warranty 기본 문구
├─ data/config.yaml            # 작성자(팀/이름/연락처) 기본값
├─ scripts/build_spec.py       # content.yaml → docx
├─ references/schema.md        # content.yaml 형식 (필독)
├─ references/writing-guide.md # 문체·섹션 구성 규칙 (필독)
└─ examples/pm22.yaml, jcoe12m.yaml   # 실제 시방서 2건을 옮긴 예시
```

## 작업 순서

1. **자료 읽기** — 사용자가 준 검토보고서(pptx/docx/pdf), 회의록, 메모를 모두 읽는다.
   다음을 뽑아 둔다: 공장·라인, 품명, 납기, 설치 장소, 기존 설비 사양, 공급 범위(당사/수주처 분담), 공급 품목·수량, 기술 요구사항, 시운전·검수 기준.
2. **참고 읽기** — `references/schema.md`, `references/writing-guide.md`, 그리고 유형이 비슷한 예시 하나
   (제어·통신·자동화 개조 → `examples/pm22.yaml`, 유압·기계 부품 신설 → `examples/jcoe12m.yaml`).
3. **공장·라인 확인** — `data/factories.yaml` 에 해당 라인이 없으면 사용자에게 Pipe Size(외경/두께/길이 Min·Max)를 물어
   factories.yaml 에 추가한다. 한 번 넣으면 다음 건부터 재사용된다.
4. **content.yaml 작성** — 작업 폴더에 `<품명>_content.yaml` 로 만든다.
   - 자료에 없는 수치·사양은 지어내지 않는다. `[[확인 필요: 실린더 정격압력]]` 처럼 남긴다 (문서에 노란 형광으로 표시됨).
   - 협의로 정할 항목은 문장 안에 `(협의 후 확정)`, `(협의 必)` 로 쓴다 — 이것은 수주처에 보내는 정식 문구다.
   - 장 번호를 직접 쓰지 말고 `{sec:detail}`, `{sec:common}` 같은 참조를 쓴다.
5. **빌드**
   ```bash
   python .claude/skills/spec-writer/scripts/build_spec.py <content.yaml> -o <출력.docx> --pdf
   ```
   - 종료코드 2 또는 `[경고]` 가 나오면 content.yaml 을 고쳐 다시 빌드한다 (특히 "따옴표로 감싸세요" = 표 칸 밀림).
   - `--pdf` 는 LibreOffice 가 있을 때만 동작. 있으면 PDF 를 페이지 이미지로 열어 표가 깨지거나 빈 페이지가 생기지 않았는지 본다.
6. **보고** — 사용자에게 다음만 짧게 알린다.
   - 만든 파일 경로
   - `[확인 필요]` 목록 (스크립트 출력 그대로)
   - 기본 문구(boilerplate)에서 이 건에 맞게 바꾼 부분이 있으면 무엇을 바꿨는지

## 판단 기준

- **기본 문구는 그대로 둔다.** 설치환경·Warranty·Common List 는 고정이다. 설치공사/기타사항/문서는 기본값을 쓰되,
  이 건에서 틀린 문장이 있을 때만 `install` / `misc` / `docs` 로 통째 덮어쓰거나 `misc_extra` / `docs_extra` 로 덧붙인다.
  (예: 전기공사가 없는 순수 유압 건이면 시운전 문구를 유압 기준으로 바꾼다 — jcoe12m 예시 참고)
- **공급 범위 표**: 기본 9행에서 시작해 이 건의 분담에 맞게 고친다. 당사 사급품·별도 공사는 비고 칸에 적는다.
- **세부 사양이 가장 중요하다.** 수주처가 견적·설계를 할 수 있을 만큼 구체적으로: 수치(압력·유량·속도·치수), 형식, 수량,
  고장 시 거동(Fail-safe), 안전, 승인 절차, 제출 자료, 시운전 확인 항목까지. 구성은 writing-guide 의 두 유형 중 하나를 따른다.
- 사용자가 준 자료끼리 숫자가 다르면 하나를 고르지 말고 `[[확인 필요: 보고서 12MPa / 회의록 14MPa]]` 로 남긴다.

## 양식 자체를 바꾸고 싶을 때

표지·Common List·별첨 등 고정부를 바꾸려면 `assets/master.docx` 를 Word 로 열어 수정하면 된다.
단 `{{BODY}}`, `{{PROTO_SCOPE}}`, `{{PROTO_PIPE}}` 문단과 바로 뒤의 두 표, `{{TITLE}}` 등 자리표시자는 지우지 말 것.
