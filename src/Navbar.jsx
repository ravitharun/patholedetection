import React, { useState } from "react";
import { FaMapMarkedAlt, FaSearchLocation, FaUserCircle } from "react-icons/fa";
import MobileUseAlert from "./MobileUseAlert";
import { check_IsmobileView } from "./MiniDb";
import { Link } from "react-router-dom";
function Navbar({ page }) {
    console.log(page, "page")
    const [active, setActive] = useState(page == undefined ? "report" : page);

    const navStyle = {
        position: "fixed",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "92%",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        zIndex: 50,
    };

    const containerStyle = {
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 0",
    };

    const getItemStyle = (name) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        fontSize: "11px",
        padding: "6px 12px",
        borderRadius: "12px",
        transition: "all 0.3s ease",
        color: active === name ? "#2563eb" : "#6b7280",
        backgroundColor: active === name ? "rgba(37, 99, 235, 0.1)" : "transparent",
        transform: active === name ? "scale(1.1)" : "scale(1)",
    });

    const iconStyle = (name) => ({
        fontSize: "20px",
        marginBottom: "4px",
        transition: "0.3s",
    });

    return (
        <>
            <MobileUseAlert></MobileUseAlert>
            <nav style={navStyle}>
                <div style={containerStyle}>
                    <Link to="/">
                        {/* Report */}
                        <div style={getItemStyle("report")} onClick={() => setActive("report")}>
                            <FaMapMarkedAlt style={iconStyle("report")} />
                            <span>Report</span>
                            {/* <span>{!check_IsmobileView?"Treu":"0"}</span> */}
                        </div>
                    </Link>

                    {/* Nearby */}
                    <Link to="/nearby">
                        <div style={getItemStyle("nearby")} onClick={() => setActive("nearby")}>
                            <FaSearchLocation style={iconStyle("nearby")} />
                            <span>Nearby</span>
                        </div>
                    </Link>

                    <Link to="/profile">
                        {/* Profile */}
                        <div style={getItemStyle("profile")} onClick={() => setActive("profile")}>
                            <FaUserCircle style={iconStyle("profile")} />
                            <span>Profile</span>
                        </div>

                    </Link>
                </div>
            </nav>
        </>
    );
}

export default Navbar;