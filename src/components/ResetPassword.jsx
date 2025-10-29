import React, { useState, useEffect } from "react";
import { Form, Button, Alert, InputGroup, Spinner } from "react-bootstrap";
import { authAPI } from "../services/api";

const ResetPassword = ({
  token: propToken,
  email: propEmail,
  onNavigate,
  onOpenAuth,
}) => {
  const [token, setToken] = useState(propToken || "");
  const [email, setEmail] = useState(propEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "danger",
  });

  useEffect(() => {
    // If no token/email provided via props, try reading from query params
    if ((!token || !email) && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("token");
      const e = params.get("email");
      if (t) setToken(t);
      if (e) setEmail(decodeURIComponent(e));
    }
    // run when token/email change
  }, [token, email]);

  const showAlert = (message, variant = "danger") => {
    setAlert({ show: true, message, variant });
    setTimeout(
      () => setAlert({ show: false, message: "", variant: "danger" }),
      5000
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      showAlert("Missing token or email. Use the link from your email.");
      return;
    }
    if (password.length < 6) {
      showAlert("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ token, email, newPassword: password });
      showAlert("Password reset successfully. You can now sign in.", "success");
      setPassword("");
      setConfirmPassword("");
      // Optionally navigate back to landing or sign-in after a short delay
      setTimeout(() => {
        // Open auth modal so user can sign in with new password
        if (onOpenAuth) onOpenAuth();
        if (onNavigate) onNavigate("landing");
      }, 1200);
    } catch (err) {
      showAlert(
        err.message ||
          "Failed to reset password. The token may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h4 className="mb-3 text-success">Reset Password</h4>

              {alert.show && (
                <Alert
                  variant={alert.variant}
                  onClose={() =>
                    setAlert({ show: false, message: "", variant: "danger" })
                  }
                  dismissible
                >
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    Confirm Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    disabled={loading}
                    className="py-2"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => onNavigate && onNavigate("landing")}
                    className="p-0"
                  >
                    Back to Home
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
