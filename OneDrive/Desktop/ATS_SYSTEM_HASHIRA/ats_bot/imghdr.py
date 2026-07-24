"""Lightweight imghdr shim for environments missing the stdlib module.

Provides a minimal `what()` implementation to detect common image types
(jpeg, png, gif, webp, bmp, tif) by inspecting file header bytes.
This lets third-party packages (e.g., python-telegram-bot) import `imghdr`.
"""
from typing import Optional

def _match_jpeg(h: bytes) -> bool:
    return h.startswith(b"\xff\xd8\xff")

def _match_png(h: bytes) -> bool:
    return h.startswith(b"\x89PNG\r\n\x1a\n")

def _match_gif(h: bytes) -> bool:
    return h.startswith(b"GIF87a") or h.startswith(b"GIF89a")

def _match_webp(h: bytes) -> bool:
    return h[0:4] == b"RIFF" and h[8:12] == b"WEBP"

def _match_bmp(h: bytes) -> bool:
    return h.startswith(b"BM")

def _match_tiff(h: bytes) -> bool:
    return h.startswith(b"II") or h.startswith(b"MM")

def what(file: Optional[str] = None, h: Optional[bytes] = None) -> Optional[str]:
    """Detect image type.

    Args:
      file: path to file or None
      h: optional header bytes

    Returns image type string or None.
    """
    try:
        header = h
        if header is None:
            if file is None:
                return None
            # file may be a path-like object
            with open(file, 'rb') as f:
                header = f.read(32)
        if not header:
            return None
        if _match_jpeg(header):
            return 'jpeg'
        if _match_png(header):
            return 'png'
        if _match_gif(header):
            return 'gif'
        if _match_webp(header):
            return 'webp'
        if _match_bmp(header):
            return 'bmp'
        if _match_tiff(header):
            return 'tiff'
    except Exception:
        return None
    return None
