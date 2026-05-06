import React, { useState } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";

function Userprofile() {
  /* =========================
       MULTI PROFILE SYSTEM
    ========================= */

  const [profiles, setProfiles] = useState([
    {
      id: 1,
      name: "Tharun",
      email: "tharun@email.com",
      reports: 18,
      resolved: 12,
      badge: "Pro Driver",
      avatar: "https://i.pravatar.cc/300?img=12",
      trips: 128,
      rating: 4.8,
      joined: "2025",
    },
  ]);

  const [activeProfile, setActiveProfile] = useState(0);

  const [showAddProfile, setShowAddProfile] = useState(false);

  const [newProfile, setNewProfile] = useState({
    name: "",
    email: "",
  });

  const currentUser = profiles[activeProfile];

  return (
    <>
      <Navbar page="profile" />

      <div style={styles.page}>
        <div style={styles.container}>
          {/* HEADER */}
          <div style={styles.header}>
            {/* Glow */}
            <div style={styles.headerGlow}></div>

            <div style={styles.backBtn}>
              <BackButton />
            </div>

            <div style={styles.headerContent}>
              <div>
                <h1 style={styles.headerTitle}>Smart Profile</h1>

                <p style={styles.headerSubtitle}>AI Navigation Identity</p>
              </div>
            </div>
          </div>

          {/* PROFILE SWITCHER */}
          <div style={styles.profileTabs}>
            {profiles.map((profile, idx) => (
              <button
                key={profile.id}
                style={{
                  ...styles.profileTab,

                  background:
                    activeProfile === idx ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "#f3f4f6",

                  color: activeProfile === idx ? "#fff" : "#111",
                }}
                onClick={() => setActiveProfile(idx)}
              >
                {profile.name}
              </button>
            ))}

            {/* ADD BUTTON */}
            <button style={styles.addProfileBtn} onClick={() => setShowAddProfile(true)}>
              ＋
            </button>
          </div>

          {/* PROFILE */}
          <div style={styles.profileWrapper}>
            <div style={styles.profileImage}>
              <img src={currentUser.avatar} alt="profile" style={styles.img} />
            </div>

            {/* VERIFIED */}
            <div style={styles.tick}>✔</div>
          </div>

          {/* USER INFO */}
          <div style={styles.center}>
            <h2 style={styles.name}>{currentUser.name}</h2>

            <p style={styles.email}>{currentUser.email}</p>

            {/* BADGE */}
            <div style={styles.badge}>🏆 {currentUser.badge}</div>
          </div>

          {/* QUICK STATS */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{currentUser.reports}</div>

              <div style={styles.statLabel}>Reports</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statValue}>{currentUser.resolved}</div>

              <div style={styles.statLabel}>Resolved</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statValue}>{currentUser.trips}</div>

              <div style={styles.statLabel}>Trips</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statValue}>⭐ {currentUser.rating}</div>

              <div style={styles.statLabel}>Rating</div>
            </div>
          </div>

          {/* MENU */}
          <div style={styles.menuContainer}>
            <div style={styles.menuItem}>
              <div>
                <div style={styles.menuTitle}>📄 My Reports</div>

                <div style={styles.menuSubtitle}>View submitted pothole reports</div>
              </div>

              <span>›</span>
            </div>

            <div style={styles.menuItem}>
              <div>
                <div style={styles.menuTitle}>🚗 Trip History</div>

                <div style={styles.menuSubtitle}>Recent navigation activity</div>
              </div>

              <span>›</span>
            </div>

            <div style={styles.menuItem}>
              <div>
                <div style={styles.menuTitle}>🔔 Notifications</div>

                <div style={styles.menuSubtitle}>Alerts & AI updates</div>
              </div>

              <span>›</span>
            </div>

            <div style={styles.menuItem}>
              <div>
                <div style={styles.menuTitle}>⚙️ Settings</div>

                <div style={styles.menuSubtitle}>Customize your experience</div>
              </div>

              <span>›</span>
            </div>
          </div>

          {/* FOOTER */}
          <div style={styles.footer}>Member since {currentUser.joined}</div>
        </div>

        {/* =========================
                   ADD PROFILE MODAL
                ========================= */}

        {showAddProfile && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Add New Profile</h2>

              <input
                placeholder="Enter name"
                style={styles.input}
                value={newProfile.name}
                onChange={(e) =>
                  setNewProfile({
                    ...newProfile,
                    name: e.target.value,
                  })
                }
              />

              <input
                placeholder="Enter email"
                style={styles.input}
                value={newProfile.email}
                onChange={(e) =>
                  setNewProfile({
                    ...newProfile,
                    email: e.target.value,
                  })
                }
              />

              <div style={styles.modalBtns}>
                <button style={styles.cancelBtn} onClick={() => setShowAddProfile(false)}>
                  Cancel
                </button>

                <button
                  style={styles.saveBtn}
                  onClick={() => {
                    if (!newProfile.name || !newProfile.email) {
                      return;
                    }

                    setProfiles([
                      ...profiles,

                      {
                        id: Date.now(),

                        name: newProfile.name,

                        email: newProfile.email,

                        reports: 0,

                        resolved: 0,

                        badge: "New Explorer",

                        avatar: `https://i.pravatar.cc/300?u=${newProfile.email}`,

                        trips: 0,

                        rating: 5.0,

                        joined: "2026",
                      },
                    ]);

                    setNewProfile({
                      name: "",
                      email: "",
                    });

                    setShowAddProfile(false);
                  }}
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Userprofile;

/* =========================
   STYLES
========================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#eef2ff,#f8fafc)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "18px",
  },

  container: {
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "#fff",
    borderRadius: "28px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
    position: "relative",
  },

  header: {
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    minHeight: "170px",
    position: "relative",
    overflow: "hidden",
  },

  headerGlow: {
    position: "absolute",
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.12)",
    top: "-100px",
    right: "-80px",
  },

  headerContent: {
    padding: "80px 24px 24px",
  },

  headerTitle: {
    color: "#fff",
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.82)",
    marginTop: "6px",
    fontSize: "14px",
  },

  backBtn: {
    position: "absolute",
    top: "18px",
    left: "18px",
    zIndex: 5,
  },

  profileTabs: {
    display: "flex",
    gap: "8px",
    padding: "16px",
    overflowX: "auto",
  },

  profileTab: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "999px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "0.25s",
  },

  addProfileBtn: {
    minWidth: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "none",
    background: "#111827",
    color: "#fff",
    fontSize: "22px",
    cursor: "pointer",
    fontWeight: "700",
  },

  profileWrapper: {
    display: "flex",
    justifyContent: "center",
    position: "relative",
    marginTop: "-28px",
  },

  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "5px solid white",
    backgroundColor: "#ddd",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  tick: {
    position: "absolute",
    bottom: "8px",
    right: "calc(50% - 58px)",
    transform: "translateX(50%)",
    backgroundColor: "#22c55e",
    color: "#fff",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    border: "3px solid white",
    boxShadow: "0 4px 12px rgba(34,197,94,0.4)",
  },

  center: {
    textAlign: "center",
    marginTop: "14px",
    padding: "0 20px",
  },

  name: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#111827",
  },

  email: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "6px",
  },

  badge: {
    display: "inline-block",
    marginTop: "12px",
    background: "linear-gradient(135deg,#f59e0b,#f97316)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "14px",
    padding: "22px",
  },

  statCard: {
    background: "linear-gradient(180deg,#f8fafc,#eef2ff)",
    borderRadius: "18px",
    padding: "18px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },

  statValue: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#111827",
  },

  statLabel: {
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "13px",
  },

  menuContainer: {
    padding: "0 18px 18px",
  },

  menuItem: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
    cursor: "pointer",
    transition: "0.25s",
    boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
  },

  menuTitle: {
    fontWeight: "700",
    color: "#111827",
  },

  menuSubtitle: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#6b7280",
  },

  footer: {
    padding: "18px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "13px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "18px",
  },

  modal: {
    background: "#fff",
    width: "100%",
    maxWidth: "360px",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },

  modalTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "800",
    color: "#111827",
  },

  input: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
  },

  modalBtns: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
  },

  cancelBtn: {
    flex: 1,
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "#e5e7eb",
    cursor: "pointer",
    fontWeight: "700",
  },

  saveBtn: {
    flex: 1,
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
  },
};
