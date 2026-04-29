import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faExclamationCircle, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import './logout.css';

const Logout = () => {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleConfirmLogout = () => {
        setIsLoggingOut(true);
        
        // Brief delay for smooth UX and session cleanup
        setTimeout(() => {
            localStorage.clear();
            sessionStorage.clear();
            // Redirect to login and prevent going back
            navigate("/login", { replace: true });
        }, 1500);
    };

    return (
        <div className="logout-wrapper">
            <div className={`logout-box ${isLoggingOut ? 'processing' : ''}`}>
                <div className="logout-icon-container">
                    <FontAwesomeIcon 
                        icon={isLoggingOut ? faSignOutAlt : faExclamationCircle} 
                        className={isLoggingOut ? 'icon-spin' : 'icon-alert'} 
                    />
                </div>
                
                <h2>{isLoggingOut ? "Signing Out" : "Confirm Logout"}</h2>
                <p>
                    {isLoggingOut 
                        ? "Please wait while we securely end your session..." 
                        : "Are you sure you want to log out? Any unsaved changes will be lost."}
                </p>

                {!isLoggingOut && (
                    <div className="logout-btn-group">
                        <button className="btn-confirm" onClick={handleConfirmLogout}>
                            Log Out
                        </button>
                        <button className="btn-cancel" onClick={() => navigate(-1)}>
                            <FontAwesomeIcon icon={faArrowLeft} /> Stay Logged In
                        </button>
                    </div>
                )}
                
                {isLoggingOut && (
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logout;