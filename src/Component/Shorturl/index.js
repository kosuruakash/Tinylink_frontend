import { Component } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  FiCopy,
  FiShare2,
  FiBarChart2,
  FiTrash2,
  FiClock,
  FiCalendar,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import "./index.css";

class Shorturl extends Component {
  state = {
    isLoading: true,
    formattedData: null,
    isCopying: false,
    isDeleting: false,
    copySuccess: false,
  };

  componentDidMount() {
    this.fetchShortUrlData();
  }

  fetchShortUrlData = async () => {
    const { shorturlData } = this.props;
    const { shortcode } = shorturlData;

    try {
      // Changed from /stats/:shortcode to /api/links/:code
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_BASE}/api/links/${shortcode}`);

      if (response.status === 404) {
        this.setState({
          formattedData: null,
          isLoading: false,
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch URL data");
      }

      const data = await response.json();

      const formattedData = {
        id: data.id,
        short_code: data.short_code,
        long_url: data.long_url,
        clicks: data.clicks,
        created_at: data.created_at,
        last_clicked_at: data.last_clicked_at,
      };

      this.setState({ formattedData, isLoading: false });
    } catch (e) {
      console.error("Fetch error:", e);
      this.setState({ isLoading: false });
    }
  };

  handleCopy = async () => {
    const { formattedData } = this.state;
    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
    const shortURL = `${API_BASE}/${formattedData.short_code}`;

    this.setState({ isCopying: true, copySuccess: false });

    try {
      await navigator.clipboard.writeText(shortURL);
      this.setState({ copySuccess: true });
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = shortURL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      this.setState({ copySuccess: true });
    } finally {
      this.setState({ isCopying: false });
      setTimeout(() => {
        this.setState({ copySuccess: false });
      }, 2000);
    }
  };

  onDeleteItem = async () => {
    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
    const { formattedData } = this.state;
    const { onDelete } = this.props;

    const isConfirmed = window.confirm(
      `Are you sure you want to delete this short URL?\n\n` +
        `Short: ${API_BASE}/${formattedData.short_code}\n` +
        `Original: ${formattedData.long_url}\n\n` +
        `This action cannot be undone.`
    );

    if (!isConfirmed) {
      return;
    }

    this.setState({ isDeleting: true });

    try {
      // FIXED: Changed from /delete/:id to /api/links/:code
      const response = await fetch(
        `${API_BASE}/api/links/${formattedData.short_code}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("URL deleted successfully!");
        onDelete(formattedData.id);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error_msg || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Failed to delete URL: ${error.message}`);
    } finally {
      this.setState({ isDeleting: false });
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

  render() {
    const { isLoading, formattedData, isCopying, isDeleting, copySuccess } =
      this.state;

    // FIXED: Define API_BASE in render scope
    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

    if (isLoading) {
      return (
        <li className="short-card">
          <TailSpin color="#000" height={40} width={40} />
        </li>
      );
    }

    if (!formattedData) {
      return <li className="short-card">No data found</li>;
    }

    const { id, short_code, long_url, clicks, created_at, last_clicked_at } =
      formattedData;

    const shortURL = `${API_BASE}/${short_code}`;
    const domain = this.getDomainFromUrl(long_url);

    return (
      <li className="short-card">
        <div className="card-header">
          <p className="card-title">{domain} – link</p>

          <div className="icon-row">
            <FiShare2 className="icon" title="Share" />

            <Link
              to={`/code/${short_code}`} // Changed from /shortcode/:id to /code/:code
              className="icon-link"
              title="View Analytics"
            >
              <FiBarChart2 className="icon" />
            </Link>

            <button
              className="icon-button delete-btn"
              onClick={this.onDeleteItem}
              disabled={isDeleting}
              title="Delete URL"
            >
              {isDeleting ? (
                <TailSpin color="#e03131" height={16} width={16} />
              ) : (
                <FiTrash2 className="icon delete" />
              )}
            </button>
          </div>
        </div>

        <div className="short-row">
          <a
            href={shortURL}
            target="_blank"
            rel="noreferrer"
            className="short-link"
          >
            {shortURL}
          </a>

          <div className="copy-container">
            {copySuccess && <span className="copy-success">Copied!</span>}
            <button
              className="icon-button copy-btn"
              onClick={this.handleCopy}
              disabled={isCopying}
              title="Copy URL"
            >
              {isCopying ? (
                <TailSpin color="#0061ff" height={16} width={16} />
              ) : (
                <FiCopy className="icon" />
              )}
            </button>
          </div>
        </div>

        <p className="long-url">{long_url}</p>

        <div className="meta-row">
          <span className="meta-item">
            <FiCalendar className="meta-icon" /> {this.formatDate(created_at)}
          </span>

          <span className="meta-item">
            <FiClock className="meta-icon" /> {this.formatDate(last_clicked_at)}
          </span>

          <span className="meta-item">
            <FiBarChart2 className="meta-icon" /> {clicks} clicks
          </span>
        </div>
      </li>
    );
  }
}

export default Shorturl;
