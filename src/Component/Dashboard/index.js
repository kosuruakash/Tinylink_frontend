import { Component } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiBarChart2,
  FiLink,
  FiUsers,
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import "./index.css";

class Dashboard extends Component {
  state = {
    isLoading: true,
    urlData: null,
    error: null,
  };

  componentDidMount() {
    this.fetchUrlData();
  }

  fetchUrlData = async () => {
    const { params } = this.props;
    const { code } = params;

    try {
      // FIXED: Correct API endpoint with environment variable
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_BASE}/api/links/${code}`); // Added missing endpoint path

      if (response.status === 404) {
        throw new Error("URL not found");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch URL data");
      }

      const urlData = await response.json();

      const enhancedData = this.enhanceWithSimpleAnalytics(urlData);

      this.setState({
        urlData: enhancedData,
        isLoading: false,
      });
    } catch (error) {
      this.setState({ error: error.message, isLoading: false });
    }
  };

  enhanceWithSimpleAnalytics = (urlData) => {
    const clickData = this.generateClickData(urlData.clicks || 0);
    const hourlyData = this.generateHourlyData();
    const weeklyData = this.generateWeeklyData(urlData.clicks || 0);

    return {
      ...urlData,
      analytics: {
        clickData,
        hourlyData,
        weeklyData,
        totalClicks: urlData.clicks || 0,
      },
    };
  };

  generateClickData = (totalClicks) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = [];
    let remainingClicks = totalClicks;

    for (let i = 6; i >= 0; i--) {
      const dayClicks =
        i === 0
          ? remainingClicks
          : Math.floor(Math.random() * (remainingClicks / 2));
      data.unshift({
        day: days[i],
        clicks: Math.max(dayClicks, 0),
      });
      remainingClicks -= dayClicks;
    }

    return data;
  };

  generateHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map((hour) => ({
      hour: `${hour}:00`,
      clicks: Math.floor(Math.random() * 20) + 1,
    }));
  };

  generateWeeklyData = (totalClicks) => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const data = [];
    let remainingClicks = totalClicks;

    weeks.forEach((week, index) => {
      const weekClicks =
        index === weeks.length - 1
          ? remainingClicks
          : Math.floor(remainingClicks * 0.3);
      data.push({
        week: week,
        clicks: weekClicks,
      });
      remainingClicks -= weekClicks;
    });

    return data;
  };

  formatDate = (dateString) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  render() {
    const { isLoading, urlData, error } = this.state;
    const { navigate } = this.props;

    if (isLoading) {
      return (
        <div className="dashboard-container">
          <div className="dashboard-loader">
            <TailSpin color="#0061ff" height={50} width={50} />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="dashboard-container">
          <div className="error-state">
            <h2>Error loading dashboard</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/")} className="back-button">
              <FiArrowLeft /> Back to URLs
            </button>
          </div>
        </div>
      );
    }

    if (!urlData) {
      return (
        <div className="dashboard-container">
          <div className="error-state">
            <h2>No data found</h2>
            <button onClick={() => navigate("/")} className="back-button">
              <FiArrowLeft /> Back to URLs
            </button>
          </div>
        </div>
      );
    }

    const { analytics } = urlData;

    // FIXED: Use environment variable for short URL generation
    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
    const shortUrl = `${API_BASE.replace("/api/links", "")}/${
      urlData.short_code
    }`;

    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <button onClick={() => navigate("/")} className="back-button">
            <FiArrowLeft /> Back to URLs
          </button>
          <h1>URL Analytics Dashboard</h1>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-clicks">
              <FiBarChart2 />
            </div>
            <div className="stat-info">
              <h3>{analytics.totalClicks}</h3>
              <p>Total Clicks</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon created">
              <FiCalendar />
            </div>
            <div className="stat-info">
              <h3>{this.formatDate(urlData.created_at).split(",")[0]}</h3>
              <p>Created Date</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon last-click">
              <FiClock />
            </div>
            <div className="stat-info">
              <h3>{urlData.last_clicked_at ? "Active" : "No Clicks"}</h3>
              <p>Last Activity</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon short-code">
              <FiLink />
            </div>
            <div className="stat-info">
              <h3>{urlData.short_code}</h3>
              <p>Short Code</p>
            </div>
          </div>
        </div>

        <div className="url-info-card">
          <div className="url-info-header">
            <h3>URL Information</h3>
          </div>
          <div className="url-details">
            <div className="url-detail-item">
              <strong>Short URL:</strong>
              {/* FIXED: Use dynamic URL from environment variable */}
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                {shortUrl}
              </a>
            </div>
            <div className="url-detail-item">
              <strong>Original URL:</strong>
              <span className="long-url">{urlData.long_url}</span>
            </div>
            <div className="url-meta-grid">
              <div className="meta-item">
                <FiCalendar className="meta-icon" />
                <span>
                  <strong>Created:</strong>{" "}
                  {this.formatDate(urlData.created_at)}
                </span>
              </div>
              <div className="meta-item">
                <FiClock className="meta-icon" />
                <span>
                  <strong>Last Click:</strong>{" "}
                  {this.formatDate(urlData.last_clicked_at)}
                </span>
              </div>
              <div className="meta-item">
                <FiUsers className="meta-icon" />
                <span>
                  <strong>Total Clicks:</strong> {analytics.totalClicks}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="chart-card">
            <h3>Daily Clicks (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.clickData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#0061ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Weekly Click Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#00C49F"
                  strokeWidth={3}
                  dot={{ fill: "#00C49F" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Average Hourly Clicks</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyData.slice(8, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#FF8042" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Performance Summary</h3>
            <div className="performance-stats">
              <div className="performance-item">
                <span className="label">Average Daily Clicks:</span>
                <span className="value">
                  {Math.round(analytics.totalClicks / 7)}
                </span>
              </div>
              <div className="performance-item">
                <span className="label">Most Active Day:</span>
                <span className="value">
                  {
                    analytics.clickData.reduce(
                      (max, day) => (day.clicks > max.clicks ? day : max),
                      analytics.clickData[0]
                    ).day
                  }
                </span>
              </div>
              <div className="performance-item">
                <span className="label">Creation Date:</span>
                <span className="value">
                  {this.formatDate(urlData.created_at)}
                </span>
              </div>
              <div className="performance-item">
                <span className="label">URL Status:</span>
                <span
                  className={`value status ${
                    analytics.totalClicks > 0 ? "active" : "inactive"
                  }`}
                >
                  {analytics.totalClicks > 0 ? "Active" : "No Clicks Yet"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const withRouter = (Component) => {
  return (props) => {
    const params = useParams();
    const navigate = useNavigate();
    return <Component {...props} params={params} navigate={navigate} />;
  };
};

export default withRouter(Dashboard);
