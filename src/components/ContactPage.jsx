import React from 'react';

const ContactPage = () => {
  return (
    <div className="container-fluid px-0 min-vh-100">
      <div className="row g-0 min-vh-100">
        <div className="col-12 px-0 bg-success text-white">
          <div className="text-center py-5">
            <h1 className="display-4 mb-3">📞 Contact Us</h1>
            <p className="lead">Get in touch with Nigeria's #1 Farm Store</p>
          </div>
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="row text-center">
                  <div className="col-md-4 mb-4">
                    <div className="p-4 bg-white bg-opacity-10 rounded">
                      <div className="mb-3">
                        <i className="fas fa-phone fa-3x"></i>
                      </div>
                      <h4>Phone</h4>
                      <p className="mb-1">+234 800 AGRI TECH</p>
                      <p>+234 809 123 4567</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <div className="p-4 bg-white bg-opacity-10 rounded">
                      <div className="mb-3">
                        <i className="fas fa-envelope fa-3x"></i>
                      </div>
                      <h4>Email</h4>
                      <p className="mb-1">info@agrohubstore.ng</p>
                      <p>support@agrohubstore.ng</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <div className="p-4 bg-white bg-opacity-10 rounded">
                      <div className="mb-3">
                        <i className="fas fa-map-marker-alt fa-3x"></i>
                      </div>
                      <h4>Location</h4>
                      <p className="mb-1">Lagos, Nigeria</p>
                      <p>Serving all 36 states</p>
                    </div>
                  </div>
                </div>
                <div className="row mt-5">
                  <div className="col-12 text-center">
                    <div className="p-4 bg-white bg-opacity-10 rounded">
                      <h4 className="mb-3">Business Hours</h4>
                      <div className="row">
                        <div className="col-md-6">
                          <p><strong>Monday - Friday:</strong> 8:00 AM - 8:00 PM</p>
                          <p><strong>Saturday:</strong> 9:00 AM - 6:00 PM</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Sunday:</strong> 10:00 AM - 4:00 PM</p>
                          <p><strong>Emergency Support:</strong> 24/7</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
