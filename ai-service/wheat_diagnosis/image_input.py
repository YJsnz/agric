"""PIL decoding for wheat; follows pear upload limits without changing pear."""
from io import BytesIO
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps
from .exceptions import WheatDiagnosisError

MAX_UPLOAD_BYTES = 20 * 1024 * 1024
FORMATS = {'JPEG': 'image/jpeg', 'PNG': 'image/png', 'WEBP': 'image/webp'}


def read_upload(upload):
    try:
        content = upload.file.read(MAX_UPLOAD_BYTES + 1)
        if len(content) > MAX_UPLOAD_BYTES:
            raise WheatDiagnosisError('图片不能超过20 MB', 'invalid_image')
        if not content or upload.content_type not in FORMATS.values():
            raise WheatDiagnosisError('请上传JPG、PNG或WEBP图片', 'invalid_image')
        with Image.open(BytesIO(content)) as image:
            # Some official GWHD .png filenames contain JPEG bytes. Validate
            # actual decoded format rather than trusting extension/MIME equality.
            if image.format not in FORMATS or getattr(image, 'n_frames', 1) != 1:
                raise WheatDiagnosisError('不支持的实际图片格式或不是单帧图片', 'invalid_image')
            image.verify()
        with Image.open(BytesIO(content)) as image:
            return ImageOps.exif_transpose(image).convert('RGB')
    except WheatDiagnosisError:
        raise
    except Exception as error:
        raise WheatDiagnosisError('无法读取有效图片', 'invalid_image') from error
    finally:
        upload.file.close()


def normalize_image(image):
    try:
        if isinstance(image, (str, Path)):
            with Image.open(image) as opened:
                return ImageOps.exif_transpose(opened).convert('RGB')
        if isinstance(image, Image.Image):
            return ImageOps.exif_transpose(image).convert('RGB')
        if isinstance(image, np.ndarray) and image.ndim == 3 and image.shape[2] == 3 and image.dtype == np.uint8:
            # Public ndarray input is explicitly RGB; YOLO receives a PIL image.
            return Image.fromarray(image, 'RGB')
    except Exception as error:
        raise WheatDiagnosisError('无法读取图片', 'invalid_image') from error
    raise WheatDiagnosisError('不支持的图片输入；numpy输入须为uint8 RGB', 'invalid_image')
