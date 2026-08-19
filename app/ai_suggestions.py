from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ResumeInput(BaseModel):
    resume_text: str


@router.post("/ai-suggestions")
def ai_suggestions(data: ResumeInput):

    text = data.resume_text.lower()

    suggestions = []

    if "github" not in text:
        suggestions.append("Add your GitHub profile link.")

    if "linkedin" not in text:
        suggestions.append("Add your LinkedIn profile.")

    if "project" not in text:
        suggestions.append("Mention at least 2 technical projects.")

    if "python" not in text:
        suggestions.append("Include your Python skills.")

    if "sql" not in text:
        suggestions.append("Mention SQL or Database knowledge.")

    if "docker" not in text:
        suggestions.append("Learning Docker can improve your profile.")

    if "aws" not in text:
        suggestions.append("Adding AWS or Cloud skills will increase ATS score.")

    if len(suggestions) == 0:
        suggestions.append("Excellent Resume! No major improvements needed.")

    return {
        "suggestions": suggestions
    }