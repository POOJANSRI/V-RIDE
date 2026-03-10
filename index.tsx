

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

function DevCredits() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Floating Developer Button */}
      <button
        className="dev-button"
        onClick={() => setOpen(!open)}
      >
        👨‍💻
      </button>

      {/* Popup */}
      {open && (
        <div className="dev-popup">
          <h4>Developed By</h4>

          <p className="dev1">ARAVINDASWAMY GUNTURU</p>
          <p className="dev2">VISHNU VARDHAN THOTA</p>
          <p className="dev3">BRAMAIAH THOKA</p>
          <p className="dev4">RAGHU GURRALA</p>
          <p className="dev5">POOJAN SRI PAARA</p>
          <p className="dev6">RAJESWAR TAMMISETTI</p>
        </div>
      )}
    </>
  );
}

root.render(
  <React.StrictMode>
    <App />
    <DevCredits />
  </React.StrictMode>
);