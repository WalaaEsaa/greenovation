import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = ({ show, onClose, setUser }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState("choose");
  const [mode, setMode] = useState(""); // login OR register
  const [accountType, setAccountType] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    registry: "",
    gps: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "http://localhost:4000";

  useEffect(() => {
    if (accountType) fetchUsers();
  }, [accountType]);

  //walaa: Reset form when modal opens
  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setStep("choose");
      setMode("");
      setAccountType("");
      setEditingId(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        registry: "",
        gps: "",
      });
      setError("");
      setSuccess("");
    }
  }, [show]);

  // Fetch users when accountType changes
  const fetchUsers = async () => {
    try {
      const endpoint =
        accountType === "user"
          ? "/users"
          : accountType === "seller"
          ? "/sellers"
          // : accountType === "collector"
          // ? "/collectors"
          : "/collectors";

      const response = await axios.get(`${API_URL}${endpoint}`);
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      // setError("⚠️ فشل في تحميل البيانات");
    }
  };

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ----------- LOGIN ------------
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: form.email,
        password: form.password,
        type: accountType,
      });

      // Store JWT token and user data
      const { token, user, type } = response.data;
      setUser(user);
      localStorage.setItem("greenovation_user", JSON.stringify(user));
      localStorage.setItem("greenovation_user_type", type);
      localStorage.setItem("greenovation_token", token);

      setSuccess("✅ تم تسجيل الدخول بنجاح");
      // Navigate to profile page
      setError("");

      setTimeout(() => {
        onClose();
        navigate('/profile');
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("❌ بيانات الدخول غير صحيحة");
    }
  };

  // ----------- REGISTER ------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("يجب إدخال الإيميل والباسورد");
      return;
    }

    try {
      // Always use /users endpoint - server handles all types there
      if (editingId) {
        await axios.put(`${API_URL}/users/${editingId}`, form);
        setSuccess("✅ تم التعديل بنجاح");
      } else {
        await axios.post(`${API_URL}/users`, { ...form, type: accountType });
        setSuccess("✅ تم إنشاء الحساب بنجاح");
        
        // Auto-login after successful registration
        try {
          const loginResponse = await axios.post(`${API_URL}/users/login`, {
            email: form.email,
            password: form.password,
            type: accountType,
          });
          
          setUser(loginResponse.data.user);
          localStorage.setItem("greenovation_user", JSON.stringify(loginResponse.data.user));
          localStorage.setItem("greenovation_user_type", accountType);
          
          setTimeout(() => {
            onClose();
            navigate('/profile');
          }, 1200);
        } catch (loginErr) {
          console.error("Auto-login failed:", loginErr);
          setTimeout(() => onClose(), 2000);
        }
        return;
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        registry: "",
        gps: "",
      });

      setEditingId(null);
      setError("");
      fetchUsers();

      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("❌ فشل العملية");
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      registry: user.registry || "",
      gps: user.gps || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const endpoint =
        accountType === "user"
          ? "/users"
          : accountType === "seller"
          ? "/sellers"
          : "/collectors";

      await axios.delete(`${API_URL}${endpoint}/${id}`);
      setSuccess("🗑️ تم الحذف بنجاح");
      fetchUsers();
    } catch {
      setError("❌ فشل الحذف");
    }
  };

  if (!show) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <span className="popup-close" onClick={onClose}>
          &times;
        </span>

        {/* ---------------- STEP 1: Choose account type ---------------- */}
        {step === "choose" && (
          <div className="choose-account">
            <h3>اختار نوع الحساب</h3>

            <button
              className="button"
              onClick={() => {
                setAccountType("user");
                setStep("choose-mode");
              }}
            >
              مستخدم
            </button>

            <button
              className="button"
              onClick={() => {
                setAccountType("seller");
                setStep("choose-mode");
              }}
            >
              تاجر
            </button>

            <button
              className="button"
              onClick={() => {
                setAccountType("collector");
                setStep("choose-mode");
              }}
            >
              جامع
            </button>
          </div>
        )}

        {/* ---------------- STEP 2: Choose login OR register ---------------- */}
        {step === "choose-mode" && (
          <div className="choose-account">
            <h3>اختر العملية</h3>

            <button
              className="button"
              onClick={() => {
                setMode("login");
                setStep("form");
              }}
            >
              تسجيل دخول
            </button>

            <button
              className="button"
              onClick={() => {
                setMode("register");
                setStep("form");
              }}
            >
              إنشاء حساب
            </button>
          </div>
        )}

        {/* ---------------- STEP 3: FORM ---------------- */}
        {step === "form" && (
          <div className="login-form">
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="الإيميل"
                value={form.email}
                onChange={handleInput}
                className="input"
              />

              {/* Password */}
              <input
                type="password"
                name="password"
                placeholder="كلمة السر"
                value={form.password}
                onChange={handleInput}
                className="input"
              />

              {/* REGISTER FIELDS ONLY */}
              {mode === "register" && (
                <>
                  <input
                    type="text"
                    name="name"
                    placeholder="الاسم"
                    value={form.name}
                    onChange={handleInput}
                    className="input"
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="رقم الهاتف"
                    value={form.phone}
                    onChange={handleInput}
                    className="input"
                  />

                  {(accountType === "seller" || accountType === "collector") && (
                    <input
                      type="text"
                      name="registry"
                      placeholder="السجل التجاري"
                      value={form.registry}
                      onChange={handleInput}
                      className="input"
                    />
                  )}

                  {(accountType === "seller" || accountType === "collector") && (
                    //gps input with button to get current location
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        name="gps"
                        placeholder="الإحداثيات الجغرافية"
                        value={form.gps}
                        onChange={handleInput}
                        className="input"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="button"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                const { latitude, longitude } = position.coords;
                                setForm({ ...form, gps: `${latitude},${longitude}` });
                              },
                              (error) => {
                                setError("❌ فشل في الحصول على الموقع الجغرافي");
                                console.error("Geolocation error:", error);
                              }
                            );
                          } else {
                            setError("❌ المتصفح لا يدعم تحديد الموقع الجغرافي");
                          }
                        }}
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                      >
                        📍 الحصول على الموقع
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* BUTTONS */}
              {mode === "login" ? (
                <button type="button" className="button" onClick={handleLogin}>
                  تسجيل الدخول
                </button>
              ) : (
                <button type="submit" className="button">
                  {editingId ? "تعديل" : "إنشاء حساب"}
                </button>
              )}
            </form>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* USERS LIST (only register mode) */}
            {mode === "register" && (
              <div className="users-list">
                {users.map((user) => (
                  <div key={user.id} className="user-item">
                    <span>{user.name || "بدون اسم"}</span>
                    <div className="actions">
                      <button
                        onClick={() => handleEdit(user)}
                        className="edit-btn"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="delete-btn"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
