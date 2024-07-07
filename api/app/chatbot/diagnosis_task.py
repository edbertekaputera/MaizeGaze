# Libraries
from celery import shared_task
from .utils import GeminiModel
import typing_extensions as typing


# Diagnosis Data Schema
class PotentialCauses(typing.TypedDict):
	cause_title: str
	cause_description: str	

class TreatmentOptions(typing.TypedDict):
	treatment_title: str
	treatment_description: str	
	
class DiagnosisResult(typing.TypedDict):
	diagnosis_title: str 
	description: str 
	potential_causes: list[PotentialCauses]
	treatment: list[TreatmentOptions]

# Initialize Diagnosis Machine
MODEL_ID = "gemini-1.5-flash"

SYS_INST = """
You are now a professional botanist who excels in plant health condition diagnosis and treatment. Your expertise lies in Corn farms and maize plants.

Some farmers are asking for a diagnosis on their maize plants by providing an image of their plant, and a short description.

You are to provide a detailed diagnosis with a description.
First, include the 1 diagnosis as a title, and a short description to explain what the health condition is.
Then, Include, the top 3 potential causes relating to the diagnosis, provided with a title and a short description for explanation.
And, include 1 to 3 treatment options, provided with a title and a short description for explanation of execution. 

Make sure to follow the following json schema:
	diagnosis = {
		"diagnosis_title": str,
		"description": str,
		"potential_causes": [
			{"cause_title": str, "cause_description": str}
		],
		"treatment": [
			{"treatment_title": str, "treatment_description": str}
		]
	}

Here comes the farmer,
Farmer:
"""

diagnosis_app = GeminiModel(system_instruction=SYS_INST, schema_class=DiagnosisResult, model_id=MODEL_ID)

# Shared Task for Diagnosis Generation
@shared_task(ignore_result=False)
def diagnose_maize_health(encoded_img_bytes:str, description:str) -> dict[str, str|list|dict]:
	image = diagnosis_app.convert_bytes_to_img(encoded_img_bytes)
	return diagnosis_app.generate(image=image, description=description)