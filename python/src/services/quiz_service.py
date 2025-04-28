import json
from typing import Dict, List, Any
from ..services.llm_service import LLMService

class QuizService:
    """Service for generating and evaluating programming language quizzes"""
    
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
    
    def generate_language_quiz(self, language: str) -> Dict[str, Any]:
        """
        Generate a quiz for a specific programming language
        
        Args:
            language: Programming language for the quiz
            
        Returns:
            A dictionary containing quiz questions and details
        """
        # Prompt for generating quiz questions with explicit JSON formatting
        template = f"""
        Generate a comprehensive {language} programming quiz with 20 questions 
        that test knowledge from beginner to advanced levels. 
        
        Provide the response in the following strict JSON format:
        {{
            "questions": [
                {{
                    "text": "Question text here",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": "Correct option",
                    "difficulty": "beginner/moderate/advanced",
                    "explanation": "Brief explanation of the correct answer"
                }},
                ... (19 more questions)
            ]
        }}

        Ensure:
        1. Exactly 20 questions
        2. Four multiple-choice options for each question
        3. Clear, concise language
        4. Varied difficulty levels
        5. Relevant to {language} programming
        """
        
        try:
            # Generate quiz using LLM with explicit JSON request
            quiz_json_str = self.llm_service.generate_response(
                prompt=template, 
                template="{prompt}"
            )
            
            # Safely parse the JSON
            try:
                quiz_data = json.loads(quiz_json_str)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                # This handles cases where the LLM might include additional text
                import re
                json_match = re.search(r'\{.*\}', quiz_json_str, re.DOTALL)
                if json_match:
                    quiz_data = json.loads(json_match.group(0))
                else:
                    raise ValueError("Could not extract valid JSON from response")
            
            # Validate the quiz data
            if not isinstance(quiz_data, dict) or 'questions' not in quiz_data:
                raise ValueError("Invalid quiz structure")
            
            return {
                "language": language,
                "total_questions": len(quiz_data['questions']),
                "questions": quiz_data['questions']
            }
        except Exception as e:
            raise ValueError(f"Failed to generate quiz: {str(e)}")
    
    def evaluate_quiz(self, language: str, responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluate user's quiz responses
        
        Args:
            language: Programming language of the quiz
            responses: List of user's quiz responses
            
        Returns:
            Evaluation results with score and level
        """
        # Prompt for evaluating quiz responses with explicit JSON formatting
        template = f"""
        Evaluate the following {language} programming quiz responses:
        Responses: {json.dumps(responses)}
        
        Provide the evaluation in the following strict JSON format:
        {{
            "total_questions": 20,
            "correct_answers": 0,
            "score_percentage": 0.0,
            "skill_level": "beginner/moderate/advanced",
            "detailed_feedback": [
                {{
                    "question": "Question text",
                    "user_answer": "User's answer",
                    "correct_answer": "Correct answer",
                    "is_correct": true/false,
                    "explanation": "Detailed explanation"
                }},
                ... (more detailed feedback)
            ]
        }}
        
        Ensure:
        1. Accurate scoring
        2. Detailed feedback for each question
        3. Clear skill level assessment
        """
        
        try:
            # Generate evaluation using LLM with explicit JSON request
            evaluation_json_str = self.llm_service.generate_response(
                prompt=template, 
                template="{prompt}"
            )
            
            # Safely parse the JSON
            try:
                evaluation_data = json.loads(evaluation_json_str)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                import re
                json_match = re.search(r'\{.*\}', evaluation_json_str, re.DOTALL)
                if json_match:
                    evaluation_data = json.loads(json_match.group(0))
                else:
                    raise ValueError("Could not extract valid JSON from response")
            
            # Validate the evaluation data
            required_keys = ['total_questions', 'correct_answers', 'score_percentage', 'skill_level', 'detailed_feedback']
            if not all(key in evaluation_data for key in required_keys):
                raise ValueError("Invalid evaluation structure")
            
            return evaluation_data
        except Exception as e:
            raise ValueError(f"Failed to evaluate quiz: {str(e)}") 