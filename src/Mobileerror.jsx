import React, { useEffect, useState } from 'react'
import { check_IsmobileView } from './MiniDb'

function Mobileerror({ handelclose, error }) {
    console.log(error, "error")
    const [accept, setaccept] = useState(false)
    console.log(check_IsmobileView, "Df")
    useEffect(() => {


        const check_update = () => {
           
            console.log("first")
        }
        check_update()
    }, [accept])

    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    };

    const boxStyle = {
        width: "90%",
        maxWidth: "400px",
        background: "#fff",
        borderRadius: "16px",
        padding: "20px",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    };

    const titleStyle = {
        fontSize: "18px",
        fontWeight: "600",
        marginBottom: "10px",
        color: "#111827",
    };

    const textStyle = {
        fontSize: "14px",
        color: "#6b7280",
        marginBottom: "20px",
    };

    const buttonStyle = {
        padding: "10px 20px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: "#2563eb",
        color: "#fff",
        cursor: "pointer",
    };

    return (
        <>
            {
                accept ? "" :

                    <div style={overlayStyle}>
                        <div style={boxStyle}>
                            <h2 style={titleStyle}>📱 Mobile View Only</h2>
                            <p style={textStyle}>
                                This app is designed for mobile devices. Please switch to a smaller screen
                                (below 768px) for the best experience.
                            </p>
                            <button style={buttonStyle} onClick={() => setaccept(true)} >
                                Got it
                            </button>
                        </div>
                    </div>
            }
        </>

    )
}

export default Mobileerror