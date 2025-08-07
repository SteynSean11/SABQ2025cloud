import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiAssistantSection } from './ai-assistant-section';

// Mock fetch globally
global.fetch = jest.fn();

describe('AiAssistantSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        candidates: [{
          content: {
            parts: [{
              text: 'Sample AI response'
            }]
          }
        }]
      })
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the main section with correct heading', () => {
      render(<AiAssistantSection />);
      
      expect(screen.getByText('8. Royal AI Assistant ✨')).toBeInTheDocument();
      expect(screen.getByText(/Leverage the power of AI/)).toBeInTheDocument();
    });

    it('should render Royal Budgeting Advisor section', () => {
      render(<AiAssistantSection />);
      
      expect(screen.getByText('Royal Budgeting Advisor ✨')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/How can I save money on groceries/)).toBeInTheDocument();
      expect(screen.getByText('Get Royal Advice ✨')).toBeInTheDocument();
    });

    it('should render Budget-Friendly Recipe section', () => {
      render(<AiAssistantSection />);
      
      expect(screen.getByText('Budget-Friendly Recipe Idea ✨')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Chicken, rice, R50 budget/)).toBeInTheDocument();
      expect(screen.getByText('Generate Recipe Idea ✨')).toBeInTheDocument();
    });

    it('should render empty response containers initially', () => {
      render(<AiAssistantSection />);
      
      const adviceContainer = screen.getAllByText('')[0]; // First empty div
      const recipeContainer = screen.getAllByText('')[1]; // Second empty div
      
      expect(adviceContainer).toBeInTheDocument();
      expect(recipeContainer).toBeInTheDocument();
    });
  });

  describe('Budgeting Advice Functionality', () => {
    it('should handle successful advice request', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      await user.type(textarea, 'How can I budget for groceries?');
      await user.click(button);
      
      expect(screen.getByText('Generating advice...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Sample AI response')).toBeInTheDocument();
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Provide practical budgeting advice for a South African context based on this question: "How can I budget for groceries?"'
        })
      });
    });

    it('should show error message when textarea is empty', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const button = screen.getByText('Get Royal Advice ✨');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a question.')).toBeInTheDocument();
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only input', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      await user.type(textarea, '   \n\t  ');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a question.')).toBeInTheDocument();
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle API response with no candidates', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          candidates: []
        })
      });
      
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      await user.type(textarea, 'Test question');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Sorry, I could not generate a response. Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle API response with malformed structure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: null
          }]
        })
      });
      
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      await user.type(textarea, 'Test question');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Sorry, I could not generate a response. Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      await user.type(textarea, 'Test question');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('An error occurred. Please try again later.')).toBeInTheDocument();
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Error calling backend API:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should clear previous advice when making new request', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      // First request
      await user.type(textarea, 'First question');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Sample AI response')).toBeInTheDocument();
      });
      
      // Clear textarea and make second request
      await user.clear(textarea);
      await user.type(textarea, 'Second question');
      await user.click(button);
      
      // Should show loading immediately and clear previous response
      expect(screen.getByText('Generating advice...')).toBeInTheDocument();
    });
  });

  describe('Recipe Generation Functionality', () => {
    it('should handle successful recipe request', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/Chicken, rice, R50 budget/);
      const button = screen.getByText('Generate Recipe Idea ✨');
      
      await user.type(textarea, 'Chicken and rice, R30 budget');
      await user.click(button);
      
      expect(screen.getByText('Generating recipe...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Sample AI response')).toBeInTheDocument();
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Suggest a budget-friendly recipe idea for a South African family based on: "Chicken and rice, R30 budget". Include ingredients and simple steps.'
        })
      });
    });

    it('should show error message when recipe textarea is empty', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const button = screen.getByText('Generate Recipe Idea ✨');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Please list some ingredients or a budget.')).toBeInTheDocument();
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle recipe request with only whitespace', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/Chicken, rice, R50 budget/);
      const button = screen.getByText('Generate Recipe Idea ✨');
      
      await user.type(textarea, '   \n  ');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Please list some ingredients or a budget.')).toBeInTheDocument();
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should clear previous recipe when making new request', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/Chicken, rice, R50 budget/);
      const button = screen.getByText('Generate Recipe Idea ✨');
      
      // First request
      await user.type(textarea, 'Chicken, R30');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Sample AI response')).toBeInTheDocument();
      });
      
      // Clear textarea and make second request
      await user.clear(textarea);
      await user.type(textarea, 'Beef, R50');
      await user.click(button);
      
      // Should show loading immediately
      expect(screen.getByText('Generating recipe...')).toBeInTheDocument();
    });
  });

  describe('Multiple Concurrent Requests', () => {
    it('should handle concurrent advice and recipe requests independently', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const adviceTextarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const recipeTextarea = screen.getByPlaceholderText(/Chicken, rice, R50 budget/);
      const adviceButton = screen.getByText('Get Royal Advice ✨');
      const recipeButton = screen.getByText('Generate Recipe Idea ✨');
      
      // Start both requests simultaneously
      await user.type(adviceTextarea, 'Budget advice question');
      await user.type(recipeTextarea, 'Recipe ingredients');
      
      await Promise.all([
        user.click(adviceButton),
        user.click(recipeButton)
      ]);
      
      // Both loading states should be visible
      expect(screen.getByText('Generating advice...')).toBeInTheDocument();
      expect(screen.getByText('Generating recipe...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getAllByText('Sample AI response')).toHaveLength(2);
      });
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long input text', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const longText = 'A'.repeat(10000); // Very long string
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      await user.type(textarea, longText);
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Sample AI response')).toBeInTheDocument();
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Provide practical budgeting advice for a South African context based on this question: "${longText}"`
        })
      });
    });

    it('should handle special characters in input', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const specialText = 'How to budget with R$ & €? "quotes" and \backslashes';
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      await user.type(textarea, specialText);
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Sample AI response')).toBeInTheDocument();
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Provide practical budgeting advice for a South African context based on this question: "${specialText}"`
        })
      });
    });

    it('should handle empty API response gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({})
      });
      
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      await user.type(textarea, 'Test question');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Sorry, I could not generate a response. Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle API returning non-JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      await user.type(textarea, 'Test question');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('An error occurred. Please try again later.')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    it('should properly handle loading states', async () => {
      // Mock a delayed response
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: 'Delayed response' }]
              }
            }]
          })
        }), 100))
      );
      
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const textarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const button = screen.getByText('Get Royal Advice ✨');
      
      await user.type(textarea, 'Test question');
      await user.click(button);
      
      // Should show loading immediately
      expect(screen.getByText('Generating advice...')).toBeInTheDocument();
      
      // Wait for response
      await waitFor(() => {
        expect(screen.getByText('Delayed response')).toBeInTheDocument();
      });
      
      // Loading should be gone
      expect(screen.queryByText('Generating advice...')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button accessibility attributes', () => {
      render(<AiAssistantSection />);
      
      const adviceButton = screen.getByText('Get Royal Advice ✨');
      const recipeButton = screen.getByText('Generate Recipe Idea ✨');
      
      expect(adviceButton).toHaveAttribute('type', 'button');
      expect(recipeButton).toHaveAttribute('type', 'button');
    });

    it('should have proper textarea accessibility attributes', () => {
      render(<AiAssistantSection />);
      
      const adviceTextarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const recipeTextarea = screen.getByPlaceholderText(/Chicken, rice, R50 budget/);
      
      expect(adviceTextarea).toHaveAttribute('rows', '4');
      expect(recipeTextarea).toHaveAttribute('rows', '4');
    });
  });

  describe('UI State Management', () => {
    it('should maintain separate state for advice and recipe sections', async () => {
      const user = userEvent.setup();
      render(<AiAssistantSection />);
      
      const adviceTextarea = screen.getByPlaceholderText(/How can I save money on groceries/);
      const recipeTextarea = screen.getByPlaceholderText(/Chicken, rice, R50 budget/);
      const adviceButton = screen.getByText('Get Royal Advice ✨');
      
      // Generate advice
      await user.type(adviceTextarea, 'Budget question');
      await user.click(adviceButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sample AI response')).toBeInTheDocument();
      });
      
      // Recipe section should still be empty
      const recipeContainer = screen.getByText('Generate Recipe Idea ✨').parentElement?.querySelector('[class*="min-h-"]');
      expect(recipeContainer).toHaveTextContent('');
      
      // Type in recipe section should not affect advice
      await user.type(recipeTextarea, 'Recipe ingredients');
      expect(screen.getByText('Sample AI response')).toBeInTheDocument();
    });
  });
});