import logging
import pdfplumber
from io import BytesIO
from utils.text_cleaner import clean_text

logger = logging.getLogger("hirenix.markdown_extractor")


def extract_markdown_pymupdf4llm(content: bytes) -> str:
    """Extract layout-preserved Markdown using pymupdf4llm if available."""
    try:
        import fitz
        import pymupdf4llm
        doc = fitz.open(stream=content, filetype="pdf")
        md_text = pymupdf4llm.to_markdown(doc)
        if md_text and md_text.strip():
            return md_text
    except Exception as e:
        logger.debug(f"pymupdf4llm layout extraction unavailable/failed: {e}")
    return ""


def extract_text_pdfplumber(content: bytes) -> str:
    """Fallback text extractor using pdfplumber."""
    pages = []
    try:
        with pdfplumber.open(BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text)
    except Exception as e:
        logger.warning(f"pdfplumber extraction error: {e}")
    return "\n".join(pages)


def extract_text_pymupdf(content: bytes) -> str:
    """Fallback text extractor using PyMuPDF (fitz)."""
    try:
        import fitz
        doc = fitz.open(stream=content, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)
    except Exception as e:
        logger.warning(f"fitz text extraction error: {e}")
        return ""


def extract_pdf_markdown(content: bytes) -> str:
    """
    Extract layout-aware Markdown or cleaned raw text.
    Prefers pymupdf4llm -> pdfplumber -> PyMuPDF fitz.
    """
    md_text = extract_markdown_pymupdf4llm(content)
    if md_text and len(md_text.strip()) > 30:
        return md_text

    text = extract_text_pdfplumber(content)
    if not text.strip():
        text = extract_text_pymupdf(content)

    return clean_text(text)
