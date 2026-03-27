import React, { useEffect, useState } from 'react'
import Mobileerror from './Mobileerror';

function MobileUseAlert() {
    // Tablet (768px – 1024px)
    // PC / Desktop (1024px+)
    // Mobile View (0px – 768px)
    const [accept, setaccept] = useState(false)
    const [isuserMobileView, setWidth] = useState(window.innerWidth)

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            if (window.innerWidth > 768) {
                localStorage.setItem("isuser_Mobile", "false");
            } else {
                localStorage.setItem("isuser_Mobile", "true");
            }
        };

        window.addEventListener("resize", handleResize);

        // cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    const handelclose = () => {
        setserror(false)
    }
    return (
        <>
            {/* <div>MobileUseAlert-{isuserMobileView}</div> */}
            {isuserMobileView > 768 && <Mobileerror />}
        </>

    )
}

export default MobileUseAlert