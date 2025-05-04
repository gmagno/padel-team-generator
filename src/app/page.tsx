"use client";

import { useState } from "react";

// Define types for player with side preference
type PlayerSide = "R" | "L" | "ANY";

interface Player {
  name: string;
  side: PlayerSide;
}

interface Match {
  team1Index: number;
  team2Index: number;
}

export default function Home() {
  const [leftPlayerNames, setLeftPlayerNames] = useState<string>("");
  const [rightPlayerNames, setRightPlayerNames] = useState<string>("");
  const [teams, setTeams] = useState<Player[][]>([]);
  const [subs, setSubs] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Function to generate sample player list with equal R and L players
  const generateSamplePlayers = (count: number) => {
    // For odd numbers, we'll add one extra player
    const isOdd = count % 2 !== 0;
    const baseCount = isOdd ? count - 1 : count;
    const halfCount = baseCount / 2;
    
    let rightPlayers = '';
    let leftPlayers = '';
    
    // Generate players with L side
    for (let i = 1; i <= halfCount; i++) {
      leftPlayers += `Player ${i}\n`;
    }
    
    // Generate players with R side
    for (let i = halfCount + 1; i <= baseCount; i++) {
      rightPlayers += `Player ${i}\n`;
    }
    
    // Add an extra player if count is odd (to the left side for simplicity)
    if (isOdd) {
      leftPlayers += `Player ${count}\n`;
    }
    
    setRightPlayerNames(rightPlayers.trim());
    setLeftPlayerNames(leftPlayers.trim());
  };

  // Function to parse player input
  const parsePlayerInput = (rightInput: string, leftInput: string): Player[] => {
    // Process right players
    const rightLines = rightInput.split("\n").map(line => line.trim()).filter(line => line !== "");
    const rightPlayers = rightLines.map(line => ({
      name: line,
      side: "R" as PlayerSide
    }));
    
    // Process left players
    const leftLines = leftInput.split("\n").map(line => line.trim()).filter(line => line !== "");
    const leftPlayers = leftLines.map(line => ({
      name: line,
      side: "L" as PlayerSide
    }));
    
    // Combine and return all players
    return [...rightPlayers, ...leftPlayers];
  };

  // Function to generate random teams from the list of players
  const generateTeams = () => {
    setError(null);
    setMatches([]);
    setSubs([]);

    // Parse player input
    const players = parsePlayerInput(rightPlayerNames, leftPlayerNames);

    if (players.length < 2) {
      setError(`Please enter at least 2 player names. Current input has ${players.length} valid names.`);
      return;
    }

    // Count players by side preference
    const rightPlayers = players.filter(p => p.side === "R");
    const leftPlayers = players.filter(p => p.side === "L");
    const anyPlayers = players.filter(p => p.side === "ANY");

    // Calculate how many teams we can form
    const maxPossibleTeams = Math.min(
      rightPlayers.length + Math.floor(anyPlayers.length / 2),
      leftPlayers.length + Math.floor(anyPlayers.length / 2)
    );
    
    if (maxPossibleTeams === 0) {
      setError("Cannot form valid teams. Make sure you have enough players for each side (R and L).");
      return;
    }
    
    // Shuffle the players
    const shuffledRight = [...rightPlayers].sort(() => Math.random() - 0.5);
    const shuffledLeft = [...leftPlayers].sort(() => Math.random() - 0.5);
    const shuffledAny = [...anyPlayers].sort(() => Math.random() - 0.5);
    
    // Create teams
    const generatedTeams: Player[][] = [];
    
    // Determine how many teams to create based on the total number of players
    const totalPlayers = players.length;
    const numberOfTeams = Math.min(maxPossibleTeams, Math.ceil(totalPlayers / 2));
    
    // Initialize empty teams
    for (let i = 0; i < numberOfTeams; i++) {
      generatedTeams.push([]);
    }
    
    // Helper function to assign a player to a team
    const assignPlayerToTeam = (player: Player, teamIndex: number) => {
      generatedTeams[teamIndex].push(player);
    };
    
    // First, assign right-side players to teams
    shuffledRight.forEach((player, index) => {
      if (index < numberOfTeams) {
        assignPlayerToTeam(player, index);
      }
    });
    
    // Then, assign left-side players to teams
    shuffledLeft.forEach((player, index) => {
      if (index < numberOfTeams) {
        assignPlayerToTeam(player, index);
      }
    });
    
    // Count how many right and left positions are still needed
    const rightNeeded = numberOfTeams - shuffledRight.length;
    const leftNeeded = numberOfTeams - shuffledLeft.length;
    
    // Assign "ANY" players to fill remaining positions
    let anyIndex = 0;
    
    // Fill right positions
    for (let i = 0; i < rightNeeded && anyIndex < shuffledAny.length; i++) {
      const teamIndex = shuffledRight.length + i;
      if (teamIndex < numberOfTeams) {
        const player = { ...shuffledAny[anyIndex], side: "R" as PlayerSide };
        assignPlayerToTeam(player, teamIndex);
        anyIndex++;
      }
    }
    
    // Fill left positions
    for (let i = 0; i < leftNeeded && anyIndex < shuffledAny.length; i++) {
      const teamIndex = shuffledLeft.length + i;
      if (teamIndex < numberOfTeams) {
        const player = { ...shuffledAny[anyIndex], side: "L" as PlayerSide };
        assignPlayerToTeam(player, teamIndex);
        anyIndex++;
      }
    }
    
    // Distribute any remaining "ANY" players
    while (anyIndex < shuffledAny.length) {
      const teamIndex = anyIndex % numberOfTeams;
      const player = shuffledAny[anyIndex];
      
      // Determine which side this player should play based on the team's needs
      const team = generatedTeams[teamIndex];
      const hasRight = team.some(p => p.side === "R");
      const hasLeft = team.some(p => p.side === "L");
      
      if (!hasRight) {
        assignPlayerToTeam({ ...player, side: "R" }, teamIndex);
      } else if (!hasLeft) {
        assignPlayerToTeam({ ...player, side: "L" }, teamIndex);
      } else {
        // This team already has both positions filled, try the next team
        continue;
      }
      
      anyIndex++;
    }
    
    // Check if any teams are incomplete (don't have both R and L players)
    const incompleteTeams = generatedTeams.filter(team => {
      const hasRight = team.some(p => p.side === "R");
      const hasLeft = team.some(p => p.side === "L");
      return !hasRight || !hasLeft;
    });
    
    if (incompleteTeams.length > 0) {
      setError("Could not create balanced teams. Some teams are missing players for specific sides.");
      return;
    }
    
    // Identify unassigned players (subs)
    const assignedPlayers = new Set();
    generatedTeams.forEach(team => {
      team.forEach(player => {
        assignedPlayers.add(player.name);
      });
    });
    
    const unassignedPlayers = players.filter(player => !assignedPlayers.has(player.name));
    
    setTeams(generatedTeams);
    setSubs(unassignedPlayers);
  };

  // Function to generate random matches between teams
  const generateMatches = () => {
    if (teams.length < 2) {
      setError("Need at least 2 teams to generate matches");
      return;
    }

    // Create an array of team indices
    const teamIndices = Array.from({ length: teams.length }, (_, i) => i);
    
    // Shuffle the team indices
    const shuffledTeamIndices = [...teamIndices].sort(() => Math.random() - 0.5);
    
    // Create matches by pairing teams
    const generatedMatches: Match[] = [];
    
    // If odd number of teams, one team will not play
    for (let i = 0; i < Math.floor(shuffledTeamIndices.length / 2); i++) {
      generatedMatches.push({
        team1Index: shuffledTeamIndices[i * 2],
        team2Index: shuffledTeamIndices[i * 2 + 1]
      });
    }
    
    setMatches(generatedMatches);
  };

  // Helper function to format player name with side
  const formatPlayerName = (player: Player): string => {
    return `${player.name} [${player.side}]`;
  };

  // Helper function to format team as a string
  const formatTeam = (team: Player[]): string => {
    // Sort players so that left players come first
    const sortedTeam = [...team].sort((a, b) => {
      if (a.side === "L" && b.side === "R") return -1;
      if (a.side === "R" && b.side === "L") return 1;
      return 0;
    });
    
    return sortedTeam.map(player => formatPlayerName(player)).join(" / ");
  };

  // Generate teams text for display
  const teamsText = teams.map((team, index) => `Team ${index + 1}: ${formatTeam(team)}`).join("\n") + 
    (subs.length > 0 ? `\n\nSubs: ${subs.map(player => formatPlayerName(player)).join(", ")}` : "");

  // Generate matches text for display
  const matchesText = matches.map((match, index) => 
    `Match ${index + 1}: Team ${match.team1Index + 1} vs Team ${match.team2Index + 1}`
  ).join("\n");

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Padel Team Generator</h1>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Player input section */}
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Enter player names (one per line):
            </label>
            <p className="text-sm text-gray-600 mb-2">
              Players will be assigned to their respective sides (Left or Right)
            </p>
          </div>
          
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            {/* Left players input */}
            <div className="flex-1">
              <label htmlFor="leftPlayerNames" className="block text-sm font-medium mb-2">
                Left (L) Players:
              </label>
              <textarea
                id="leftPlayerNames"
                className="w-full h-60 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={leftPlayerNames}
                onChange={(e) => setLeftPlayerNames(e.target.value)}
                placeholder={`Jane Smith
Alex Johnson`}
              />
            </div>
            
            {/* Right players input */}
            <div className="flex-1">
              <label htmlFor="rightPlayerNames" className="block text-sm font-medium mb-2">
                Right (R) Players:
              </label>
              <textarea
                id="rightPlayerNames"
                className="w-full h-60 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={rightPlayerNames}
                onChange={(e) => setRightPlayerNames(e.target.value)}
                placeholder={`John Doe
Sam Wilson`}
              />
            </div>
          </div>
          
          <div className="mt-2 flex space-x-2">
            <button
              onClick={() => generateSamplePlayers(8)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-md text-sm transition-colors"
              type="button"
            >
              8 Players
            </button>
            <button
              onClick={() => generateSamplePlayers(16)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-md text-sm transition-colors"
              type="button"
            >
              16 Players
            </button>
          </div>
        </div>

        <button
          onClick={generateTeams}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Generate Teams
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Teams display section */}
        {teams.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Generated Teams:</h2>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
              <pre className="whitespace-pre-wrap font-mono text-sm">{teamsText}</pre>
            </div>
            
            <button
              onClick={generateMatches}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Generate Matches
            </button>
          </div>
        )}

        {/* Matches display section */}
        {matches.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Generated Matches:</h2>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
              <pre className="whitespace-pre-wrap font-mono text-sm">{matchesText}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
