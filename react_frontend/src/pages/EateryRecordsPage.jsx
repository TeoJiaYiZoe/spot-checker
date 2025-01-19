import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalizedList } from "../services/PersonalizedList";
import { UserContext } from "../UserContext"; 
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { normalSearch } from "../helper/searchHelper";
function EateryRecordsPage() {
  const [personalisedList, setPersonalisedList] = useState({});
  const [numRecords, setNumRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useContext(UserContext);
  const [licenseNo, setLicenseNo] = useState("");
  const [searchActionMsg, setSearchActionMsg] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPersonalizedList = async () => {
      try {
        const response = await getPersonalizedList(user.eid);
        if (response) {
          setPersonalisedList(response.personalized_list);
          setNumRecords(response.num_records || 0);
        } else {
          setErrorMessage("No data found for the provided employee ID.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Failed to fetch personalized eatery records.");
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalizedList();
  }, [user.eid]);

  const SearchListSubmit = async (e) => {
    e.preventDefault();
    if (!licenseNo) {
      setSearchActionMsg("Please enter a valid License No.");
      return;
    }

    try {
      const results = await normalSearch(licenseNo, "license_no", personalisedList);
      setSearchResults(results);
      if (!results) {
        setSearchActionMsg("Record not found.");
      } else {
        setSearchResults(results);
        setSearchActionMsg("");
        navigate("/eatery-result", { state: { results } });
      }
    } catch (error) {
      setSearchActionMsg("Search failed. Please try again.");
      console.error("Search error:", error);
    }
  };
  return (
    <div>
      <h1>Spot Checker Verify Eatery</h1>
      {loading && <p>Loading...</p>}
      {errorMessage && <p className="text-danger">{errorMessage}</p>}

      {!loading && !errorMessage && (
        <div>
          <p>Logged in and  you have {numRecords} record(s) for the week.</p>
          <Card>
            <Card.Body>
              <Form onSubmit={SearchListSubmit}>
              <Form.Group controlId="formLicenseNo">
                <Form.Label>License No.</Form.Label>
                <Form.Control type="text" placeholder="Eatery License No." name="licenseNo" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} />
              </Form.Group>

              <Button variant="primary" type="submit">
                Search License No.
              </Button>
            </Form>
            {searchActionMsg  && <p>{searchActionMsg }</p>}
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}

export default EateryRecordsPage;
