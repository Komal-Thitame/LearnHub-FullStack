import React from "react";
import "./SignOut.css";

const SignOut = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="signout-overlay">
            <div className="signout-card">
                <div className="signout-icon-box">!</div>
                <h2>Are you sure?</h2>
                <p>Do you really want to sign out of your account?</p>
                <div className="signout-btn-group">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-confirm" onClick={onConfirm}>Sign Out</button>
                </div>
            </div>
        </div>
    );
};

export default SignOut;