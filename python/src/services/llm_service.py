from typing import Optional
from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

class LLMService:
    """Service for interacting with LLMs"""
    
    def __init__(self, llm: BaseLanguageModel):
        self.llm = llm
        
    def generate_response(self, prompt: str, template: Optional[str] = None) -> str:
        """
        Generate a response using the LLM.
        
        Args:
            prompt: User's prompt
            template: Optional template for wrapping the user prompt
            
        Returns:
            Generated text response
        """
        if template:
            prompt_template = PromptTemplate.from_template(template)
            chain = prompt_template | self.llm | StrOutputParser()
            return chain.invoke({"prompt": prompt})
        else:
            chain = self.llm | StrOutputParser()
            return chain.invoke(prompt)
            
    def update_llm(self, new_llm: BaseLanguageModel) -> None:
        """Update the LLM instance"""
        self.llm = new_llm 