import { Component } from "react";
import "./index.css";
import Shorturl from "../Shorturl";
import AllLinks from "../AllLinks";
import HealthCheck from "../HealthCheck"; // Fixed typo: Healthcheck → HealthCheck

class Home extends Component {
  state = {
    shortcode: "",
    longurl: "",
    showSubmitError: false,
    errorMsg: "",
    newurlgenerated: false,
    finalShortUrl: "",
    shortUrllist: [],
    searchTerm: "",
    showAllLinks: false,
    showCreateForm: true,
    showHealthCheck: false,
  };

  componentDidMount() {
    this.loadShortUrls();
  }

  // Simply load the entire shortUrllist from localStorage
  loadShortUrls = () => {
    try {
      const savedUrls = localStorage.getItem("tinyLink_shortUrls");
      if (savedUrls) {
        const shortUrllist = JSON.parse(savedUrls);
        this.setState({ shortUrllist });
      }
    } catch (error) {
      console.error("Error loading URLs:", error);
    }
  };

  // Simply save the entire shortUrllist to localStorage
  saveShortUrls = (shortUrllist) => {
    try {
      localStorage.setItem("tinyLink_shortUrls", JSON.stringify(shortUrllist));
    } catch (error) {
      console.error("Error saving URLs:", error);
    }
  };

  onSubmitFailure = (errorMsg) => {
    this.setState({ showSubmitError: true, errorMsg });
  };

  onChangeLongUrl = (event) => {
    this.setState({
      longurl: event.target.value,
      newurlgenerated: false,
      showSubmitError: false,
      finalShortUrl: "",
    });
  };

  onChangeShortcode = (event) => {
    this.setState({
      shortcode: event.target.value,
      newurlgenerated: false,
      showSubmitError: false,
      finalShortUrl: "",
    });
  };

  onChangeSearch = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  onclick = async () => {
    const { shortcode, longurl } = this.state;

    if (longurl.trim() === "") {
      this.onSubmitFailure("Destination link cannot be empty");
      return;
    }

    // FIXED: Updated validation to 6-8 characters as per PDF
    if (shortcode.length < 6 || shortcode.length > 8) {
      this.onSubmitFailure("Short code must be 6-8 characters");
      return;
    }

    const codeRegex = /^[A-Za-z0-9]+$/;
    if (!codeRegex.test(shortcode)) {
      this.onSubmitFailure("Short code must contain only letters and numbers");
      return;
    }

    const urldetails = { longurl, shortcode };

    try {
      // Changed from /generate to /api/links
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
      const url = `${API_BASE}/api/links`;
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(urldetails),
      };

      const response = await fetch(url, options);
      const data = await response.json();

      if (response.status === 201) {
        // FIXED: Generate short URL using API_BASE
        const shortUrl = `${API_BASE}/${shortcode}`;

        const newItem = {
          id: data.id,
          longurl,
          shortcode,
          shortUrl: shortUrl, // Use dynamically generated URL
        };

        this.setState((prevState) => {
          const updatedList = [...prevState.shortUrllist, newItem];
          this.saveShortUrls(updatedList); // Save the updated array
          return {
            showSubmitError: false,
            errorMsg: "",
            newurlgenerated: true,
            finalShortUrl: shortUrl, // Use dynamically generated URL
            shortUrllist: updatedList,
            shortcode: "",
            longurl: "",
            showCreateForm: false,
          };
        });
      } else {
        this.onSubmitFailure(data.error_msg || "Something went wrong");
      }
    } catch (error) {
      this.onSubmitFailure("Server not reachable");
    }
  };

  handleDeleteUrl = (id) => {
    this.setState((prevState) => {
      const updatedList = prevState.shortUrllist.filter(
        (item) => item.id !== id
      );
      this.saveShortUrls(updatedList); // Save the updated array
      return { shortUrllist: updatedList };
    });
  };

  handleGetAllLinks = () => {
    this.setState({ showAllLinks: true });
  };

  handleShowMyLinks = () => {
    this.setState({
      showAllLinks: false,
      showHealthCheck: false,
    });
  };

  handleCreateLink = () => {
    this.setState({
      showCreateForm: true,
      showHealthCheck: false,
      shortcode: "",
      longurl: "",
      showSubmitError: false,
      errorMsg: "",
      newurlgenerated: false,
      finalShortUrl: "",
    });
  };

  handleCloseCreateForm = () => {
    this.setState({ showCreateForm: false });
  };

  handleHealthCheck = () => {
    this.setState({
      showHealthCheck: true,
      showAllLinks: false,
    });
  };

  handleCloseHealthCheck = () => {
    this.setState({ showHealthCheck: false });
  };

  render() {
    const {
      longurl,
      shortcode,
      showSubmitError,
      errorMsg,
      newurlgenerated,
      finalShortUrl,
      shortUrllist,
      searchTerm,
      showAllLinks,
      showCreateForm,
      showHealthCheck,
    } = this.state;

    // Filter links based on search term
    const filteredLinks = shortUrllist.filter(
      (link) =>
        link.shortcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.longurl.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showAllLinks) {
      return <AllLinks onBack={this.handleShowMyLinks} />;
    }

    if (showHealthCheck) {
      return <HealthCheck onBack={this.handleCloseHealthCheck} />;
    }

    return (
      <div className="bgground">
        {/* Header Section */}
        <div className="main-header">
          <h1 className="main-head">TinyLink</h1>
          <div className="header-actions">
            <button
              className="header-btn primary"
              onClick={this.handleCreateLink}
            >
              Create Link
            </button>
            <button
              className="header-btn secondary"
              onClick={this.handleGetAllLinks}
            >
              Get All Links
            </button>
            <button
              className="header-btn health"
              onClick={this.handleHealthCheck}
            >
              Health Check
            </button>
          </div>
        </div>

        {/* Create Link Form - Conditionally Rendered */}
        {showCreateForm && (
          <div className="minicard">
            <div className="card-header">
              <h2 className="sub-head">Create New Short Link</h2>
              <button
                className="close-btn"
                onClick={this.handleCloseCreateForm}
              >
                ×
              </button>
            </div>

            <label className="label-item">Destination link</label>
            <input
              type="search"
              className="input-item"
              value={longurl}
              onChange={this.onChangeLongUrl}
              placeholder="Enter your long URL (include http:// or https://)"
            />

            <label className="label-item">Short code</label>
            <input
              type="text"
              className="input-item"
              value={shortcode}
              onChange={this.onChangeShortcode}
              placeholder="Enter custom short code (6-8 characters, letters and numbers only)"
            />

            <button className="btn" type="button" onClick={this.onclick}>
              Get your link
            </button>

            {showSubmitError && <p className="error-message">*{errorMsg}</p>}

            {newurlgenerated && (
              <div className="shorturl-box">
                <p className="label-item">Your short URL:</p>
                <p className="shorturl">{finalShortUrl}</p>
              </div>
            )}
          </div>
        )}

        {/* Search and Links Section */}
        <div className="content-section">
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search links..."
                value={searchTerm}
                onChange={this.onChangeSearch}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="links-section">
            <h2 className="section-title">My Links</h2>

            {filteredLinks.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? (
                  <p>No links found matching your search</p>
                ) : (
                  <>
                    <p>No links created yet</p>
                    <p>Click "Create Link" to get started!</p>
                  </>
                )}
              </div>
            ) : (
              <ul className="short-list">
                {filteredLinks.map((item) => (
                  <Shorturl
                    shorturlData={item}
                    key={item.id}
                    onDelete={this.handleDeleteUrl}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
