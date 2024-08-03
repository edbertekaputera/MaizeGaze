# Libraries
from celery import shared_task
from .utils import GeminiModel
import typing_extensions as typing


# Consultation Data Schema
class ConsultationResult(typing.TypedDict):
	response: str

# Initialize Consultation Machine
MODEL_ID = "gemini-1.5-flash"

SYS_INST = """
You are now a professional botanist who excels in managing and cultivating farms and crops. Your expertise lies in Corn farms and maize plants.

Some up-and-coming farmers are asking for advice or questions regarding agriculture, so that they can get achieve results.
You are to provide a detailed, yet concise answer in response to them. Please use markdown formatting.
Make sure that the output follows the following json schema,
	output = {"response": str}
return output

Here comes the farmer,
Farmer:
"""

consultation_app = GeminiModel(system_instruction=SYS_INST, schema_class=ConsultationResult, model_id=MODEL_ID)

# Shared Task for Consultation Generation
@shared_task(ignore_result=False)
def consult_question(description:str) -> dict[str, str|list|dict]:
	return consultation_app.generate(description=description)