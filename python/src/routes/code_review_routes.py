from flask import Blueprint, request, jsonify
from ..services.code_review_service import CodeReviewService
from ..factories.llm_factory import LLMFactory

# Create a Blueprint for code review routes
code_review_bp = Blueprint('code_review', __name__)

# Global Code Review service 
code_review_service = None

def init_code_review_service(llm_service):
    """Initialize the global Code Review service"""
    global code_review_service
    code_review_service = CodeReviewService(llm_service)

@code_review_bp.route('/review', methods=['POST'])
def review_code():
    """Review submitted code and provide guidance"""
    data = request.json
    
    if not data or 'code' not in data or 'language' not in data:
        return jsonify({"error": "Code and language are required"}), 400
    
    try:
        # Review code and get guidance
        review = code_review_service.review_code(
            data['code'], 
            data['language']
        )
        return jsonify(review)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@code_review_bp.route('/chat', methods=['POST'])
def code_chat():
    """Provide coding-related chat assistance"""
    data = request.json
    
    if not data or 'message' not in data:
        return jsonify({"error": "Message is required"}), 400
    
    try:
        # Get chat response
        response = code_review_service.get_chat_response(
            data['message']
        )
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500 