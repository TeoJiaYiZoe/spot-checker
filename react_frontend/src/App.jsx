import { useState, useContext } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { UserContext, UserProvider } from './UserContext';

import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

import { sha1 } from "crypto-hash";

import ProtectedRoute from "./helper/protectedRoute";
import { login } from "./services/Login";
import EateryResultPage from "./pages/EateryResultPage";
import EateryObservationPage from "./pages/EateryObservationPage";
import EateryRecordsPage from "./pages/EateryRecordsPage";
import "./App.css";

function HomePage() {
  const [loggedInSession, setLoggedInSession] = useState("");
  const [loginActionMsg, setLoginActionMsg] = useState("");
  const [eid, setEid] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // Handle login form submission
  const loginSubmit = async (e) => {
    e.preventDefault();

    if (!eid || !password) {
      setLoginActionMsg("Log in attempt Failed, please try again.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const hashedPassword = await sha1(password);
      const loginResponse = await login(eid, hashedPassword);
      setLoggedInSession(eid);
      setUser({ eid, name: loginResponse.name });


      navigate("/records"); 
    } catch (error) {
      setLoginActionMsg("Log in attempt Failed, please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <h1>Spot Checker Verify Eatery</h1>
      <br />
      {!loggedInSession && (
        <Card>
          <Card.Body>
            <Form onSubmit={loginSubmit}>
              <Form.Group controlId="formEid">
                <Form.Label>Employee ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Employee ID"
                  name="eid"
                  value={eid}
                  onChange={(e) => {
                    setEid(e.target.value);
                    setLoginActionMsg("");
                  }}
                />
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginActionMsg("");
                  }}
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={isLoggingIn}>
                {isLoggingIn ? "Logging in..." : "Retrieve & Save Personalized List"}
              </Button>
            </Form>
            {loginActionMsg && <p className="text-danger">{loginActionMsg}</p>}
          </Card.Body>
        </Card>
      )}
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<HomePage />} />
          <Route
            path="/eatery-result"
            element={
              <ProtectedRoute>
                <EateryResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/observation"
            element={
              <ProtectedRoute>
                <EateryObservationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <EateryRecordsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
