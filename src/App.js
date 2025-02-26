import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState("");

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/candidates/");
      setCandidates(res.data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  useEffect(() => {
    fetchCandidates();
    const interval = setInterval(() => fetchCandidates(), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = async (candidateId) => {
    try {
      await axios.post("http://localhost:8000/api/vote/", {
        candidate_id: candidateId,
      });
      setVoted(true);
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.error || "Error casting vote.");
    }
  };

  const totalVotes = candidates.reduce(
    (total, candidate) => total + candidate.vote_count,
    0
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Vote for Your Candidate</h1>
      </header>

      <div className="vote-container">
        {candidates.map((candidate) => {
          const percentage =
            totalVotes > 0
              ? ((candidate.vote_count / totalVotes) * 100).toFixed(2)
              : 0;
          return (
            <div key={candidate.id} className="candidate-card">
              <h2>{candidate.name}</h2>
              <p>{candidate.vote_count} votes</p>
              <p>{percentage}% of total votes</p>
              {!voted && (
                <button onClick={() => handleVote(candidate.id)}>Vote</button>
              )}
            </div>
          );
        })}
      </div>

      {error && <div className="error">{error}</div>}
      {voted && <div className="success">Thanks for voting!</div>}
    </div>
  );
}

export default App;
