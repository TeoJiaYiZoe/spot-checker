import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";

function EateryResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || {};

  return (
    <div>
      <h2>Search Results</h2>
      {results ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>License No</td>
              <td>{results.license_no}</td>
            </tr>
            <tr>
              <td>Eatery Name</td>
              <td>{results.eatery_name}</td>
            </tr>
            <tr>
              <td>Owner Name</td>
              <td>{results.owner_name}</td>
            </tr>
            <tr>
              <td>Owner Contact No</td>
              <td>{results.owner_contact_no}</td>
            </tr>
            <tr>
              <td>Last Checked Date</td>
              <td>{results.last_checked_date}</td>
            </tr>
            <tr>
              <td>Last Checked By (EID)</td>
              <td>{results.last_check_by_eid}</td>
            </tr>
            <tr>
              <td>Last Checked By (Name)</td>
              <td>{results.last_check_by_name}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>No results found.</p>
      )}
      <Button variant="secondary" onClick={() => navigate("/records")}>
        Back to Search
      </Button>
      <Button variant="secondary" onClick={() => navigate("/observation", { state: { results } })} >
        Add Observation
      </Button>
    </div>
  );
}

export default EateryResultPage;
