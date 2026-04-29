import React, { useState, useEffect } from 'react';



import axios from 'axios';



import { 



  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 



  Cell, PieChart, Pie 



} from 'recharts';



import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



import { 



  faUsers, faBookOpen, faIndianRupeeSign, 



  faEllipsisV, faCircle, faDownload



} from "@fortawesome/free-solid-svg-icons";



import './analytics.css';







const COLORS = ['#4318FF', '#6AD2FF', '#05CD99', '#FFA800', '#FF5B5B'];







const Analytics = () => {



  // State for Database Data



  const [data, setData] = useState({



    stats: { totalEnrolments: 0, totalRevenue: 0 },



    performanceData: [],



    courseShare: []



  });







  useEffect(() => {



    // Database se data fetch karna



    axios.get("http://localhost:5000/api/analytics-data")



      .then(res => setData(res.data))



      .catch(err => console.error(err));



  }, []);







  return (



    <div className="pro-analytics-container">



      <div className="analytics-top-nav">



        <div className="welcome-msg">



          <h1>Institutional Insights</h1>



          <p>Real-time data for your academy's growth</p>



        </div>



        <div className="top-actions">



          <button className="btn-glass" onClick={() => window.print()}><FontAwesomeIcon icon={faDownload} /> Report</button>



        </div>



      </div>







      <div className="hero-stats-row">



        <div className="stat-box">



          <div className="icon-wrap purple"><FontAwesomeIcon icon={faUsers} /></div>



          <div className="data-wrap">



            <p>Total Enrolments</p>



            <h3>{data.stats.totalEnrolments} <span className="up">+Live</span></h3>



          </div>



        </div>



        <div className="stat-box">



          <div className="icon-wrap green"><FontAwesomeIcon icon={faIndianRupeeSign} /></div>



          <div className="data-wrap">



            <p>Total Revenue</p>



            <h3>₹{data.stats.totalRevenue.toLocaleString()} <span className="up">+Live</span></h3>



          </div>



        </div>



        <div className="stat-box">



          <div className="icon-wrap blue"><FontAwesomeIcon icon={faBookOpen} /></div>



          <div className="data-wrap">



            <p>Active Courses</p>



            <h3>{data.courseShare.length} <span className="stable">Stable</span></h3>



          </div>



        </div>



      </div>







      <div className="charts-main-layout">



        <div className="revenue-main-card">



          <div className="card-head">



            <h3>Revenue Growth</h3>



            <FontAwesomeIcon icon={faEllipsisV} style={{cursor:'pointer', color:'#A3AED0'}} />



          </div>



          <div className="chart-area">



            <ResponsiveContainer width="100%" height={350}>



              <AreaChart data={data.performanceData.length > 0 ? data.performanceData : []}>



                <defs>



                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">



                    <stop offset="5%" stopColor="#4318FF" stopOpacity={0.3}/>



                    <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>



                  </linearGradient>



                </defs>



                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />



                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 12}} dy={10} />



                <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 12}} />



                <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />



                <Area type="monotone" dataKey="revenue" stroke="#4318FF" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />



              </AreaChart>



            </ResponsiveContainer>



          </div>



        </div>







        <div className="side-distribution-card">



          <h3>Course Share</h3>



          <ResponsiveContainer width="100%" height={220}>



            <PieChart>



              <Pie data={data.courseShare} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value">



                {data.courseShare.map((entry, index) => (



                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />



                ))}



              </Pie>



              <Tooltip />



            </PieChart>



          </ResponsiveContainer>



          <div className="pie-info-list">



            {data.courseShare.map((item, index) => (



              <div className="info-item" key={item.name}>



                <span><FontAwesomeIcon icon={faCircle} style={{color: COLORS[index % COLORS.length], fontSize: '8px', marginRight: '8px'}} /> {item.name}</span>



                <b>{item.value} Students</b>



              </div>



            ))}



          </div>



        </div>



      </div>



    </div>



  );



};







export default Analytics;