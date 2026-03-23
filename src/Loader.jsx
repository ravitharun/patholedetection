import React from 'react'

function Loader({ loadername }) {
    return (
        <div style={styles.page}>

            <div style={styles.container}>

                {/* Spinner */}
                <div style={styles.spinner}></div>

                {/* Text */}
                <p style={styles.text}>
                    {loadername || "Loading"}, please wait...
                </p>

            </div>

        </div>
    )
}

export default Loader


// ✅ Styles
const styles = {
    page: {
        position: "fixed",          // 🔥 blocks whole page
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        backgroundColor: "rgba(255,255,255,0.9)", // overlay
        backdropFilter: "blur(4px)", // 🔥 optional blur
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999               // 🔥 stays above all
    },

    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px"
    },

    spinner: {
        width: "50px",
        height: "50px",
        border: "4px solid #3b82f6",
        borderTop: "4px solid transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    },

    text: {
        fontSize: "18px",
        fontWeight: "500",
        color: "#374151",
        textAlign: "center"
    }
}