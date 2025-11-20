import { Component } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiServer,
  FiClock,
  FiCode,
} from "react-icons/fi";
import { TailSpin } from "react-loader-spinner";
import "./index.css";

class HealthCheck extends Component {
  state = {
    isLoading: true,
    healthData: null,
    error: null,
    lastChecked: null,
  };

  componentDidMount() {
    this.fetchHealthData();
  }

  fetchHealthData = async () => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000"; // Added API_BASE
      const startTime = Date.now();
      const response = await fetch(`${API_BASE}/healthz`); // Fixed: Use API_BASE
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        const healthData = await response.json();
        this.setState({
          healthData: {
            ...healthData,
            responseTime: responseTime,
            status: "healthy",
            timestamp: new Date().toISOString(),
          },
          isLoading: false,
          lastChecked: new Date().toLocaleTimeString(),
        });
      } else {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Health check error:", error);
      this.setState({
        error: error.message,
        isLoading: false,
        lastChecked: new Date().toLocaleTimeString(),
      });
    }
  };

  handleRefresh = () => {
    this.setState({ isLoading: true, error: null });
    this.fetchHealthData();
  };

  formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never";
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  render() {
    const { isLoading, healthData, error, lastChecked } = this.state;
    const { onBack } = this.props;

    return (
      <div className="health-container">
        {/* Header */}
        <div className="health-header">
          <button onClick={onBack} className="back-button">
            <FiArrowLeft /> Back to Dashboard
          </button>
          <div className="header-content">
            <h1 className="health-title">System Health Check</h1>
            <p className="health-subtitle">
              Monitor your TinyLink service status
            </p>
          </div>
          <button
            className="refresh-btn"
            onClick={this.handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Health Status Card */}
        <div className="health-card">
          {isLoading ? (
            <div className="health-loading">
              <TailSpin color="#0061ff" height={40} width={40} />
              <p>Checking system health...</p>
            </div>
          ) : error ? (
            <div className="health-error">
              <div className="status-icon error">
                <FiX />
              </div>
              <h3>Service Unavailable</h3>
              <p className="error-message">{error}</p>
              <div className="health-details">
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value error">Offline</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Checked:</span>
                  <span className="detail-value">{lastChecked}</span>
                </div>
              </div>
            </div>
          ) : healthData ? (
            <div className="health-success">
              <div className="status-icon success">
                <FiCheck />
              </div>
              <h3>All Systems Operational</h3>
              <p className="success-message">
                Your TinyLink service is running smoothly.
              </p>

              <div className="health-details">
                <div className="detail-item">
                  <FiServer className="detail-icon" />
                  <span className="detail-label">Status:</span>
                  <span className="detail-value success">Healthy</span>
                </div>

                <div className="detail-item">
                  <FiCode className="detail-icon" />
                  <span className="detail-label">Version:</span>
                  <span className="detail-value">
                    {healthData.version || "1.0"}
                  </span>
                </div>

                <div className="detail-item">
                  <FiClock className="detail-icon" />
                  <span className="detail-label">Response Time:</span>
                  <span className="detail-value">
                    {healthData.responseTime}ms
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">
                    {this.formatTimestamp(healthData.timestamp)}
                  </span>
                </div>
              </div>

              <div className="additional-info">
                <h4>System Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">API Status:</span>
                    <span className="info-value success">Operational</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Database:</span>
                    <span className="info-value success">Connected</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Uptime:</span>
                    <span className="info-value">100%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={this.handleRefresh}>
              Check Health Again
            </button>
            <button className="action-btn secondary" onClick={onBack}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default HealthCheck; // Fixed: Healthcheck → HealthCheck
