import { Component } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  FiCopy,
  FiBarChart2,
  FiClock,
  FiCalendar,
  FiArrowLeft,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import "./index.css";

class AllLinks extends Component {
  state = {
    isLoading: true,
    allLinks: [],
    searchTerm: "",
    error: null,
  };

  componentDidMount() {
    this.fetchAllLinks();
  }

  fetchAllLinks = async () => {
    try {
      // FIXED: Added API_BASE for dynamic URLs
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_BASE}/api/links`);
      if (response.ok) {
        const allLinks = await response.json();
        this.setState({ allLinks, isLoading: false });
      } else {
        throw new Error("Failed to load all links");
      }
    } catch (error) {
      console.error("Error loading all links:", error);
      this.setState({ error: error.message, isLoading: false });
    }
  };

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleCopy = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert("Copied to clipboard!");
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = shortUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Copied to clipboard!");
    }
  };

  formatDate = (dateString) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
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

  getDomainFromUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace("www.", "");
    } catch {
      return "link";
    }
  };

  render() {
    const { isLoading, allLinks, searchTerm, error } = this.state;
    const { onBack } = this.props;

    // FIXED: Define API_BASE in render scope for URL generation
    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

    const filteredLinks = allLinks.filter(
      (link) =>
        link.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.long_url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
      return (
        <div className="all-links-container">
          <div className="all-links-loader">
            <TailSpin color="#0061ff" height={50} width={50} />
            <p>Loading all links...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="all-links-container">
          <div className="error-state">
            <h2>Error loading links</h2>
            <p>{error}</p>
            <button onClick={onBack} className="back-button">
              <FiArrowLeft /> Back to My Links
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="all-links-container">
        {/* Header with Search and Filters */}
        <div className="all-links-header">
          <div className="header-left">
            <button onClick={onBack} className="back-button">
              <FiArrowLeft /> Back to My Links
            </button>
            <h1 className="all-links-title">All Links</h1>
            <p className="all-links-subtitle">
              All shortened URLs in the system ({allLinks.length} total)
            </p>
          </div>

          <div className="header-right">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search links..."
                value={searchTerm}
                onChange={this.handleSearchChange}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="filter-container">
              <select className="filter-select" disabled>
                <option>Filter by created date</option>
                <option>Today</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
              <span className="filter-badge">x Add filters</span>
            </div>
          </div>
        </div>

        {/* Links List */}
        <div className="all-links-section">
          {filteredLinks.length === 0 ? (
            <div className="empty-state">
              <p>No links found{searchTerm ? " matching your search" : ""}</p>
            </div>
          ) : (
            <ul className="all-links-list">
              {filteredLinks.map((link) => {
                // FIXED: Generate dynamic short URL for each link
                const shortUrl = `${API_BASE}/${link.short_code}`;

                return (
                  <li key={link.id} className="all-link-card">
                    <div className="card-header">
                      <p className="card-title">
                        {this.getDomainFromUrl(link.long_url)} – link
                      </p>

                      <div className="icon-row">
                        <Link
                          to={`/code/${link.short_code}`}
                          className="icon-link"
                          title="View Analytics"
                        >
                          <FiBarChart2 className="icon" />
                        </Link>
                      </div>
                    </div>

                    <div className="short-row">
                      {/* FIXED: Use dynamic shortUrl */}
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="short-link"
                      >
                        {shortUrl}
                      </a>

                      <div className="copy-container">
                        <button
                          className="icon-button copy-btn"
                          onClick={() => this.handleCopy(shortUrl)}
                          title="Copy URL"
                        >
                          <FiCopy className="icon" />
                        </button>
                      </div>
                    </div>

                    <p className="long-url">{link.long_url}</p>

                    <div className="meta-row">
                      <span className="meta-item">
                        <FiCalendar className="meta-icon" />{" "}
                        {this.formatDate(link.created_at)}
                      </span>

                      <span className="meta-item">
                        <FiClock className="meta-icon" />{" "}
                        {this.formatDate(link.last_clicked_at)}
                      </span>

                      <span className="meta-item">
                        <FiBarChart2 className="meta-icon" /> {link.clicks}{" "}
                        clicks
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }
}

export default AllLinks;
