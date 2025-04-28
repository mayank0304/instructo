import json
from flask import Blueprint, request, jsonify
from ..services.coding_challenge_service import CodingChallengeService
from ..services.code_review_service import CodeReviewService

# Create a Blueprint for coding challenge routes
coding_challenge_bp = Blueprint('coding_challenge', __name__)

# Global Coding Challenge service 
coding_challenge_service = None
code_review_service = None

def init_coding_challenge_service(llm_service):
    """Initialize the global Coding Challenge service"""
    global coding_challenge_service, code_review_service
    coding_challenge_service = CodingChallengeService(llm_service)
    code_review_service = CodeReviewService(llm_service)

@coding_challenge_bp.route('/incomplete-code', methods=['POST'])
def generate_incomplete_code():
    """Generate incomplete code for a specific objective"""
    data = request.json
    
    # Validate request
    if not data or 'objective' not in data or 'description' not in data:
        return jsonify({"error": "Objective and description are required"}), 400
    
    # Optional parameters with defaults
    language = data.get('language', 'Python')
    difficulty = data.get('difficulty', 'moderate')
    
    try:
        # Generate incomplete code
        incomplete_code = coding_challenge_service.generate_incomplete_code(
            objective=data['objective'], 
            description=data['description'],
            language=language,
            difficulty=difficulty
        )
        
        # Perform initial code review
        code_review = code_review_service.review_code(
            code=incomplete_code['code'], 
            language=incomplete_code['language']
        )
        
        return jsonify({
            "incomplete_code": incomplete_code,
            "initial_review": code_review
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@coding_challenge_bp.route('/output-based', methods=['POST'])
def generate_output_challenge():
    """Generate output-based coding challenge"""
    data = request.json
    
    # Validate request
    if not data or 'objective' not in data or 'description' not in data:
        return jsonify({"error": "Objective and description are required"}), 400
    
    # Optional parameters with defaults
    language = data.get('language', 'Python')
    difficulty = data.get('difficulty', 'moderate')
    
    try:
        # Generate output-based challenge
        output_challenge = coding_challenge_service.generate_output_challenge(
            objective=data['objective'], 
            description=data['description'],
            language=language,
            difficulty=difficulty
        )
        
        return jsonify(output_challenge)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@coding_challenge_bp.route('/problem-solving', methods=['POST'])
def generate_problem_solving_challenge():
    """Generate problem-solving coding challenge"""
    data = request.json
    
    # Validate request
    if not data or 'objective' not in data or 'description' not in data:
        return jsonify({"error": "Objective and description are required"}), 400
    
    # Optional parameters with defaults
    language = data.get('language', 'Python')
    difficulty = data.get('difficulty', 'moderate')
    
    try:
        # Generate problem-solving challenge
        problem_challenge = coding_challenge_service.generate_problem_solving_challenge(
            objective=data['objective'], 
            description=data['description'],
            language=language,
            difficulty=difficulty
        )
        
        return jsonify(problem_challenge)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@coding_challenge_bp.route('/submit-solution', methods=['POST'])
def submit_solution():
    """Submit and review a solution to a coding challenge"""
    data = request.json
    
    # Validate request
    if not data or 'code' not in data or 'language' not in data or 'challenge_type' not in data:
        return jsonify({"error": "Code, language, and challenge type are required"}), 400
    
    try:
        # Review the submitted solution
        code_review = code_review_service.review_code(
            code=data['code'], 
            language=data['language']
        )
        
        # Generate additional guidance based on the challenge type
        guidance = coding_challenge_service.generate_solution_guidance(
            code=data['code'],
            language=data['language'],
            challenge_type=data['challenge_type']
        )
        
        return jsonify({
            "code_review": code_review,
            "guidance": guidance
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500 