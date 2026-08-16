from reportlab.pdfgen import canvas
import sys

def make_pdf(filename):
    c = canvas.Canvas(filename)
    c.drawString(100, 750, "Sudo Anirudh - Senior Full-Stack Engineer")
    c.drawString(100, 730, "San Francisco, California")
    c.drawString(100, 700, "Headline: Senior Software Engineer | Next.js & Python Expert")
    c.drawString(100, 670, "About: Results-driven builder focused on developer tools and performance optimization.")
    c.drawString(100, 640, "Experience: Built responsive dashboards using Tailwind and React.")
    c.drawString(100, 620, "Optimized API load times by 40% using PostgreSQL connection pooling.")
    c.drawString(100, 590, "Skills: JavaScript, TypeScript, Python, Next.js, FastAPI, PostgreSQL, Docker")
    c.save()

if __name__ == "__main__":
    make_pdf(sys.argv[1] if len(sys.argv) > 1 else "mock_linkedin.pdf")
