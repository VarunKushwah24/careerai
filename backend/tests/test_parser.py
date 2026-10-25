import os
from pathlib import Path
import tempfile
from PIL import Image, ImageDraw
from pypdf import PdfWriter
from app.ml.parser import clean_text, parse_resume_file, extract_text_from_image, extract_text_from_pdf

def test_clean_text():
    dirty = "John Doe \u2022 Senior Developer\n\n\nSkills: Python,  FastAPI"
    cleaned = clean_text(dirty)
    assert "John Doe" in cleaned
    assert "Python" in cleaned

def test_parse_sample_docx():
    sample_docx = Path(__file__).resolve().parent.parent.parent / "sample_resumes" / "Software_Engineer_Resume.docx"
    if sample_docx.exists():
        text = parse_resume_file(str(sample_docx))
        assert len(text) > 100
        assert "Alex Johnson" in text or "ALEX JOHNSON" in text

def test_parse_image_resume_ocr():
    # Create synthetic image resume (PNG)
    img = Image.new("RGB", (700, 250), color="white")
    draw = ImageDraw.Draw(img)
    draw.text((20, 20), "Kavita Sharma - AI Engineer", fill="black")
    draw.text((20, 60), "Skills: Python, Machine Learning, TensorFlow, SQL", fill="black")
    draw.text((20, 100), "Experience: 3 years building predictive models", fill="black")

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        img_path = tmp.name
        img.save(img_path)

    try:
        extracted = parse_resume_file(img_path)
        assert len(extracted) >= 30
        assert "Kavita" in extracted or "Sharma" in extracted or "Python" in extracted
        assert "AI" in extracted or "Engineer" in extracted
    finally:
        if os.path.exists(img_path):
            os.unlink(img_path)

def test_parse_scanned_pdf_fallback():
    # Create image
    img = Image.new("RGB", (700, 250), color="white")
    draw = ImageDraw.Draw(img)
    draw.text((20, 20), "Vikram Malhotra - Cloud Architect", fill="black")
    draw.text((20, 60), "Technologies: AWS, Kubernetes, Terraform, Docker", fill="black")
    draw.text((20, 100), "Experience: 6 years managing multi-cloud infra", fill="black")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        pdf_path = tmp.name

    try:
        # Save PIL Image directly into a 1-page PDF (image-only scanned PDF)
        img.save(pdf_path, "PDF", resolution=100.0)

        extracted = parse_resume_file(pdf_path)
        assert len(extracted) >= 30
        assert "Vikram" in extracted or "Malhotra" in extracted or "AWS" in extracted or "Kubernetes" in extracted
    finally:
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)
