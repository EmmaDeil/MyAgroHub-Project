import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import AdminNavbar from "./AdminNavbar";
import { adminAPI } from "../services/api";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminReports = ({ user, onLogout, onNavigate }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);

  // Load reports data from backend
  useEffect(() => {
    loadReportsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getReports(selectedPeriod);

      if (response.success) {
        const data = response.data;

        // Transform sales over time data for chart
        const salesLabels = data.salesOverTime.map((item) => {
          const date = new Date(item._id);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        });
        const salesValues = data.salesOverTime.map((item) => item.totalSales);

        // Transform orders by status for chart
        const statusMap = {
          Pending: { color: "#ffc107", label: "Pending" },
          Processing: { color: "#17a2b8", label: "Processing" },
          Shipped: { color: "#007bff", label: "Shipped" },
          Delivered: { color: "#28a745", label: "Delivered" },
          Cancelled: { color: "#dc3545", label: "Cancelled" },
        };

        const statusLabels = data.ordersByStatus.map(
          (item) => statusMap[item._id]?.label || item._id
        );
        const statusValues = data.ordersByStatus.map((item) => item.count);
        const statusColors = data.ordersByStatus.map(
          (item) => statusMap[item._id]?.color || "#6c757d"
        );

        // Transform top products data
        const productLabels = data.topProducts.map((item) => item.productName);
        const productValues = data.topProducts.map((item) => item.totalSales);

        setReportData({
          salesOverTime: {
            labels: salesLabels,
            datasets: [
              {
                label: "Daily Sales (₦)",
                data: salesValues,
                borderColor: "rgb(40, 167, 69)",
                backgroundColor: "rgba(40, 167, 69, 0.1)",
                tension: 0.4,
              },
            ],
          },
          ordersByStatus: {
            labels: statusLabels,
            datasets: [
              {
                data: statusValues,
                backgroundColor: statusColors,
              },
            ],
          },
          topProducts: {
            labels: productLabels,
            datasets: [
              {
                label: "Sales (₦)",
                data: productValues,
                backgroundColor: "rgba(40, 167, 69, 0.8)",
              },
            ],
          },
          farmerPerformance: data.farmerPerformance,
          recentActivity: data.recentActivity,
        });

        setSummaryStats(data.summaryStats);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      showAlert("Failed to load reports data", "danger");
      // Set empty data to avoid rendering errors
      setReportData({
        salesOverTime: {
          labels: [],
          datasets: [
            {
              label: "Daily Sales (₦)",
              data: [],
              borderColor: "rgb(40, 167, 69)",
              backgroundColor: "rgba(40, 167, 69, 0.1)",
              tension: 0.4,
            },
          ],
        },
        ordersByStatus: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
            },
          ],
        },
        topProducts: {
          labels: [],
          datasets: [
            {
              label: "Sales (₦)",
              data: [],
              backgroundColor: "rgba(40, 167, 69, 0.8)",
            },
          ],
        },
        farmerPerformance: [],
        recentActivity: [],
      });
      setSummaryStats({
        totalRevenue: 0,
        totalOrders: 0,
        activeCustomers: 0,
        activeFarmers: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        customerSatisfaction: 0,
        deliverySuccessRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, variant = "success") => {
    setAlert({ show: true, message, variant });
    setTimeout(
      () => setAlert({ show: false, message: "", variant: "success" }),
      5000
    );
  };

  // Export report functionality with CSV generation
  const exportReport = async (type) => {
    try {
      if (!reportData || !summaryStats) {
        showAlert("No data available to export", "warning");
        return;
      }

      let csvContent = "";
      let filename = "";
      const dateStr = new Date().toISOString().split("T")[0];

      switch (type) {
        case "Sales":
          filename = `Sales_Report_${selectedPeriod}_${dateStr}.csv`;
          csvContent = generateSalesCSV();
          break;
        case "Customer":
          filename = `Customer_Report_${selectedPeriod}_${dateStr}.csv`;
          csvContent = generateCustomerCSV();
          break;
        case "Farmer":
          filename = `Farmer_Report_${selectedPeriod}_${dateStr}.csv`;
          csvContent = generateFarmerCSV();
          break;
        case "Complete":
          filename = `Complete_Report_${selectedPeriod}_${dateStr}.csv`;
          csvContent = generateCompleteCSV();
          break;
        default:
          showAlert("Unknown report type", "danger");
          return;
      }

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showAlert(
        `${type} report exported successfully! (${filename})`,
        "success"
      );
    } catch (error) {
      console.error("Export error:", error);
      showAlert("Failed to export report", "danger");
    }
  };

  // Generate Sales CSV
  const generateSalesCSV = () => {
    let csv = "AgriTech Sales Report\n";
    csv += `Period: ${selectedPeriod}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    csv += "SUMMARY STATISTICS\n";
    csv += "Metric,Value\n";
    csv += `Total Revenue,₦${summaryStats.totalRevenue.toLocaleString()}\n`;
    csv += `Total Orders,${summaryStats.totalOrders}\n`;
    csv += `Average Order Value,₦${summaryStats.averageOrderValue.toLocaleString()}\n`;
    csv += `Delivery Success Rate,${summaryStats.deliverySuccessRate}%\n\n`;

    if (reportData.salesOverTime.labels.length > 0) {
      csv += "SALES OVER TIME\n";
      csv += "Date,Sales (₦)\n";
      reportData.salesOverTime.labels.forEach((label, index) => {
        csv += `${label},${reportData.salesOverTime.datasets[0].data[index]}\n`;
      });
      csv += "\n";
    }

    if (reportData.topProducts.labels.length > 0) {
      csv += "TOP SELLING PRODUCTS\n";
      csv += "Product,Sales (₦)\n";
      reportData.topProducts.labels.forEach((label, index) => {
        csv += `${label},${reportData.topProducts.datasets[0].data[index]}\n`;
      });
      csv += "\n";
    }

    if (reportData.ordersByStatus.labels.length > 0) {
      csv += "ORDERS BY STATUS\n";
      csv += "Status,Count\n";
      reportData.ordersByStatus.labels.forEach((label, index) => {
        csv += `${label},${reportData.ordersByStatus.datasets[0].data[index]}\n`;
      });
    }

    return csv;
  };

  // Generate Customer CSV
  const generateCustomerCSV = () => {
    let csv = "AgriTech Customer Report\n";
    csv += `Period: ${selectedPeriod}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    csv += "CUSTOMER STATISTICS\n";
    csv += "Metric,Value\n";
    csv += `Active Customers,${summaryStats.activeCustomers}\n`;
    csv += `Total Orders,${summaryStats.totalOrders}\n`;
    csv += `Total Revenue,₦${summaryStats.totalRevenue.toLocaleString()}\n`;
    csv += `Average Order Value,₦${summaryStats.averageOrderValue.toLocaleString()}\n`;
    csv += `Customer Satisfaction,${summaryStats.customerSatisfaction}/5\n\n`;

    if (reportData.recentActivity && reportData.recentActivity.length > 0) {
      csv += "RECENT CUSTOMER ORDERS\n";
      csv += "Order Number,Status,Amount (₦),Customer,Date\n";
      reportData.recentActivity.forEach((activity) => {
        const customerName = activity.user?.name || "N/A";
        const date = new Date(activity.createdAt).toLocaleDateString();
        csv += `${activity.orderNumber},${activity.status},${activity.totalAmount},${customerName},${date}\n`;
      });
    }

    return csv;
  };

  // Generate Farmer CSV
  const generateFarmerCSV = () => {
    let csv = "AgriTech Farmer Performance Report\n";
    csv += `Period: ${selectedPeriod}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    csv += "FARMER STATISTICS\n";
    csv += "Metric,Value\n";
    csv += `Active Farmers,${summaryStats.activeFarmers}\n`;
    csv += `Total Orders,${summaryStats.totalOrders}\n`;
    csv += `Total Revenue,₦${summaryStats.totalRevenue.toLocaleString()}\n\n`;

    if (
      reportData.farmerPerformance &&
      reportData.farmerPerformance.length > 0
    ) {
      csv += "TOP PERFORMING FARMERS\n";
      csv += "Rank,Farmer Name,Orders,Revenue (₦),Rating\n";
      reportData.farmerPerformance.forEach((farmer, index) => {
        csv += `${index + 1},${farmer.name},${farmer.orders},${
          farmer.revenue
        },${farmer.rating}\n`;
      });
      csv += "\n";
    }

    if (reportData.topProducts.labels.length > 0) {
      csv += "BEST SELLING PRODUCTS\n";
      csv += "Product,Sales (₦)\n";
      reportData.topProducts.labels.forEach((label, index) => {
        csv += `${label},${reportData.topProducts.datasets[0].data[index]}\n`;
      });
    }

    return csv;
  };

  // Generate Complete Report CSV
  const generateCompleteCSV = () => {
    let csv = "AgriTech Complete Business Report\n";
    csv += `Period: ${selectedPeriod}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    csv += "=".repeat(80) + "\n\n";

    csv += "EXECUTIVE SUMMARY\n";
    csv += "-".repeat(80) + "\n";
    csv += "Metric,Value\n";
    csv += `Total Revenue,₦${summaryStats.totalRevenue.toLocaleString()}\n`;
    csv += `Total Orders,${summaryStats.totalOrders}\n`;
    csv += `Active Customers,${summaryStats.activeCustomers}\n`;
    csv += `Active Farmers,${summaryStats.activeFarmers}\n`;
    csv += `Average Order Value,₦${summaryStats.averageOrderValue.toLocaleString()}\n`;
    csv += `Conversion Rate,${summaryStats.conversionRate}%\n`;
    csv += `Customer Satisfaction,${summaryStats.customerSatisfaction}/5\n`;
    csv += `Delivery Success Rate,${summaryStats.deliverySuccessRate}%\n\n`;

    if (reportData.salesOverTime.labels.length > 0) {
      csv += "SALES PERFORMANCE\n";
      csv += "-".repeat(80) + "\n";
      csv += "Date,Sales (₦)\n";
      reportData.salesOverTime.labels.forEach((label, index) => {
        csv += `${label},${reportData.salesOverTime.datasets[0].data[index]}\n`;
      });
      csv += "\n";
    }

    if (reportData.ordersByStatus.labels.length > 0) {
      csv += "ORDER STATUS BREAKDOWN\n";
      csv += "-".repeat(80) + "\n";
      csv += "Status,Count,Percentage\n";
      const totalOrders = reportData.ordersByStatus.datasets[0].data.reduce(
        (a, b) => a + b,
        0
      );
      reportData.ordersByStatus.labels.forEach((label, index) => {
        const count = reportData.ordersByStatus.datasets[0].data[index];
        const percentage =
          totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : 0;
        csv += `${label},${count},${percentage}%\n`;
      });
      csv += "\n";
    }

    if (reportData.topProducts.labels.length > 0) {
      csv += "TOP PERFORMING PRODUCTS\n";
      csv += "-".repeat(80) + "\n";
      csv += "Rank,Product,Sales (₦),Market Share\n";
      const totalSales = reportData.topProducts.datasets[0].data.reduce(
        (a, b) => a + b,
        0
      );
      reportData.topProducts.labels.forEach((label, index) => {
        const sales = reportData.topProducts.datasets[0].data[index];
        const share =
          totalSales > 0 ? ((sales / totalSales) * 100).toFixed(1) : 0;
        csv += `${index + 1},${label},${sales},${share}%\n`;
      });
      csv += "\n";
    }

    if (
      reportData.farmerPerformance &&
      reportData.farmerPerformance.length > 0
    ) {
      csv += "FARMER PERFORMANCE RANKING\n";
      csv += "-".repeat(80) + "\n";
      csv +=
        "Rank,Farmer Name,Orders,Revenue (₦),Rating,Avg Revenue per Order\n";
      reportData.farmerPerformance.forEach((farmer, index) => {
        const avgRevenue =
          farmer.orders > 0 ? Math.round(farmer.revenue / farmer.orders) : 0;
        csv += `${index + 1},${farmer.name},${farmer.orders},${
          farmer.revenue
        },${farmer.rating},₦${avgRevenue}\n`;
      });
      csv += "\n";
    }

    if (reportData.recentActivity && reportData.recentActivity.length > 0) {
      csv += "RECENT TRANSACTIONS\n";
      csv += "-".repeat(80) + "\n";
      csv += "Date,Order Number,Status,Customer,Product,Amount (₦)\n";
      reportData.recentActivity.slice(0, 20).forEach((activity) => {
        const date = new Date(activity.createdAt).toLocaleDateString();
        const customer = activity.user?.name || "N/A";
        const product = activity.product?.name || "N/A";
        csv += `${date},${activity.orderNumber},${activity.status},${customer},${product},${activity.totalAmount}\n`;
      });
    }

    csv += "\n" + "=".repeat(80) + "\n";
    csv += "Report Generated by AgriTech Admin Dashboard\n";
    csv += `Administrator: ${user?.name || "Admin"}\n`;
    csv += `Generated at: ${new Date().toLocaleString()}\n`;

    return csv;
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
  };

  // Show loading state
  if (loading) {
    return (
      <div>
        <AdminNavbar user={user} onLogout={onLogout} onNavigate={onNavigate} />
        <div className="container-fluid py-4">
          <div className="text-center py-5">
            <Spinner
              animation="border"
              variant="success"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3 text-muted">Loading reports data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if data is loaded
  if (!reportData || !summaryStats) {
    return (
      <div>
        <AdminNavbar user={user} onLogout={onLogout} onNavigate={onNavigate} />
        <div className="container-fluid py-4">
          <Alert variant="warning">
            <p className="mb-0">
              No reports data available. Please try refreshing the page.
            </p>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Admin Navigation Bar */}
      <AdminNavbar user={user} onLogout={onLogout} onNavigate={onNavigate} />

      {/* Main Reports Content */}
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-success mb-1">📈 Reports & Analytics</h2>
            <p className="text-muted mb-0">
              Business insights and performance metrics
            </p>
          </div>
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => onNavigate("admin")}
              className="me-2"
            >
              ← Back to Dashboard
            </Button>
            <Button variant="success" onClick={() => exportReport("Complete")}>
              <i className="fas fa-download me-1"></i>Export Report
            </Button>
          </div>
        </div>

        {alert.show && (
          <Alert variant={alert.variant} className="mb-4">
            {alert.message}
          </Alert>
        )}

        {/* Period Selection */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={3}>
                <Form.Label>Report Period:</Form.Label>
                <Form.Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </Form.Select>
              </Col>
              <Col md={9} className="text-end">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => exportReport("Sales")}
                >
                  📊 Export Sales Data
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="me-2"
                  onClick={() => exportReport("Customer")}
                >
                  👥 Export Customer Data
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => exportReport("Farmer")}
                >
                  👨‍🌾 Export Farmer Data
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Key Metrics Summary */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100 bg-success text-white">
              <Card.Body className="text-center">
                <div style={{ fontSize: "2.5rem" }}>💰</div>
                <h3>₦{summaryStats.totalRevenue.toLocaleString()}</h3>
                <p className="mb-0">Total Revenue</p>
                <small className="opacity-75">+15% from last period</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100 bg-primary text-white">
              <Card.Body className="text-center">
                <div style={{ fontSize: "2.5rem" }}>📦</div>
                <h3>{summaryStats.totalOrders}</h3>
                <p className="mb-0">Total Orders</p>
                <small className="opacity-75">+8% from last period</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100 bg-info text-white">
              <Card.Body className="text-center">
                <div style={{ fontSize: "2.5rem" }}>👥</div>
                <h3>{summaryStats.activeCustomers}</h3>
                <p className="mb-0">Active Customers</p>
                <small className="opacity-75">+22% from last period</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100 bg-warning text-white">
              <Card.Body className="text-center">
                <div style={{ fontSize: "2.5rem" }}>👨‍🌾</div>
                <h3>{summaryStats.activeFarmers}</h3>
                <p className="mb-0">Active Farmers</p>
                <small className="opacity-75">+5% from last period</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Secondary Metrics */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: "2rem" }}>💵</div>
                <h4 className="text-success">
                  ₦{summaryStats.averageOrderValue.toLocaleString()}
                </h4>
                <small className="text-muted">Average Order Value</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: "2rem" }}>📈</div>
                <h4 className="text-info">{summaryStats.conversionRate}%</h4>
                <small className="text-muted">Conversion Rate</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: "2rem" }}>⭐</div>
                <h4 className="text-warning">
                  {summaryStats.customerSatisfaction}/5
                </h4>
                <small className="text-muted">Customer Satisfaction</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: "2rem" }}>🚚</div>
                <h4 className="text-success">
                  {summaryStats.deliverySuccessRate}%
                </h4>
                <small className="text-muted">Delivery Success Rate</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="mb-4">
          {/* Sales Over Time Chart */}
          <Col lg={8} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-success text-white">
                <h6 className="mb-0">📈 Sales Over Time</h6>
              </Card.Header>
              <Card.Body>
                <Line data={reportData.salesOverTime} options={chartOptions} />
              </Card.Body>
            </Card>
          </Col>

          {/* Orders by Status */}
          <Col lg={4} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">📊 Orders by Status</h6>
              </Card.Header>
              <Card.Body>
                <Doughnut
                  data={reportData.ordersByStatus}
                  options={chartOptions}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Top Products and Farmer Performance */}
        <Row className="mb-4">
          {/* Top Products Chart */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0">🏆 Top Selling Products</h6>
              </Card.Header>
              <Card.Body>
                <Bar data={reportData.topProducts} options={chartOptions} />
              </Card.Body>
            </Card>
          </Col>

          {/* Farmer Performance Table */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-warning text-white">
                <h6 className="mb-0">👨‍🌾 Top Performing Farmers</h6>
              </Card.Header>
              <Card.Body className="p-0">
                {reportData.farmerPerformance &&
                reportData.farmerPerformance.length > 0 ? (
                  <Table responsive className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Farmer</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                        <th>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.farmerPerformance.map((farmer, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2"
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  fontSize: "12px",
                                }}
                              >
                                {index + 1}
                              </div>
                              {farmer.name}
                            </div>
                          </td>
                          <td>
                            <Badge bg="primary">{farmer.orders}</Badge>
                          </td>
                          <td className="fw-bold">
                            ₦{farmer.revenue.toLocaleString()}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-1">⭐</span>
                              {farmer.rating}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="p-4 text-center text-muted">
                    <p className="mb-0">
                      No farmer performance data available for this period
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity Log */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-secondary text-white">
            <h6 className="mb-0">📋 Recent Activity Log</h6>
          </Card.Header>
          <Card.Body>
            <div className="timeline">
              {reportData.recentActivity &&
              reportData.recentActivity.length > 0 ? (
                reportData.recentActivity.map((activity, index) => (
                  <div key={index} className="d-flex mb-3">
                    <div className="me-3">
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center ${
                          activity.type === "order"
                            ? "bg-primary"
                            : activity.type === "inventory"
                            ? "bg-success"
                            : activity.type === "status"
                            ? "bg-info"
                            : activity.type === "customer"
                            ? "bg-warning"
                            : "bg-secondary"
                        } text-white`}
                        style={{
                          width: "32px",
                          height: "32px",
                          fontSize: "14px",
                        }}
                      >
                        {activity.type === "order"
                          ? "📦"
                          : activity.type === "inventory"
                          ? "📊"
                          : activity.type === "status"
                          ? "🔄"
                          : activity.type === "customer"
                          ? "👤"
                          : "💰"}
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div>{activity.action}</div>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted">
                  <p className="mb-0">
                    No recent activity available for this period
                  </p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
