import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Public Pages ---
import Home from './Components/Home';
import Login from './Components/login-registration/Login';

// --- Admin Dashboard Components ---
import Layout from "./Components/Admin/AdminLayout";
import DashboardPage from "./Components/Admin/dashbord";
import ViewCourses from "./Components/Admin/view-courses";
import ManageCourses from "./Components/Admin/manage-course";
import Admission from "./Components/Admin/Admission";
import Enquiry from "./Components/Admin/Enquiry";
import Payment from "./Components/Admin/payment";
import Details from "./Components/Admin/student-details";
import Instructor from "./Components/Admin/instructor";
import Analytics from "./Components/Admin/analytics";
import Earning from "./Components/Admin/earning";
import Reports from "./Components/Admin/Reports";
import Certificates from "./Components/Admin/certificate";
import Notifications from "./Components/Admin/notification";
import Settings from "./Components/Admin/settings";
import HelpCenter from "./Components/Admin/help-center";
import ProfilePage from "./Components/Admin/ProfilePage";
import Logout from "./Components/Admin/logout";

// --- Student Dashboard Components ---
import StudentLayout from './Components/Student/StudentLayout';
import StudentDashboard from './Components/Student/dashbord';
import PersonalDetails from './Components/Student/PersonalDetails';
import AdmissionForm from './Components/Student/AdmissionForm';
import ViewSubmittedForm from './Components/Student/ViewSubmittedForm';
import StudentReceipts from './Components/Student/StudentReceipts';

import SignOut from './Components/Student/SignOut';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- 1. PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* --- 2. ADMIN DASHBOARD ROUTES --- */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="courses/view" element={<ViewCourses />} />
          <Route path="courses/manage" element={<ManageCourses />} />
          <Route path="students/admission" element={<Admission />} />
          <Route path="students/enquiry" element={<Enquiry />} />
          <Route path="students/payment" element={<Payment />} />
          <Route path="students/details" element={<Details />} />
          <Route path="instructors" element={<Instructor />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="earnings" element={<Earning />} />
          <Route path="Reports" element={<Reports />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="logout" element={<Logout />} />
        </Route>

        {/* --- 3. STUDENT DASHBOARD ROUTES --- */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="PersonalDetails" element={<PersonalDetails />} />
          <Route path="AdmissionForm" element={<AdmissionForm />} />
          <Route path="ViewSubmittedForm" element={<ViewSubmittedForm />} />
          <Route path="StudentReceipts" element={<StudentReceipts />} />

          <Route path="SignOut" element={<SignOut />} />
        </Route>

        {/* --- 4. 404 REDIRECT --- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

/*props*/
/*const Card = ({ title, description, imageUrl }) => {
  return (
    // Fixed: className (was classNAme)
    <div className="card" style={{ border: '1px solid #ccc', margin: '10px', padding: '15px', borderRadius: '8px', width: '200px' }}>
      <img src={imageUrl} alt={title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

const cardData = [
  // Fixed: description (was descrption)
  { id: 1, title: 'Card 1', description: 'Description 1', imageUrl: 'logo512.png' },
  { id: 2, title: 'Card 2', description: 'Description 2', imageUrl: 'bca.png' },
  { id: 3, title: 'Card 3', description: 'Description 3', imageUrl: 'bca.png' },
];

const App = () => {
  // REMOVED: return () => { ... } 
  // This now returns the JSX directly
  return (
    <div className="card-container" style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      {cardData.map(card => (
        <Card
          key={card.id}
          title={card.title}           // Fixed: card.title (was card.description)
          description={card.description} // Added: missing description prop
          imageUrl={card.imageUrl}
        />
      ))}
    </div>
  );
};

export default App;*/