import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SEO = ({ title, description, keywords, ogImage, canonical }) => {
  const location = useLocation();
  const baseUrl = "https://paaniwale.tech";
  const currentUrl = `${baseUrl}${location.pathname}`;

  const defaultTitle =
    "Paaniwale - Water Delivery Management System | Track Water Bottle Sales Online";
  const defaultDescription =
    "Paaniwale is India's leading water delivery management software. Track water bottle sales, manage inventory, automate invoices, and grow your water delivery business.";
  const defaultKeywords =
    "water delivery app, water bottle tracking, water supply management, paaniwale";
  const defaultImage =
    "https://res.cloudinary.com/fdgj4xhhgq/image/upload/v1722239069/Dhandha-Assests/paniwala-1300x1300_xks3or.png";

  useEffect(() => {
    // Update title
    document.title = title || defaultTitle;

    // Update meta tags
    updateMetaTag("name", "description", description || defaultDescription);
    updateMetaTag("name", "keywords", keywords || defaultKeywords);

    // Update Open Graph tags
    updateMetaTag("property", "og:title", title || defaultTitle);
    updateMetaTag(
      "property",
      "og:description",
      description || defaultDescription
    );
    updateMetaTag("property", "og:image", ogImage || defaultImage);
    updateMetaTag("property", "og:url", currentUrl);

    // Update Twitter Card tags
    updateMetaTag("name", "twitter:title", title || defaultTitle);
    updateMetaTag(
      "name",
      "twitter:description",
      description || defaultDescription
    );
    updateMetaTag("name", "twitter:image", ogImage || defaultImage);

    // Update canonical link
    updateCanonical(canonical || currentUrl);
  }, [title, description, keywords, ogImage, canonical, currentUrl]);

  // Helper to escape special HTML characters to prevent XSS
  const escapeHtml = (unsafe) => {
    if (typeof unsafe !== "string") return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const updateMetaTag = (attribute, key, content) => {
    if (typeof content === "undefined" || content === null) return;
    const safeContent = escapeHtml(content);
    let element = document.querySelector(`meta[${attribute}="${key}"]`);

    if (element) {
      element.setAttribute("content", safeContent);
    } else {
      element = document.createElement("meta");
      element.setAttribute(attribute, key);
      element.setAttribute("content", safeContent);
      document.head.appendChild(element);
    }
  };

  const updateCanonical = (url) => {
    let link = document.querySelector('link[rel="canonical"]');

    if (link) {
      link.setAttribute("href", url);
    } else {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      link.setAttribute("href", url);
      document.head.appendChild(link);
    }
  };

  return null;
};

export default SEO;
