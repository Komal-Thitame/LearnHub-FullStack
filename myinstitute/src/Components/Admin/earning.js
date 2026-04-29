import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCircleCheck, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import './earning.css';

const Earning = () => {
  // State to store live database data
  const [data, setData] = useState({
    totalRevenue: 0,
    recentTransactions: []
  });

  // Fetch data from backend on page load
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/earnings-data");
        setData(res.data);
      } catch (err) {
        console.error("Connection Error:", err);
      }
    };
    fetchEarnings();
  }, []);

  // Static Data for PieChart (Aap ise bhi backend se dynamic kar sakte hain)
  const pieData = [
    { name: 'Courses', value: 65, color: '#6366f1' },
    { name: 'Workshops', value: 20, color: '#818cf8' },
    { name: 'Materials', value: 15, color: '#c7d2fe' },
  ];

  return (
    <div className="fin-main-container">
      <div className="fin-grid-wrapper">
        
        <div className="fin-left-panel">
          {/* WALLET CARD: Displaying live Revenue */}
          <div className="fin-wallet-card">
            <div className="fin-card-upper">
              <div className="fin-chip"></div>
              <FontAwesomeIcon icon={faCreditCard} className="fin-card-logo" />
            </div>
            <div className="fin-balance-info">
              <p>Current Revenue</p>
              <h2>₹{data.totalRevenue.toLocaleString()}</h2>
            </div>
            <div className="fin-card-holder">
              <span>INSTITUTE ADMIN</span>
              <span>03/29</span>
            </div>
          </div>

          <div className="fin-breakdown-card">
            <h3>Revenue Source</h3>
            <div className="fin-pie-box">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="fin-pie-center">
                <strong>85%</strong>
                <span>Profit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="fin-right-panel">
          <div className="fin-payout-box">
             <div className="fin-p-info">
                <h4>Withdrawal Ready</h4>
                <p>You can withdraw up to ₹50,000 today.</p>
             </div>
             <button className="fin-withdraw-btn">Withdraw Now <FontAwesomeIcon icon={faArrowRight} /></button>
          </div>

          <div className="fin-history-section">
            <div className="fin-section-head">
              <h3>Recent Transactions</h3>
              <button className="fin-filter-btn">Live View</button>
            </div>
            
            <div className="fin-trx-list">
              {/* MAPPING LIVE DATA: Yahan se aapka data dikhna shuru hoga */}
              {data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((trx, idx) => (
                  <div className="fin-trx-card" key={idx}>
                     <div className="fin-trx-icon" style={{color: '#05cd99'}}><FontAwesomeIcon icon={faCircleCheck} /></div>
                     <div className="fin-trx-details">
                        <strong>{trx.user}</strong>
                        <p>{trx.course}</p>
                     </div>
                     <div className="fin-trx-meta">
                        <span className="fin-price-tag">₹{trx.price.toLocaleString()}</span>
                        <span className="fin-time-tag">{trx.time}</span>
                     </div>
                  </div>
                ))
              ) : (
                <p style={{textAlign:'center', padding:'20px', color:'#A3AED0'}}>No transactions found in database</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Earning;