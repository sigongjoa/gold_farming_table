import os
import logging
from PIL import Image
import layoutparser as lp

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def parse_image(image_path, output_dir="parsed_images"):
    logger.debug(f"parse_image 함수 진입: image_path={image_path}, output_dir={output_dir}")

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        logger.debug(f"출력 디렉토리 생성: {output_dir}")

    try:
        image = Image.open(image_path).convert("RGB")
        logger.debug(f"이미지 로드 성공: {image_path}")
    except FileNotFoundError:
        logger.error(f"파일을 찾을 수 없음: {image_path}")
        return
    except Exception as e:
        logger.error(f"이미지 로드 중 오류 발생: {e}")
        return

    # Load the layout model
    try:
        logger.debug("Layout 모델 로드 시도 (EfficientDetLayoutModel로 변경)")
        # Switching to EfficientDetLayoutModel for simpler installation
        model = lp.models.EfficientDetLayoutModel(
            config_path  = "lp://PubLayNet/efficientdet/D0/config",
            model_path   = "lp://PubLayNet/efficientdet/D0/model",
            label_map    = {0:"Text", 1:"Title", 2:"List", 3:"Table", 4:"Figure"},
            device       = "cpu",
            box_threshold= 0.5
        )
        logger.debug("Layout 모델 로드 성공")
    except Exception as e:
        logger.error(f"Layout 모델 로드 중 오류 발생: {e}")
        return

    # Detect the layout
    try:
        logger.debug("레이아웃 감지 시도")
        layout = model.detect(image)
        logger.debug("레이아웃 감지 성공")
    except Exception as e:
        logger.error(f"레이아웃 감지 중 오류 발생: {e}")
        return

    # Visualize the layout
    try:
        logger.debug("레이아웃 시각화 및 저장 시도")
        # Create a new image to draw on to avoid modifying the original PIL image directly for drawing
        # and then saving. layoutparser.ImageDraw operates on the PIL Image.
        # If we want to save a new image with boxes, we'd need to convert the image to a format
        # that allows drawing and then save it.
        image_with_boxes = image.copy()
        draw = lp.ImageDraw(image_with_boxes)
        for block in layout:
            draw.draw_box(block, box_width=3, color="red")
        
        output_image_path = os.path.join(output_dir, f"parsed_{os.path.basename(image_path)}")
        image_with_boxes.save(output_image_path)
        logger.debug(f"결과 이미지 저장 완료: {output_image_path}")
        print(f"Saved result to {output_image_path}")
    except Exception as e:
        logger.error(f"레이아웃 시각화 또는 저장 중 오류 발생: {e}")
        return
    logger.debug("parse_image 함수 종료")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="layoutparser를 사용하여 이미지를 파싱합니다.")
    parser.add_argument("image_path", type=str, help="파싱할 이미지 파일의 경로")
    args = parser.parse_args()
    logger.debug("스크립트 시작")
    # Call the parse_image function with the provided image path
    parse_image(args.image_path)
    logger.debug("스크립트 종료")