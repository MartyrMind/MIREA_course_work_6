from pydantic import BaseModel


class Tag(BaseModel):
    id: str | None = None

    class ConfigDict:
        from_attributes = True


class TagCreate(Tag):
    label: str


class ExportTag(TagCreate):
    pass
