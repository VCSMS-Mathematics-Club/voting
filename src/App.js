import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const BASE_API_URL = "https://voting-project-y1kj.onrender.com/api";

function App() {
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState("");
  const [ipAddress, setIpAddress] = useState("");

  // Fetch local IP address
  const fetchIpAddress = async () => {
    try {
      const res = await axios.get("https://api64.ipify.org?format=json");
      setIpAddress(res.data.ip);
    } catch (err) {
      console.error("Error fetching IP:", err);
    }
  };

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}/candidates/`);
      setCandidates(res.data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  useEffect(() => {
    fetchIpAddress();
    fetchCandidates();
    const interval = setInterval(() => fetchCandidates(), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = async (candidateId) => {
    try {
      await axios.post(`${BASE_API_URL}/vote/`, {
        candidate_id: candidateId,
        ip_address: ipAddress, // Send local IP
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
