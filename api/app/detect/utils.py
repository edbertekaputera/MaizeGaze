from typing import Dict, List, Union
from google.oauth2.service_account import Credentials
from google.auth.transport.requests import Request
from google.cloud import aiplatform
from google.protobuf import json_format
from google.protobuf.struct_pb2 import Value
from google.protobuf.json_format import MessageToDict
from google.protobuf.message import Message

def get_authenticated_session(service_account_file_path:str, scope:List[str]) -> Credentials:
    credentials = Credentials.from_service_account_file(service_account_file_path, scopes=scope)
    credentials.refresh(Request())
    return credentials

def convert_nested_mapcomposite(obj):
    if isinstance(obj, (str, int, float, bool, type(None))):
        return obj
    elif isinstance(obj, (list, tuple)):
        return [convert_nested_mapcomposite(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_nested_mapcomposite(value) for key, value in obj.items()}
    elif isinstance(obj, Message):
        # Handle Protocol Buffer messages
        return MessageToDict(obj)
    elif hasattr(obj, 'DESCRIPTOR'):
        # Handle Protocol Buffer messages (alternative method)
        return MessageToDict(obj)
    elif hasattr(obj, '_pb'):
        # Handle MapComposite objects
        return convert_nested_mapcomposite(MessageToDict(obj._pb))
    elif hasattr(obj, 'keys') and hasattr(obj, '__getitem__'):
        # Handle MessageMapContainer and similar types
        return {str(key): convert_nested_mapcomposite(obj[key]) for key in obj.keys()}
    elif hasattr(obj, '__dict__'):
        # Handle custom objects
        return {key: convert_nested_mapcomposite(value) for key, value in obj.__dict__.items()
                if not callable(value) and not key.startswith('_')}
    else:
        # Fallback: convert to string
        return str(obj)

def predict_custom_trained_model_sample(
    project: str,
    endpoint_id: str,
    instances: Union[Dict, List[Dict]],
    location: str,
    api_endpoint: str,
    credentials: Credentials
):
    """
    `instances` can be either single instance of type dict or a list
    of instances.
    """
    # The AI Platform services require regional API endpoints.
    client_options = {"api_endpoint": api_endpoint}
    # Initialize client that will be used to create and send requests.
    # This client only needs to be created once, and can be reused for multiple requests.
    client = aiplatform.gapic.PredictionServiceClient(client_options=client_options, credentials=credentials)
    # The format of each instance should conform to the deployed model's prediction input schema.
    instances = instances if isinstance(instances, list) else [instances]
    instances = [
        json_format.ParseDict(instance_dict, Value()) for instance_dict in instances
    ] # type: ignore
    parameters_dict = {}
    parameters = json_format.ParseDict(parameters_dict, Value())
    endpoint = client.endpoint_path(
        project=project, location=location, endpoint=endpoint_id
    )
    response = client.predict(
        endpoint=endpoint, instances=instances, parameters=parameters # type: ignore
    )
    # The predictions are a google.protobuf.Value representation of the model's predictions.
    predictions = response.predictions
    return convert_nested_mapcomposite(predictions[0]._pb) # type: ignore
