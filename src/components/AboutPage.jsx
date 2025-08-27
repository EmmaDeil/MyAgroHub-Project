import React from 'react';

const AboutPage = () => {
  return (
    <div className="container-fluid px-0 min-vh-100">
      <div className="row g-0 min-vh-100">
        <div className="col-12 px-4 py-5 bg-light">
          <div className="text-center mb-5">
            <h1 className="display-4 text-success mb-3">🌱 About AgroHub Farm Store</h1>
            <p className="lead text-muted">Transforming Agriculture in Africa</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="h-100 p-4 bg-white rounded shadow-sm">
                    <h3 className="text-success mb-3">Our Story</h3>
                    <p className="lead">
                      We're transforming agriculture in Africa by connecting farmers directly with consumers, 
                      ensuring fresh produce and fair prices for everyone.
                    </p>
                    <ul className="list-unstyled">
                      <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>Direct from farm to table</li>
                      <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>Supporting local farmers</li>
                      <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>100% organic products</li>
                      <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>Fair trade practices</li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="h-100 p-4 bg-success text-white rounded shadow-sm">
                    <h3 className="mb-3">🎯 Our Mission</h3>
                    <p className="mb-4">
                      Bridging the gap between Nigerian farmers and consumers through technology, 
                      promoting sustainable agriculture and food security across Africa.
                    </p>
                    <div className="mt-4">
                      <h5>🌍 Impact Statistics</h5>
                      <div className="row text-center mt-3">
                        <div className="col-4">
                          <h4>500+</h4>
                          <small>Farmers</small>
                        </div>
                        <div className="col-4">
                          <h4>36</h4>
                          <small>States</small>
                        </div>
                        <div className="col-4">
                          <h4>10k+</h4>
                          <small>Orders</small>
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

export default AboutPage;
