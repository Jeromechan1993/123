// App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Crisis, Solution, GameState } from './types';
import { CRISES, INITIAL_HOPE_VALUE, HOPE_VALUE_SUCCESS_INCREMENT, HOPE_VALUE_FAILURE_DECREMENT } from './constants';
import { getRandomCrisis } from './services/gameService';
import CrisisCard from './components/CrisisCard';
import GameResult from './components/GameResult';
import Header from './components/Header';
import Button from './components/Button';
import ShareReport from './components/ShareReport';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentCrisis: getRandomCrisis(),
    hopeValue: INITIAL_HOPE_VALUE,
    message: '选择一个方法来拯救世界！',
    showShareReport: false,
    isDailyChallenge: false, // For future daily challenge integration
    todaySavedCount: 0,
  });

  const [lastSolution, setLastSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false); // Tracks if the game is "over" (e.g., hope value too low)

  // Function to reset the game state
  const resetGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      currentCrisis: getRandomCrisis(),
      hopeValue: INITIAL_HOPE_VALUE,
      message: '选择一个方法来拯救世界！',
      todaySavedCount: 0, // Reset daily saves on full game restart
    }));
    setLastSolution(null);
    setShowResult(false);
    setGameOver(false);
    setIsLoading(false);
  }, []);

  // Handle solution selection
  const handleSelectSolution = useCallback((solution: Solution) => {
    setIsLoading(true);
    setLastSolution(solution);

    // Simulate async processing
    setTimeout(() => {
      setGameState((prev) => {
        let newHopeValue = prev.hopeValue;
        let newMessage = solution.text;
        let newCrisis = prev.currentCrisis;
        let isGameOverAfterAttempt = false;

        if (solution.outcome === 'success') {
          newHopeValue = Math.min(100, prev.hopeValue + HOPE_VALUE_SUCCESS_INCREMENT);
          newMessage = solution.successMessage || '成功了！世界又被拯救了一点点！';
        } else {
          newHopeValue = Math.max(0, prev.hopeValue - HOPE_VALUE_FAILURE_DECREMENT);
          newMessage = solution.failureMessage || '啊哦，好像失败了...';

          // If a solution fails and there's a Plan B, move to Plan B
          if (prev.currentCrisis.planB) {
            newCrisis = prev.currentCrisis.planB;
            newMessage += ' 启动 Plan B！';
          } else {
            // No Plan B, game might be over due to low hope
            if (newHopeValue <= 10) { // Example threshold for game over
              isGameOverAfterAttempt = true;
              newMessage += ' 希望值太低了，世界陷入危机！尝试重新开始吧！';
            }
          }
        }

        if (newHopeValue <= 0) {
          isGameOverAfterAttempt = true;
          newMessage = '希望值耗尽！世界陷入了绝望... 但没关系，重振旗鼓再来一次！';
        }

        return {
          ...prev,
          hopeValue: newHopeValue,
          message: newMessage,
          currentCrisis: newCrisis,
          todaySavedCount: solution.outcome === 'success' ? prev.todaySavedCount + 1 : prev.todaySavedCount,
        };
      });
      setShowResult(true);
      setGameOver(gameState.hopeValue <= 0); // Check game over condition after state update
      setIsLoading(false);
    }, 1500); // Simulate network delay
  }, [gameState.hopeValue, gameState.currentCrisis]); // Dependency on gameState to avoid stale closure for currentCrisis.planB logic

  // Handle continuing the game after a result
  const handleContinueGame = useCallback(() => {
    if (gameOver || gameState.hopeValue <= 0) {
      resetGame();
      return;
    }

    setShowResult(false);
    setLastSolution(null);
    setGameState((prev) => ({
      ...prev,
      currentCrisis: getRandomCrisis(), // Load a new random crisis
      message: '新的危机来袭，如何拯救？',
    }));
  }, [gameOver, gameState.hopeValue, resetGame]);

  // Handle skip button
  const handleSkipCrisis = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      currentCrisis: getRandomCrisis(),
      message: '跳过当前危机，新的挑战！',
    }));
    setShowResult(false);
    setLastSolution(null);
  }, []);

  // Handle "Today's saved" psychological comfort message and share report trigger
  useEffect(() => {
    if (gameState.todaySavedCount > 0 && gameState.todaySavedCount % 3 === 0 && !showResult && !isLoading) {
      setGameState((prev) => ({ ...prev, showShareReport: true }));
    }
  }, [gameState.todaySavedCount, showResult, isLoading]);

  const closeShareReport = useCallback(() => {
    setGameState((prev) => ({ ...prev, showShareReport: false }));
  }, []);

  return (
    <div className="relative w-full">
      <Header
        hopeValue={gameState.hopeValue}
        todaySavedCount={gameState.todaySavedCount}
        isDailyChallenge={gameState.isDailyChallenge}
      />

      <div className="relative z-10">
        {showResult && lastSolution ? (
          <GameResult
            solution={lastSolution}
            onContinue={handleContinueGame}
            isGameOver={gameOver}
          />
        ) : (
          <CrisisCard
            crisis={gameState.currentCrisis}
            onSelectSolution={handleSelectSolution}
            isLoading={isLoading}
          />
        )}
      </div>

      <div className="mt-8 flex justify-center gap-4 sticky bottom-4 z-20">
        <Button
          onClick={handleSkipCrisis}
          disabled={isLoading || showResult}
          className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 text-lg"
        >
          跳过 (划水)
        </Button>
      </div>

      {gameState.todaySavedCount > 0 && !showResult && !isLoading && (
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-md bg-green-500 px-4 py-2 rounded-full shadow-lg z-30 animate-pulse-fade">
          今日已拯救 {gameState.todaySavedCount} 次！
        </p>
      )}

      {gameState.showShareReport && (
        <ShareReport
          todaySavedCount={gameState.todaySavedCount}
          onClose={closeShareReport}
        />
      )}
    </div>
  );
};

export default App;
