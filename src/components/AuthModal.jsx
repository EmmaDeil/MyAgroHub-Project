import React, { useState } from "react";
import {
  Modal,
  Form,
  Button,
  Alert,
  Card,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { authAPI, apiUtils } from "../services/api";

const AuthModal = ({ show, onHide, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "user", // Default to regular user
    address: {
      street: "",
      city: "",
      state: "",
      country: "Nigeria",
    },
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "danger",
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: "",
    color: "",
  });

  const showAlert = (message, variant = "danger") => {
    setAlert({ show: true, message, variant });
    setTimeout(
      () => setAlert({ show: false, message: "", variant: "danger" }),
      5000
    );
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let text = "";
    let color = "";

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        text = "Very Weak";
        color = "danger";
        break;
      case 2:
        text = "Weak";
        color = "warning";
        break;
      case 3:
        text = "Medium";
        color = "info";
        break;
      case 4:
        text = "Strong";
        color = "success";
        break;
      case 5:
        text = "Very Strong";
        color = "success";
        break;
      default:
        text = "";
        color = "";
    }

    return { score, text, color };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(loginData);
      const user = apiUtils.handleAuthResponse(response);

      showAlert("Login successful! Welcome back.", "success");
      setTimeout(() => {
        onLoginSuccess(user);
        onHide();
      }, 500);
    } catch (error) {
      showAlert(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      showAlert("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      showAlert("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: `${signupData.firstName} ${signupData.lastName}`,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,
        role: signupData.role || "user",
        address: signupData.address,
        billing: {
          fullName: `${signupData.firstName} ${signupData.lastName}`,
          address: signupData.address.street || "",
          city: signupData.address.city || "",
          state: signupData.address.state || "",
          postalCode: "",
          country: signupData.address.country || "Nigeria",
        },
        profileImage: null, // Will show generated avatar initially
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await authAPI.register(userData);
      const user = apiUtils.handleAuthResponse(response);

      showAlert("Account created successfully! Welcome to AgroHub.", "success");
      setTimeout(() => {
        onLoginSuccess(user);
        onHide();
      }, 1000);
    } catch (error) {
      showAlert(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginInputChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested address fields
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setSignupData({
        ...signupData,
        address: {
          ...signupData.address,
          [addressField]: value,
        },
      });
    } else {
      setSignupData({ ...signupData, [name]: value });
    }

    // Check password strength for password field
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // Toggle between login and signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setAlert({ show: false, message: "", variant: "danger" });
    // Clear forms when switching
    setLoginData({ email: "", password: "" });
    setSignupData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "user",
      address: {
        street: "",
        city: "",
        state: "",
        country: "Nigeria",
      },
    });
    setPasswordStrength({ score: 0, text: "", color: "" });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md" backdrop="static">
      <Modal.Body className="p-0">
        <div className="row g-0">
          {/* Left Side - Branding */}
          <div className="col-md-5 bg-success text-white d-flex flex-column justify-content-center p-4">
            <div className="text-center">
              <div className="mb-4">
                <span style={{ fontSize: "4rem" }}>🌾</span>
              </div>
              <h3 className="fw-bold mb-3">AgroHub</h3>
              <p className="mb-4 opacity-75">
                Connecting you to fresh, locally-sourced products from trusted
                farmers across Nigeria.
              </p>
              <div className="small">
                <div className="d-flex align-items-center mb-2">
                  <i className="fas fa-check-circle me-2"></i>
                  <span>Fresh farm products</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <i className="fas fa-check-circle me-2"></i>
                  <span>Direct from farmers</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-check-circle me-2"></i>
                  <span>Fast delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="col-md-7 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0 text-success fw-bold">
                {isLogin ? "Welcome Back!" : "Create Account"}
              </h4>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onHide}
                className="rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{
                  width: "35px",
                  height: "35px",
                  lineHeight: "1",
                  fontSize: "16px",
                  fontWeight: "normal",
                  border: "1px solid #dee2e6",
                }}
                title="Close"
              >
                ✕
              </Button>
            </div>

            {alert.show && (
              <Alert
                variant={alert.variant}
                className="mb-4"
                dismissible
                onClose={() =>
                  setAlert({ show: false, message: "", variant: "danger" })
                }
              >
                <i
                  className={`fas ${
                    alert.variant === "success"
                      ? "fa-check-circle"
                      : alert.variant === "info"
                      ? "fa-info-circle"
                      : "fa-exclamation-triangle"
                  } me-2`}
                ></i>
                {alert.message}
              </Alert>
            )}

            {isLogin ? (
              /* LOGIN FORM */
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="fas fa-envelope me-2 text-success"></i>
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                    placeholder="Enter your email address"
                    required
                    className="py-2"
                    style={{ fontSize: "0.95rem" }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">
                    <i className="fas fa-lock me-2 text-success"></i>
                    Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginInputChange}
                      placeholder="Enter your password"
                      required
                      className="py-2"
                      style={{ fontSize: "0.95rem" }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3"
                    >
                      <i
                        className={`fas ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button
                    variant="success"
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="py-2 fw-medium"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </Button>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                  <span className="text-muted">Don't have an account? </span>
                  <Button
                    variant="link"
                    onClick={toggleMode}
                    className="p-0 fw-medium text-decoration-none"
                  >
                    Create one here
                    <i className="fas fa-arrow-right ms-1"></i>
                  </Button>
                </div>
              </Form>
            ) : (
              /* SIGNUP FORM */
              <Form onSubmit={handleSignup}>
                <div className="row">
                  <div className="col-6">
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={signupData.firstName}
                        onChange={handleSignupInputChange}
                        placeholder="First name"
                        required
                        className="py-2"
                        style={{ fontSize: "0.95rem" }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={signupData.lastName}
                        onChange={handleSignupInputChange}
                        placeholder="Last name"
                        required
                        className="py-2"
                        style={{ fontSize: "0.95rem" }}
                      />
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="fas fa-envelope me-2 text-success"></i>
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupInputChange}
                    placeholder="Enter your email address"
                    required
                    className="py-2"
                    style={{ fontSize: "0.95rem" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="fas fa-phone me-2 text-success"></i>
                    Phone Number
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={signupData.phone}
                    onChange={handleSignupInputChange}
                    placeholder="+234 800 000 0000"
                    required
                    className="py-2"
                    style={{ fontSize: "0.95rem" }}
                  />
                </Form.Group>

                {/* Role Selection */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="fas fa-user-tag me-2 text-success"></i>I am a
                  </Form.Label>
                  <Form.Select
                    name="role"
                    value={signupData.role}
                    onChange={handleSignupInputChange}
                    required
                    className="py-2"
                    style={{ fontSize: "0.95rem" }}
                  >
                    <option value="user">Customer (Buy products)</option>
                    <option value="farmer">Farmer (Sell products)</option>
                  </Form.Select>
                </Form.Group>

                {/* Address Section */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="fas fa-map-marker-alt me-2 text-success"></i>
                    Street Address
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address.street"
                    value={signupData.address.street}
                    onChange={handleSignupInputChange}
                    placeholder="Street address, building, etc."
                    required
                    className="py-2"
                    style={{ fontSize: "0.95rem" }}
                  />
                </Form.Group>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">
                        <i className="fas fa-city me-2 text-success"></i>
                        City
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="address.city"
                        value={signupData.address.city}
                        onChange={handleSignupInputChange}
                        placeholder="City"
                        required
                        className="py-2"
                        style={{ fontSize: "0.95rem" }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">
                        <i className="fas fa-map me-2 text-success"></i>
                        State
                      </Form.Label>
                      <Form.Select
                        name="address.state"
                        value={signupData.address.state}
                        onChange={handleSignupInputChange}
                        required
                        className="py-2"
                        style={{ fontSize: "0.95rem" }}
                      >
                        <option value="">Select State</option>
                        <option value="Abia">Abia</option>
                        <option value="Adamawa">Adamawa</option>
                        <option value="Akwa Ibom">Akwa Ibom</option>
                        <option value="Anambra">Anambra</option>
                        <option value="Bauchi">Bauchi</option>
                        <option value="Bayelsa">Bayelsa</option>
                        <option value="Benue">Benue</option>
                        <option value="Borno">Borno</option>
                        <option value="Cross River">Cross River</option>
                        <option value="Delta">Delta</option>
                        <option value="Ebonyi">Ebonyi</option>
                        <option value="Edo">Edo</option>
                        <option value="Ekiti">Ekiti</option>
                        <option value="Enugu">Enugu</option>
                        <option value="FCT">Federal Capital Territory</option>
                        <option value="Gombe">Gombe</option>
                        <option value="Imo">Imo</option>
                        <option value="Jigawa">Jigawa</option>
                        <option value="Kaduna">Kaduna</option>
                        <option value="Kano">Kano</option>
                        <option value="Katsina">Katsina</option>
                        <option value="Kebbi">Kebbi</option>
                        <option value="Kogi">Kogi</option>
                        <option value="Kwara">Kwara</option>
                        <option value="Lagos">Lagos</option>
                        <option value="Nasarawa">Nasarawa</option>
                        <option value="Niger">Niger</option>
                        <option value="Ogun">Ogun</option>
                        <option value="Ondo">Ondo</option>
                        <option value="Osun">Osun</option>
                        <option value="Oyo">Oyo</option>
                        <option value="Plateau">Plateau</option>
                        <option value="Rivers">Rivers</option>
                        <option value="Sokoto">Sokoto</option>
                        <option value="Taraba">Taraba</option>
                        <option value="Yobe">Yobe</option>
                        <option value="Zamfara">Zamfara</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="fas fa-lock me-2 text-success"></i>
                    Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupInputChange}
                      placeholder="Create a strong password"
                      required
                      className="py-2"
                      style={{ fontSize: "0.95rem" }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3"
                    >
                      <i
                        className={`fas ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </Button>
                  </InputGroup>
                  {signupData.password && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Password Strength:</small>
                        <small
                          className={`text-${passwordStrength.color} fw-medium`}
                        >
                          {passwordStrength.text}
                        </small>
                      </div>
                      <div className="progress" style={{ height: "4px" }}>
                        <div
                          className={`progress-bar bg-${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">
                    Confirm Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleSignupInputChange}
                      placeholder="Confirm your password"
                      required
                      className="py-2"
                      style={{ fontSize: "0.95rem" }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="px-3"
                    >
                      <i
                        className={`fas ${
                          showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </Button>
                  </InputGroup>
                  {signupData.confirmPassword && (
                    <small
                      className={`text-${
                        signupData.password === signupData.confirmPassword
                          ? "success"
                          : "danger"
                      } mt-1 d-block`}
                    >
                      <i
                        className={`fas ${
                          signupData.password === signupData.confirmPassword
                            ? "fa-check"
                            : "fa-times"
                        } me-1`}
                      ></i>
                      {signupData.password === signupData.confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </small>
                  )}
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button
                    variant="success"
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="py-2 fw-medium"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </Button>
                </div>

                <div className="small text-muted text-center mb-3">
                  By creating an account, you agree to our{" "}
                  <a href="#" className="text-success text-decoration-none">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-success text-decoration-none">
                    Privacy Policy
                  </a>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                  <span className="text-muted">Already have an account? </span>
                  <Button
                    variant="link"
                    onClick={toggleMode}
                    className="p-0 fw-medium text-decoration-none"
                  >
                    Sign in here
                    <i className="fas fa-arrow-right ms-1"></i>
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
