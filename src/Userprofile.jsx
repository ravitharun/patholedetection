import React from 'react'
import Navbar from './Navbar'
import BackButton from './BackButton'

function Userprofile() {
    return (
        <>
            <Navbar page="profile" />

            <div style={styles.page}>

                <div style={styles.container}>

                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.backBtn}>
                            <BackButton />
                        </div>
                    </div>

                    {/* Profile */}
                    <div style={styles.profileWrapper}>
                        <div style={styles.profileImage}>
                            <img
                                src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
                                alt="profile"
                                style={styles.img}
                            />
                        </div>

                        {/* Tick */}
                        <div style={styles.tick}>✔</div>
                    </div>

                    {/* Info */}
                    <div style={styles.center}>
                        <h2 style={styles.name}>Tharun</h2>
                        <p style={styles.email}>Tharun@email.com</p>
                    </div>

                    {/* Stats */}
                    <div style={styles.stats}>
                        <div style={styles.row}>
                            <span>Reports Submitted:</span>
                            <span style={styles.green}>18</span>
                        </div>
                        <div style={styles.row}>
                            <span>Issues Resolved:</span>
                            <span style={styles.green}>12</span>
                        </div>
                    </div>

                    {/* Menu */}
                    <div style={styles.menuContainer}>
                        <div style={styles.menuItem}>
                            <span>📄 My Reports</span>
                            <span>›</span>
                        </div>

                        <div style={styles.menuItem}>
                            <span>🔔 Notifications</span>
                            <span>›</span>
                        </div>

                        <div style={styles.menuItem}>
                            <span>⚙️ Settings</span>
                            <span>›</span>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Userprofile


// ✅ FIXED STYLES
const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#e5e7eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px"
    },

    container: {
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "#fff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 5px 15px rgba(0,0,0,0.15)"
    },

    header: {
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        height: "140px",
        position: "relative"
    },

    backBtn: {
        position: "absolute",
        top: "15px",
        left: "15px"
    },

    profileWrapper: {
        display: "flex",
        justifyContent: "center",
        position: "relative",
        marginTop: "-60px"
    },

    profileImage: {
        width: "110px",
        height: "110px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "4px solid white",
        backgroundColor: "#ddd"
    },

    img: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },

    tick: {
        position: "absolute",
        bottom: "5px",
        right: "calc(50% - 55px)", // ✅ dynamic position (fixed)
        transform: "translateX(50%)",
        backgroundColor: "#22c55e",
        color: "#fff",
        borderRadius: "50%",
        width: "26px",
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        border: "2px solid white"
    },

    center: {
        textAlign: "center",
        marginTop: "10px"
    },

    name: {
        margin: 0,
        fontSize: "22px",
        fontWeight: "600",
        color: "#111"
    },

    email: {
        color: "#6b7280",
        fontSize: "14px"
    },

    stats: {
        marginTop: "15px",
        padding: "0 20px",
        color: "#111"
    },

    row: {
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #eee",
        fontSize: "14px"
    },

    green: {
        color: "#16a34a",
        fontWeight: "600"
    },

    menuContainer: {
        marginTop: "15px",
        padding: "10px",
        color: "#111"
    },

    menuItem: {
        backgroundColor: "#f3f4f6",
        padding: "14px 15px",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "0.2s"
    }
}