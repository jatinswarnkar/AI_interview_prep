import logging
from django.conf import settings
from langchain_openai import AzureChatOpenAI

logger = logging.getLogger(__name__)


class LLMClient:
    """
    Client wrapper for Azure OpenAI Chat model.
    Utilizes LangChain's AzureChatOpenAI.
    """

    _llm = None

    @classmethod
    def get_llm(cls, temperature: float = 0.2) -> AzureChatOpenAI:
        """
        Returns a configured instance of AzureChatOpenAI.
        Caches the client instance.
        """
        if cls._llm is None:
            # Check credentials
            if not settings.AZURE_OPENAI_API_KEY or not settings.AZURE_OPENAI_ENDPOINT:
                logger.error("Azure OpenAI API credentials are not configured in settings.")
                raise ValueError("Azure OpenAI API credentials are missing. Please check your .env file.")

            logger.info(f"Initializing Azure OpenAI Client (Deployment: {settings.AZURE_OPENAI_DEPLOYMENT_NAME})")
            
            cls._llm = AzureChatOpenAI(
                azure_deployment=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
                openai_api_version=settings.AZURE_OPENAI_API_VERSION,
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_API_KEY,
                temperature=temperature,
            )
            
        return cls._llm
