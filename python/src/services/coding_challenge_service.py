import json
import re
from typing import Dict, Any
from ..services.llm_service import LLMService

class CodingChallengeService:
    """Service for generating various types of coding challenges"""
    
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
    
    def generate_incomplete_code(self, 
                                  objective: str, 
                                  description: str, 
                                  language: str = 'Python', 
                                  difficulty: str = 'moderate') -> Dict[str, Any]:
        """
        Generate incomplete code for a specific learning objective
        
        Args:
            objective: Learning objective
            description: Detailed description of the challenge
            language: Programming language (default: Python)
            difficulty: Challenge difficulty (default: moderate)
            
        Returns:
            Dictionary with incomplete code and related details
        """
        # Prompt for generating incomplete code
        template = f"""
        Generate an incomplete code snippet with the following specifications:
        Objective: {objective}
        Description: {description}
        Language: {language}
        Difficulty: {difficulty}
        
        Provide the response in the following strict JSON format:
        {{
            "language": "{language}",
            "code": "Incomplete code with placeholders/missing parts",
            "missing_parts": [
                {{
                    "location": "line or section",
                    "hint": "Guidance for completing the code",
                    "difficulty": "{difficulty}"
                }}
            ],
            "learning_goals": [
                "Specific skill to learn",
                "Concept to understand"
            ]
        }}
        
        Ensure:
        1. Code is syntactically valid but incomplete
        2. Provide clear hints for completion
        3. Align with the given objective
        4. Match the specified language and difficulty
        """
        
        try:
            # Generate incomplete code using LLM
            incomplete_code_str = self.llm_service.generate_response(
                prompt=template, 
                template="{prompt}"
            )
            
            # Safely parse the JSON
            try:
                incomplete_code = json.loads(incomplete_code_str)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                json_match = re.search(r'\{.*\}', incomplete_code_str, re.DOTALL)
                if json_match:
                    incomplete_code = json.loads(json_match.group(0))
                else:
                    raise ValueError("Could not extract valid JSON from response")
            
            # Validate the incomplete code structure
            required_keys = ['language', 'code', 'missing_parts', 'learning_goals']
            if not all(key in incomplete_code for key in required_keys):
                raise ValueError("Invalid incomplete code structure")
            
            return incomplete_code
        except Exception as e:
            raise ValueError(f"Failed to generate incomplete code: {str(e)}")
    
    def generate_output_challenge(self, 
                                   objective: str, 
                                   description: str, 
                                   language: str = 'Python', 
                                   difficulty: str = 'moderate') -> Dict[str, Any]:
        """
        Generate an output-based coding challenge
        
        Args:
            objective: Learning objective
            description: Detailed description of the challenge
            language: Programming language (default: Python)
            difficulty: Challenge difficulty (default: moderate)
            
        Returns:
            Dictionary with output-based challenge details
        """
        # Prompt for generating output-based challenge
        template = f"""
        Create an output-based coding challenge with the following specifications:
        Objective: {objective}
        Description: {description}
        Language: {language}
        Difficulty: {difficulty}
        
        Provide the response in the following strict JSON format:
        {{
            "language": "{language}",
            "expected_output": "Specific output to be generated",
            "input_description": "Description of input parameters or context",
            "challenge_details": {{
                "difficulty": "{difficulty}",
                "key_concepts": [
                    "Concept 1 to demonstrate",
                    "Concept 2 to understand"
                ]
            }},
            "test_cases": [
                {{
                    "input": "Sample input",
                    "expected_output": "Corresponding expected output"
                }}
            ]
        }}
        
        Ensure:
        1. Clear and specific expected output
        2. Meaningful test cases
        3. Align with the given objective
        4. Match the specified language and difficulty
        """
        
        try:
            # Generate output challenge using LLM
            output_challenge_str = self.llm_service.generate_response(
                prompt=template, 
                template="{prompt}"
            )
            
            # Safely parse the JSON
            try:
                output_challenge = json.loads(output_challenge_str)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                json_match = re.search(r'\{.*\}', output_challenge_str, re.DOTALL)
                if json_match:
                    output_challenge = json.loads(json_match.group(0))
                else:
                    raise ValueError("Could not extract valid JSON from response")
            
            # Validate the output challenge structure
            required_keys = ['language', 'expected_output', 'input_description', 'challenge_details', 'test_cases']
            if not all(key in output_challenge for key in required_keys):
                raise ValueError("Invalid output challenge structure")
            
            return output_challenge
        except Exception as e:
            raise ValueError(f"Failed to generate output challenge: {str(e)}")
    
    def generate_problem_solving_challenge(self, 
                                           objective: str, 
                                           description: str, 
                                           language: str = 'Python', 
                                           difficulty: str = 'moderate') -> Dict[str, Any]:
        """
        Generate a problem-solving coding challenge
        
        Args:
            objective: Learning objective
            description: Detailed description of the challenge
            language: Programming language (default: Python)
            difficulty: Challenge difficulty (default: moderate)
            
        Returns:
            Dictionary with problem-solving challenge details
        """
        # Prompt for generating problem-solving challenge
        template = f"""
        Create a comprehensive problem-solving coding challenge with the following specifications:
        Objective: {objective}
        Description: {description}
        Language: {language}
        Difficulty: {difficulty}
        
        Provide the response in the following strict JSON format:
        {{
            "language": "{language}",
            "problem_statement": "Detailed description of the coding problem",
            "challenge_details": {{
                "difficulty": "{difficulty}",
                "key_concepts": [
                    "Concept 1 to demonstrate",
                    "Concept 2 to understand"
                ],
                "constraints": [
                    "Specific coding or algorithmic constraints"
                ]
            }},
            "input_specification": {{
                "parameters": [
                    {{
                        "name": "parameter_name",
                        "type": "parameter_type",
                        "description": "Parameter description"
                    }}
                ]
            }},
            "output_specification": {{
                "type": "return_type",
                "description": "Description of expected output"
            }},
            "example_cases": [
                {{
                    "input": "Sample input",
                    "output": "Corresponding output",
                    "explanation": "Explanation of the example"
                }}
            ]
        }}
        
        Ensure:
        1. Comprehensive and clear problem statement
        2. Meaningful constraints and specifications
        3. Illustrative example cases
        4. Align with the given objective
        5. Match the specified language and difficulty
        """
        
        try:
            # Generate problem-solving challenge using LLM
            problem_challenge_str = self.llm_service.generate_response(
                prompt=template, 
                template="{prompt}"
            )
            
            # Safely parse the JSON
            try:
                problem_challenge = json.loads(problem_challenge_str)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                json_match = re.search(r'\{.*\}', problem_challenge_str, re.DOTALL)
                if json_match:
                    problem_challenge = json.loads(json_match.group(0))
                else:
                    raise ValueError("Could not extract valid JSON from response")
            
            # Validate the problem challenge structure
            required_keys = ['language', 'problem_statement', 'challenge_details', 'input_specification', 'output_specification', 'example_cases']
            if not all(key in problem_challenge for key in required_keys):
                raise ValueError("Invalid problem challenge structure")
            
            return problem_challenge
        except Exception as e:
            raise ValueError(f"Failed to generate problem-solving challenge: {str(e)}")
    
    def generate_solution_guidance(self, code: str, language: str, challenge_type: str) -> Dict[str, Any]:
        """
        Generate guidance for a submitted solution
        
        Args:
            code: Submitted code solution
            language: Programming language
            challenge_type: Type of challenge (incomplete-code/output-based/problem-solving)
            
        Returns:
            Dictionary with solution guidance
        """
        # Prompt for generating solution guidance
        template = f"""
        Provide comprehensive guidance for the following {language} code solution 
        in the context of a {challenge_type} challenge:
        
        Code:
        {code}
        
        Provide the response in the following strict JSON format:
        {{
            "overall_assessment": {{
                "strengths": ["Strength 1", "Strength 2"],
                "areas_for_improvement": ["Improvement 1", "Improvement 2"]
            }},
            "learning_insights": [
                {{
                    "concept": "Specific programming concept",
                    "explanation": "Detailed explanation of the concept",
                    "resources": [
                        {{
                            "title": "Resource title",
                            "url": "https://example.com/resource"
                        }}
                    ]
                }}
            ],
            "alternative_approaches": [
                {{
                    "description": "Alternative solution approach",
                    "pros": ["Advantage 1", "Advantage 2"],
                    "cons": ["Limitation 1", "Limitation 2"]
                }}
            ]
        }}
        
        Ensure:
        1. Constructive and specific feedback
        2. Actionable learning insights
        3. Alternative solution approaches
        4. Relevant learning resources
        """
        
        try:
            # Generate solution guidance using LLM
            guidance_str = self.llm_service.generate_response(
                prompt=template, 
                template="{prompt}"
            )
            
            # Safely parse the JSON
            try:
                guidance = json.loads(guidance_str)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                json_match = re.search(r'\{.*\}', guidance_str, re.DOTALL)
                if json_match:
                    guidance = json.loads(json_match.group(0))
                else:
                    raise ValueError("Could not extract valid JSON from response")
            
            # Validate the guidance structure
            required_keys = ['overall_assessment', 'learning_insights', 'alternative_approaches']
            if not all(key in guidance for key in required_keys):
                raise ValueError("Invalid guidance structure")
            
            return guidance
        except Exception as e:
            raise ValueError(f"Failed to generate solution guidance: {str(e)}") 