import aiofiles
import os
from fastapi import UploadFile


import uuid

async def save_upload_temp(file: UploadFile) -> str:
    """Save an uploaded file to /tmp and return the temp path."""
    safe_filename = os.path.basename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{safe_filename}"
    tmp_path = f"/tmp/{unique_filename}"
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
