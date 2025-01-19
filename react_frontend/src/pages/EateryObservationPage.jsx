import React, { useState, useEffect,useContext  } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from '../UserContext';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { addObservation, getObservations } from "../services/EateryObservation";
import LogoutButton from '../helper/LogoutButton';
function EateryObservationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || {};

  const [observations, setObservations] = useState("");
  const [offenses, setOffenses] = useState([]);
  const [photoEvidence, setPhotoEvidence] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pastObservations, setPastObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const offensesList = [
    "Pests",
    "Mishandling of food",
    "Personal hygiene of individuals",
    "Others",
  ];
  const { user } = useContext(UserContext);
  useEffect(() => {
    const fetchObservations = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getObservations(results.license_no);
        if (response && response["eatery observations"]) {
          setPastObservations(response["eatery observations"]);
        } else {
          setPastObservations([]);
        }
      } catch (error) {
        setError("Failed to load past observations");
        setPastObservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchObservations();
  }, [results.license_no]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type;
      if (fileType === "image/png" || fileType === "image/jpeg" || fileType === "image/jpg") {
        setPhotoEvidence(file);
        setError("");
      } else {
        setError("Only PNG or JPG files are allowed.");
        setPhotoEvidence(null);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photoEvidence) {
      setError("Please upload a valid PNG or JPG file as photo evidence.");
      return;
    }
    const { eid, name: spotchecker_name } = user;
    const formData = new FormData();
    formData.append("license_no", results.license_no);
    formData.append("eid", eid);
    formData.append("spotchecker_name", spotchecker_name);
    formData.append("observation", observations);
    formData.append("offenses", JSON.stringify(offenses));
    formData.append("photo_evidence", photoEvidence);

    try {
      const response = await addObservation(results.license_no,formData);
      setMessage("Observation saved successfully");
      setError("");
      setObservations("");
      setOffenses([]);
      setPhotoEvidence("");

      const updatedResponse = await getObservations(results.license_no);
      setPastObservations(updatedResponse["eatery observations"]);
    } catch (error) {
      setError("Failed to save observation");
    }
  };

  const handleOffenseChange = (offense) => {
    if (offenses.includes(offense)) {
      setOffenses(offenses.filter((item) => item !== offense));
    } else {
      setOffenses([...offenses, offense]);
    }
  };


  return (
    <div>
      <h2>Add Observation for {results.eatery_name}</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formObservation">
          <Form.Label>Observation</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Enter observations here..."
            required
          />
          {error && error.includes("Observation") && <p style={{ color: "red" }}>{error}</p>}
        </Form.Group>

        <Form.Group controlId="formOffenses">
          <Form.Label>Offenses</Form.Label>
          {offensesList.map((offense) => (
            <div key={offense}>
              <Form.Check
                type="checkbox"
                label={offense}
                checked={offenses.includes(offense)}
                onChange={() => handleOffenseChange(offense)}
              />
            </div>
          ))}
        </Form.Group>

        <Form.Group controlId="formPhotoEvidence">
          <Form.Label>Photo Evidence (URL)</Form.Label>
          <Form.Control
            type="file"
            placeholder="Enter photo URL"
            accept=".png, .jpg, .jpeg"
            onChange={handleFileChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Save Observation
        </Button>
      </Form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Past Observations for {results.eatery_name}</h2>

      {loading ? (
        <p>Loading observations...</p>
      ) : pastObservations.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Spotchecker</th>
              <th>Observation</th>
              <th>Offenses</th>
              <th>Photo Evidence</th>
            </tr>
          </thead>
          <tbody>
            {pastObservations.map((obs, index) => (
              <tr key={index}>
                <td>{obs.date}</td>
                <td>{obs.spotchecker_name}</td>
                <td>{obs.observation}</td>
                <td>{obs.offenses.join(", ")}</td>
                <td>
                  <a href={`http://127.0.0.1:8000/images/${obs.photo_evidence}`} target="_blank" rel="noopener noreferrer">View Photo</a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No past observations found for this eatery.</p>
      )}

      <Button
        variant="secondary"
        onClick={() => navigate("/records", { state: { results  } })}
      >
        Back to records
      </Button>
      <LogoutButton />
    </div>
  );
}

export default EateryObservationPage;
