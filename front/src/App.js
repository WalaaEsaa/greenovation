import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import Login from './Login';
import Profile from './Profile';
import Requests from './Requests';
import Collectors from './Collectors';
import Offers from './Offers';
import './App.css';
// import LoginW from "./LoginW";

import axios from 'axios';

function App() {
  const [user, setUser] = useState([]);          // حالة المستخدم المسجل
  const [showLogin, setShowLogin] = useState(false); // حالة ظهور البوب أب

  // const API = 'http://localhost:4000/api/users';

//   const fetchStudents = async () => {
//     const res = await axios.get(API);
//     setUser(res.data);
// };

//   useEffect(() => {
//     fetchStudents();
// }, []);

  const handleOpenLogin = () => setShowLogin(true);    // فتح البوب أب
  const handleCloseLogin = () => setShowLogin(false);  // إغلاق البوب أب

  return (
    <BrowserRouter>
      <Header
        user={user}
        setUser={setUser}
        onRegistrationClick={handleOpenLogin}
      />

      {/* نافذة تسجيل الدخول (تظهر فقط عند showLogin = true) */}
      <Login
        show={showLogin}
        onClose={handleCloseLogin}
        setUser={setUser}
      />

      {/* بقية الموقع */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
          <Route path="/requests" element={user ? <Requests /> : <Navigate to="/" />} />
          <Route path="/collectors" element={user ? <Collectors /> : <Navigate to="/" />} />
          <Route path="/offers" element={user ? <Offers /> : <Navigate to="/" />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
