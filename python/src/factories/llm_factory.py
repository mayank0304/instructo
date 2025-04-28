import os
from typing import Dict, Any
from langchain_core.language_models.base import BaseLanguageModel
from langchain_google_genai import ChatGoogleGenerativeAI

class LLMFactory:
    """Factory class to create different LLM instances"""
    
    @staticmethod
    def create_llm(llm_type: str = "gemini", **kwargs) -> BaseLanguageModel:
        """
        Create an LLM instance based on type.
        
        Args:
            llm_type: The type of LLM to create (default: "gemini")
            **kwargs: Additional arguments to pass to the LLM constructor
            
        Returns:
            An instance of BaseLanguageModel
        """
        if llm_type == "gemini":
            model_name = kwargs.get("model_name", "gemini-2.0-flash")
            api_key = kwargs.get("api_key", os.getenv("GOOGLE_API_KEY"))
            
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in environment variables")
                
            return ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key)
            
        # Add support for more LLM types here
        # elif llm_type == "openai":
        #     return ChatOpenAI(...)
        # elif llm_type == "anthropic":
        #     return ChatAnthropic(...)
            
        else:
            raise ValueError(f"Unsupported LLM type: {llm_type}") 