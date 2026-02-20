import pdfplumber
from io import BytesIO


def extract_text_pdfplumber(content: bytes) -> str:
    """Extract text from PDF bytes using pdfplumber (primary extractor)."""
    pages = []
    with pdfplumber.open(BytesIO(content)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    return "\n".join(pages)


def extract_text_pymupdf(content: bytes) -> str:
    """Fallback extractor using PyMuPDF (fitz)."""
    try:
        import fitz
        doc = fitz.open(stream=content, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)
    except ImportError:
        return ""


def extract_pdf_text(content: bytes) -> str:
    """Primary: pdfplumber. Fallback: PyMuPDF."""
    text = extract_text_pdfplumber(content)
    if not text.strip():
        text = extract_text_pymupdf(content)
    return text
