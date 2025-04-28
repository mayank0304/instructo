import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchOutputChallenge } from '../lib/api-services';
import CodePage from './Code';

const OutputPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchChallenge = async () => {
      // Get state from location or set default values
      const state = location.state || {};
      const language = state.language || 'javascript';
      const title = state.title || 'Output Based Challenge';
      const objective = state.objective || 'Output Matching Challenge';
      const description = state.description || 'Write code that produces the expected output.';
      
      try {
        // Fetch the challenge from the API
        const challengeData = await fetchOutputChallenge(
          objective,
          description,
          language
        );
        
        // Navigate to code page with the challenge data
        navigate('/code', {
          state: {
            language,
            objective: challengeData.title || `${title}: ${objective}`,
            description: challengeData.instructions || description,
            starterCode: challengeData.code || challengeData.starter_code || '',
            challengeType: 'output',
            challenge: challengeData,
            exampleOutput: challengeData.expected_output || challengeData.example_output || '',
            // Log to debug
            debug: JSON.stringify(challengeData)
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
            className="px-6 py-2 rounded-full bg-[rgba(243,83,91,0.8)] text-white font-medium shadow-md shadow-[rgba(243,83,91,0.3)] transition-all duration-300 hover:translate-y-[-2px] cursor-pointer"
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
        <h1 className="text-2xl mb-4">Loading Output Based Challenge...</h1>
        <div className="animate-spin w-8 h-8 border-4 border-[#f3535b] border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

export default OutputPage; 