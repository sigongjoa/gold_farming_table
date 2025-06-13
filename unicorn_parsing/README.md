# 이미지 파싱 가이드

이 프로젝트는 `layoutparser` 라이브러리를 사용하여 이미지를 자동으로 파싱합니다.

## 설정

1.  `unicorn_parsing` 디렉토리로 이동합니다:
    ```bash
    cd unicorn_parsing
    ```

2.  필요한 Python 패키지를 설치합니다. `layoutparser`는 PaddlePaddle을 백엔드로 사용하므로, 설치 과정에서 PaddlePaddle 관련 패키지도 함께 설치됩니다.
    ```bash
    pip install -r requirements.txt
    ```

## 사용법

이미지를 파싱하려면 `parse_image.py` 스크립트를 실행하고 파싱할 이미지 파일의 경로를 인수로 제공합니다.

```bash
python parse_image.py <이미지_파일_경로>
```

**예시:**

`my_image.png`라는 이미지를 파싱하려면:

```bash
python parse_image.py my_image.png
```

파싱된 이미지는 `parsed_images`라는 새 디렉토리에 `parsed_<원본_이미지_이름>` 형식으로 저장됩니다. 레이아웃 요소(텍스트, 제목, 리스트 등)는 이미지 위에 색상으로 표시됩니다. 