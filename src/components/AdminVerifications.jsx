import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Badge, Spinner } from "react-bootstrap";
import { adminAPI } from "../services/api";

const AdminVerifications = ({ show, onHide }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getVerifications({ status: "pending" });
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load verifications:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) loadRequests();
  }, [show]);

  const handleApprove = async (userId) => {
    if (!window.confirm("Approve this verification?")) return;
    try {
      setActionLoading(true);
      await adminAPI.updateVerification(userId, { status: "verified" });
      await loadRequests();
    } catch (err) {
      console.error("Approve failed:", err);
      alert(err.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId) => {
    const notes = window.prompt("Enter rejection reason / notes (optional)");
    if (notes === null) return;
    try {
      setActionLoading(true);
      await adminAPI.updateVerification(userId, {
        status: "rejected",
        adminNotes: notes,
      });
      await loadRequests();
    } catch (err) {
      console.error("Reject failed:", err);
      alert(err.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Pending Verifications</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-4">No pending verifications</div>
        ) : (
          <Table responsive>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Submitted</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.verification?.submittedAt
                      ? new Date(u.verification.submittedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    {u.verification?.documents &&
                    u.verification.documents.length > 0
                      ? u.verification.documents.map((d, i) => (
                          <div key={i}>
                            <a href={d.url} target="_blank" rel="noreferrer">
                              {d.filename || d.url}
                            </a>
                          </div>
                        ))
                      : "—"}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="success"
                      className="me-2"
                      disabled={actionLoading}
                      onClick={() => handleApprove(u._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={actionLoading}
                      onClick={() => handleReject(u._id)}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminVerifications;
