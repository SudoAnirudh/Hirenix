import aiofiles
import os
from fastapi import UploadFile


async def save_upload_temp(file: UploadFile) -> str:
    """Save an uploaded file to /tmp and return the temp path."""
    tmp_path = f"/tmp/{file.filename}"
    content = await file.read()
    async with aiofiles.open(tmp_path, "wb") as f:
        await f.write(content)
    return tmp_path


def cleanup_temp(path: str) -> None:
    """Remove a temporary file."""
    try:
        os.remove(path)
    except FileNotFoundError:
        pass
