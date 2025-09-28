import React, { useState } from "react";
import { useWallet, ConnectButton } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID =
  "0xc6260075d76aad512f602e9fb6d25cb0e2905b79aff53cd895fd7f052bddaad1";

// Game result interface
interface GameResult {
  player: string;
  player_choice: number;
  opponent_choice: number;
  outcome: number; // 0=Draw, 1=Win, 2=Loss
  timestamp: number;
}

export function Game() {
  const wallet = useWallet();
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const playGame = async (choice: number) => {
    if (!wallet.account) {
      alert("Connect your wallet first!");
      return;
    }

    setIsLoading(true);

    const RANDOM_ID = "0x0000000000000000000000000000000000000000000000000000000000000008";

    try {
      const tx = new Transaction();

      console.log(`Calling play function with choice: ${choice} (u8, 1-3)`);
      
      console.log(`Using Random object ID: ${RANDOM_ID}`);
      (tx as any).moveCall({
        target: `${PACKAGE_ID}::rock_paper_scissors::play`,
        arguments: [
          tx.object(RANDOM_ID),
          tx.pure.u8(choice), // Player choice: 1=Rock, 2=Paper, 3=Scissors
        ],
      });

      // sign + execute
      const result = await wallet.signAndExecuteTransaction({
        transaction: tx as any,
      });

      console.log("Transaction result:", result);

      console.log("Transaction completed successfully!");
      
      const mockGameResult: GameResult = {
        player: wallet.address || 'Unknown',
        player_choice: choice,
        opponent_choice: Math.floor(Math.random() * 3) + 1,
        outcome: Math.floor(Math.random() * 3), 
        timestamp: Date.now()
      };
      
      setGameResults(prev => [mockGameResult, ...prev]);
      
      // Show result message
      const choiceNames = ['', 'Rock', 'Paper', 'Scissors'];
      const outcomeMessages = ['Draw!', 'You Win!', 'You Lose!'];
      
      alert(`${choiceNames[choice]} vs ${choiceNames[mockGameResult.opponent_choice]} - ${outcomeMessages[mockGameResult.outcome]}`);
    } catch (err) {
      console.error("Transaction failed:", err);
      
      // Provide more helpful error message
      console.error("Full error details:", err);
      
      if (err instanceof Error) {
        if (err.message.includes('ArityMismatch')) {
          console.log("ArityMismatch error - function signature issue");
          alert("Function signature mismatch. Check console for details.");
        } else if (err.message.includes('ObjectNotFound') || err.message.includes('random') || err.message.includes('TypeMismatch')) {
          console.log("TypeMismatch or Random object issue");
          console.log("Using Random object ID:", RANDOM_ID);
          console.log("If this fails, the Random object might not exist on this network");
          alert("Random object issue. Check console for details.");
        } else {
          console.log("Other transaction error:", err.message);
          alert(`Transaction failed: ${err.message}. Check console for details.`);
        }
      } else {
        alert("Transaction failed! See console for details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getChoiceName = (choice: number) => {
    const names = ['', 'Rock', 'Paper', 'Scissors'];
    return names[choice] || 'Unknown';
  };

  const getOutcomeText = (outcome: number) => {
    const outcomes = ['Draw', 'You Win!', 'You Lose!'];
    return outcomes[outcome] || 'Unknown';
  };

  const getOutcomeColor = (outcome: number) => {
    const colors = ['#666', '#4CAF50', '#F44336'];
    return colors[outcome] || '#666';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Rock-Paper-Scissors</h2>
      <ConnectButton />
      
      <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <button 
          onClick={() => playGame(1)} 
          disabled={isLoading}
          style={{ 
            margin: '5px', 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Playing...' : 'Rock'}
        </button>
        <button 
          onClick={() => playGame(2)} 
          disabled={isLoading}
          style={{ 
            margin: '5px', 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Playing...' : 'Paper'}
        </button>
        <button 
          onClick={() => playGame(3)} 
          disabled={isLoading}
          style={{ 
            margin: '5px', 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Playing...' : 'Scissors'}
        </button>
      </div>

      {/* Game Results */}
      {gameResults.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Game Results</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {gameResults.map((result, index) => (
              <div 
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  margin: '10px 0',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{getChoiceName(result.player_choice)}</strong> vs <strong>{getChoiceName(result.opponent_choice)}</strong>
                  </div>
                  <div style={{ 
                    color: getOutcomeColor(result.outcome),
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>
                    {getOutcomeText(result.outcome)}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          
          {/* Statistics */}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
            <h4>Statistics</h4>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <strong style={{ color: '#4CAF50' }}>Wins: {gameResults.filter(r => r.outcome === 1).length}</strong>
              </div>
              <div>
                <strong style={{ color: '#666' }}>Draws: {gameResults.filter(r => r.outcome === 0).length}</strong>
              </div>
              <div>
                <strong style={{ color: '#F44336' }}>Losses: {gameResults.filter(r => r.outcome === 2).length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
