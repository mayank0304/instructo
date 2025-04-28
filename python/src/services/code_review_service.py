import json
import re
from typing import Dict, Any
from ..services.llm_service import LLMService

class CodeReviewService:
    """Service for code review and programming assistance"""
    
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
    
    def review_code(self, code: str, language: str) -> Dict[str, Any]:
        """
        Review submitted code and provide guidance
        
        Args:
            code: Code to be reviewed
            language: Programming language of the code
            
        Returns:
            Code review analysis without providing the actual code
        """
        # Prompt for code review with explicit JSON formatting
        template = f"""
        Perform a detailed code review for the following {language} code.
        
        Provide the review in the following strict JSON format:
        {{
            "overall_assessment": {{
                "code_quality": "poor/average/good/excellent",
                "potential_improvements": ["Improvement 1", "Improvement 2"],
                "complexity_score": 0-10
            }},
            "detailed_review": [
                {{
                    "category": "Structure/Organization",
                    "observations": ["Observation 1", "Observation 2"],
                    "suggestions": ["Suggestion 1", "Suggestion 2"]
                }},
                {{
                    "category": "Performance",
                    "observations": ["Observation 1", "Observation 2"],
                    "suggestions": ["Suggestion 1", "Suggestion 2"]
                }},
                {{
                    "category": "Best Practices",
                    "observations": ["Observation 1", "Observation 2"],
                    "suggestions": ["Suggestion 1", "Suggestion 2"]
                }}
            ],
            "learning_resources": [
                {{
                    "topic": "Related concept",
                    "url": "https://example.com/resource"
                }}
            ]
        }}

        Code to review:
        {code}

        Ensure:
        1. Do NOT provide the corrected code
        2. Focus on constructive guidance
        3. Provide actionable insights
        4. Include learning resources
        """
        
        try:
            # Generate code review using LLM with explicit JSON request
            review_json_str = self.llm_service.generate_response(
                prompt=template, 
                template="{prompt}"
            )
            
            # Safely parse the JSON
            try:
                review_data = json.loads(review_json_str)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                json_match = re.search(r'\{.*\}', review_json_str, re.DOTALL)
                if json_match:
                    review_data = json.loads(json_match.group(0))
                else:
                    raise ValueError("Could not extract valid JSON from response")
            
            # Validate the review data structure
            required_keys = ['overall_assessment', 'detailed_review', 'learning_resources']
            if not all(key in review_data for key in required_keys):
                raise ValueError("Invalid review structure")
            
            return review_data
        except Exception as e:
            raise ValueError(f"Failed to review code: {str(e)}")
    
    def get_chat_response(self, message: str) -> Dict[str, Any]:
        """
        Provide coding-related chat assistance
        
        Args:
            message: User's chat message
            
        Returns:
            Helpful response to the user's query
        """
        # Prompt for chat response with explicit JSON formatting
        template = f"""
        Provide a helpful, educational response to the following programming-related query:
        
        Query: {message}
        
        Provide the response in the following strict JSON format:
        {{
            "response_type": "explanation/guidance/resource",
            "main_points": [
                "Key point 1",
                "Key point 2",
                "Key point 3"
            ],
            "detailed_explanation": "Comprehensive explanation of the topic",
            "learning_resources": [
                {{
                    "title": "Resource title",
                    "url": "https://example.com/resource",
                    "type": "tutorial/documentation/video"
                }}
            ],
            "recommended_next_steps": [
                "Step 1 to learn more",
                "Step 2 to improve understanding"
            ]
        }}

        Ensure:
        1. Explain underlying concepts
        2. Provide clear, concise guidance
        3. Avoid direct code solutions
        4. Include learning resources
        """
        
        try:
            # Generate chat response using LLM with explicit JSON request
            response_json_str = self.llm_service.generate_response(
                prompt=template, 
                template="{prompt}"
            )
            
            # Safely parse the JSON
            try:
                response_data = json.loads(response_json_str)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                json_match = re.search(r'\{.*\}', response_json_str, re.DOTALL)
                if json_match:
                    response_data = json.loads(json_match.group(0))
                else:
                    raise ValueError("Could not extract valid JSON from response")
            
            # Validate the response data structure
            required_keys = ['response_type', 'main_points', 'detailed_explanation', 'learning_resources', 'recommended_next_steps']
            if not all(key in response_data for key in required_keys):
                raise ValueError("Invalid response structure")
            
            return response_data
        except Exception as e:
            raise ValueError(f"Failed to generate chat response: {str(e)}") 