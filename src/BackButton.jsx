import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function BackButton({ currentpage }) {
    return (
        <Link to="/" style={{ textDecoration: "none" }}>
            <button
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    fontSize: "13px",
                    border: "1px solid #ccc",
                    background: "#fff",
                    cursor: "pointer",
                }}
            >
                <FaArrowLeft size={12} />
                Back
            </button>
        </Link>
    );
}

export default BackButton;