import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProblemChallenge } from '../lib/api-services';
import CodePage from './Code';

const ProblemPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchChallenge = async () => {
      // Get state from location or set default values
      const state = location.state || {};
      const language = state.language || 'javascript';
      const title = state.title || 'Problem Solving Challenge';
      const objective = state.objective || 'Problem Solving Challenge';
      const description = state.description || 'Write code to solve the given problem.';
      
      try {
        // Fetch the challenge from the API
        const challengeData = await fetchProblemChallenge(
          objective,
          description,
          language
        );
        
        // Navigate to code page with the challenge data
        navigate('/code', {
          state: {
            language,
            objective: challengeData.title || `${title}: ${objective}`,
            description: challengeData.instructions || challengeData.problem_statement || description,
            starterCode: challengeData.code || challengeData.starter_code || '',
            challengeType: 'problem',
            challenge: challengeData,
            hints: challengeData.hints || [],
            problemDetails: {
              problemStatement: challengeData.problem_statement || '',
              exampleCases: challengeData.example_cases || [],
              inputSpecification: challengeData.input_specification || {},
              outputSpecification: challengeData.output_specification || {},
              constraints: challengeData.challenge_details?.constraints || [],
              keyConcepts: challengeData.challenge_details?.key_concepts || []
            }
          },
          replace: true // Replace current route in history
        });
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Failed to load challenge. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchChallenge();
  }, [location.state, navigate]);
  
  if (error) {
    return (
      <div className="font-sans bg-[#121228] text-white min-h-screen flex items-center justify-center">
        <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-6 border border-[rgba(103,102,208,0.2)] max-w-md">
          <h1 className="text-2xl mb-4 text-[#f3535b]">Error Loading Challenge</h1>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-full bg-[rgba(103,102,208,0.2)] text-white font-medium transition-all duration-300 hover:bg-[rgba(103,102,208,0.4)] cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="font-sans bg-[#121228] text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Loading Problem Solving Challenge...</h1>
        <div className="animate-spin w-8 h-8 border-4 border-[rgba(103,102,208,0.6)] border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

export default ProblemPage; 