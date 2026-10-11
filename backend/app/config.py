from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gcp_project: str = ""
    storage_bucket: str = ""
    firebase_credentials: str = ""
    ee_project: str = ""
    ee_service_account: str = ""
    ee_key_file: str = ""
    allowed_origins: str = "http://localhost:5173"
    public_verify_url: str = "http://localhost:5173"
    max_area_ha: float = 50000
    max_analyses_per_hour: int = 6
    method_version: str = "aquasentinel-1.0"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
