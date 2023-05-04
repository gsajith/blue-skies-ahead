import React, { useState, useEffect } from "react";
import { Router, Link } from "wouter";

// Import and apply CSS stylesheet
import "./styles/styles.css";

// Where all of our pages come from
import PageRouter from "./components/router.jsx";

// The component that adds our Meta tags to the page
import Seo from './components/seo.jsx';

// Home function that is reflected across the site
export default function Home() {
  return (
    <Router>
      <Seo />
      <main role="main">
          {/* Router specifies which component to insert here as the main content */}
          <PageRouter />
      </main>
    </Router>
  );
}
