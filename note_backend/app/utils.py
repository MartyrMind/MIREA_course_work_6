import uuid
from typing import List, Any

from pydantic import BaseModel


def to_pydantic(items: List[Any], model, in_list=True):
    result = []
    for item in items:
        result.append(model(**item.__dict__))
    if not in_list:
        return result[0]
    else:
        return result


def generate_uuid():
    return str(uuid.uuid4())