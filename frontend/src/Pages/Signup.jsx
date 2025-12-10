import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // basic validation
    if (!fullname || !username || !password || !gender) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/register`,
        { fullname, username, password, gender },
        { withCredentials: true }
      );

      if (res.data.sucess) {
        // Show success message and redirect to login page
        alert("Account created successfully! Please login.");
        navigate("/", { replace: true });
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl mb-4">Signup</h2>
      <form onSubmit={handleSignup} className="flex flex-col gap-3 w-80">
        <input
          type="text"
          placeholder="Full Name"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account? </span>
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-700 font-medium"
            type="button"
          >
            Login
          </button>
        </div>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </form>
    </div>
  );
}
