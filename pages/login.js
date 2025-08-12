//third code is the original

// "use client"

// import { useState, useEffect } from "react"
// import Head from "next/head"
// import { loginUser, registerUser } from "../utils/api"
// import { useRouter } from "next/navigation"
// import toast from "react-hot-toast"

// export default function AuthPage() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [name, setName] = useState("")
//   const [isLoginView, setIsLoginView] = useState(true)
//   const router = useRouter()

//   // Handle view toggle
//   const toggleView = () => setIsLoginView(!isLoginView)

//   // Handle login
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       const response = await loginUser({ email, password })
//       if (response.access_token) {
//         toast.success("Login successful!")
//         router.push("/dashboard")
//       } else {
//         toast.error(response.detail || "Login failed")
//       }
//     } catch (error) {
//       toast.error("An error occurred during login")
//     }
//   }

//   // Handle register
//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       const response = await registerUser({ email, name, password })
//       if (response.detail) {
//         toast.error(response.detail)
//       } else {
//         toast.success("Registration successful!")
//         setIsLoginView(true) // Switch to login view after registration
//       }
//     } catch (error) {
//       toast.error("An error occurred during registration")
//     }
//   }

//   return (
//     <>
//       <Head>
//         <title>Login | Registration</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
//       </Head>

//       <div className="auth-container">
//         {/* Background animation */}
//         <div className="bg-animation"></div>
        
//         {/* Mobile header */}
//         <div className="mobile-header">
//           <h1>{isLoginView ? "Welcome Back" : "Create Account"}</h1>
//           <p>{isLoginView ? "Login to continue" : "Join us to get started"}</p>
//         </div>

//         {/* Form container */}
//         <div className={`form-wrapper ${isLoginView ? "login-view" : "register-view"}`}>
//           {/* Login Form */}
//           <form 
//             className={`auth-form login-form ${!isLoginView ? "hidden" : ""}`} 
//             onSubmit={handleLogin}
//           >
//             <div className="input-group">
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="input-group">
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <button type="submit" className="auth-btn">
//               Login
//             </button>
//             <div className="auth-footer">
//               <span>Don't have an account?</span>
//               <button type="button" className="toggle-btn" onClick={toggleView}>
//                 Register
//               </button>
//             </div>
//           </form>

//           {/* Registration Form */}
//           <form 
//             className={`auth-form register-form ${isLoginView ? "hidden" : ""}`} 
//             onSubmit={handleRegister}
//           >
//             <div className="input-group">
//               <input
//                 type="text"
//                 placeholder="Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="input-group">
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="input-group">
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <button type="submit" className="auth-btn">
//               Register
//             </button>
//             <div className="auth-footer">
//               <span>Already have an account?</span>
//               <button type="button" className="toggle-btn" onClick={toggleView}>
//                 Login
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Desktop overlay (hidden on mobile) */}
//         <div className="desktop-overlay">
//           <div className={`overlay-panel ${isLoginView ? "overlay-right" : "overlay-left"}`}>
//             <h1>{isLoginView ? "Hello, Friend!" : "Welcome Back!"}</h1>
//             <p>
//               {isLoginView
//                 ? "Enter your personal details and start journey with us"
//                 : "To keep connected with us please login with your personal info"}
//             </p>
//             <button className="overlay-btn" onClick={toggleView}>
//               {isLoginView ? "Register" : "Login"}
//             </button>
//           </div>
//         </div>
//       </div>

//       <style jsx global>{`
//         :root {
//           --primary-color: #4bb6b7;
//           --secondary-color: #23a6d5;
//           --text-color: #333;
//           --light-text: #fff;
//           --bg-gradient-start: #ee7752;
//           --bg-gradient-mid: #e73c7e;
//           --bg-gradient-end: #23d5ab;
//         }

//         * {
//           box-sizing: border-box;
//           margin: 0;
//           padding: 0;
//           font-family: 'Poppins', sans-serif;
//         }

//         body {
//           overflow-x: hidden;
//         }

//         .auth-container {
//           position: relative;
//           width: 100vw;
//           height: 100vh;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           overflow: hidden;
//         }

//         /* Background animation */
//         .bg-animation {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           background: linear-gradient(-45deg, 
//             var(--bg-gradient-start), 
//             var(--bg-gradient-mid), 
//             var(--secondary-color), 
//             var(--bg-gradient-end));
//           background-size: 400% 400%;
//           animation: gradientShift 15s ease infinite;
//           z-index: -1;
//         }

//         @keyframes gradientShift {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }

//         /* Mobile header */
//         .mobile-header {
//           display: none;
//           text-align: center;
//           color: var(--light-text);
//           position: absolute;
//           top: 20%;
//           width: 100%;
//           padding: 0 20px;
//         }

//         .mobile-header h1 {
//           font-size: 2rem;
//           margin-bottom: 0.5rem;
//           text-shadow: 0 2px 4px rgba(0,0,0,0.2);
//         }

//         .mobile-header p {
//           font-size: 1rem;
//           opacity: 0.9;
//         }

//         /* Form wrapper */
//         .form-wrapper {
//           background: rgba(255, 255, 255, 0.9);
//           border-radius: 20px;
//           box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
//           width: 90%;
//           max-width: 400px;
//           padding: 2rem;
//           transition: all 0.6s ease;
//           position: relative;
//           overflow: hidden;
//         }

//         /* Auth forms */
//         .auth-form {
//           width: 100%;
//           display: flex;
//           flex-direction: column;
//           transition: all 0.3s ease;
//         }

//         .auth-form.hidden {
//           display: none;
//         }

//         .input-group {
//           margin-bottom: 1rem;
//           width: 100%;
//         }

//         input {
//           width: 100%;
//           padding: 15px;
//           border-radius: 8px;
//           border: 1px solid #ddd;
//           font-size: 1rem;
//           transition: all 0.3s;
//         }

//         input:focus {
//           outline: none;
//           border-color: var(--primary-color);
//           box-shadow: 0 0 0 2px rgba(75, 182, 183, 0.2);
//         }

//         .auth-btn {
//           background-color: var(--primary-color);
//           color: white;
//           border: none;
//           padding: 15px;
//           border-radius: 8px;
//           font-size: 1rem;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.3s;
//           margin-top: 1rem;
//         }

//         .auth-btn:hover {
//           background-color: #3a9a9b;
//           transform: translateY(-2px);
//         }

//         .auth-footer {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           margin-top: 1.5rem;
//           font-size: 0.9rem;
//           color: var(--text-color);
//         }

//         .toggle-btn {
//           background: none;
//           border: none;
//           color: var(--primary-color);
//           font-weight: 600;
//           margin-left: 0.5rem;
//           cursor: pointer;
//           text-decoration: underline;
//         }

//         /* Desktop overlay */
//         .desktop-overlay {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 50%;
//           height: 100%;
//           overflow: hidden;
//           transition: transform 0.6s ease;
//           z-index: 10;
//           display: none;
//         }

//         .overlay-panel {
//           position: absolute;
//           top: 0;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//           width: 100%;
//           height: 100%;
//           padding: 0 40px;
//           text-align: center;
//           background: linear-gradient(
//             to right,
//             rgba(75, 182, 183, 0.8),
//             rgba(35, 166, 213, 0.8)
//           );
//           color: white;
//           transition: transform 0.6s ease;
//         }

//         .overlay-left {
//           transform: translateX(-100%);
//         }

//         .overlay-right {
//           right: 0;
//           transform: translateX(0);
//         }

//         .overlay-btn {
//           border: 1px solid white;
//           background: transparent;
//           color: white;
//           padding: 12px 45px;
//           border-radius: 20px;
//           font-size: 1rem;
//           font-weight: 600;
//           margin-top: 1.5rem;
//           cursor: pointer;
//           transition: all 0.3s;
//         }

//         .overlay-btn:hover {
//           background: white;
//           color: var(--primary-color);
//         }

//         /* Responsive styles */
//         @media (max-width: 768px) {
//           .auth-container {
//             align-items: flex-start;
//             padding-top: 20%;
//           }

//           .mobile-header {
//             display: block;
//           }

//           .form-wrapper {
//             padding: 1.5rem;
//             margin-top: 2rem;
//           }
//         }

//         @media (min-width: 1024px) {
//           .form-wrapper {
//             width: 50%;
//             max-width: 500px;
//             min-height: 500px;
//           }

//           .desktop-overlay {
//             display: block;
//           }

//           .auth-form {
//             position: absolute;
//             top: 0;
//             height: 100%;
//             justify-content: center;
//           }

//           .login-view .login-form {
//             left: 0;
//             width: 50%;
//             padding: 0 2rem;
//           }

//           .login-view .register-form {
//             left: 50%;
//             width: 50%;
//             opacity: 0;
//             z-index: 1;
//           }

//           .register-view .login-form {
//             left: 0;
//             width: 50%;
//             opacity: 0;
//             z-index: 1;
//           }

//           .register-view .register-form {
//             left: 50%;
//             width: 50%;
//             z-index: 2;
//           }

//           .register-view .desktop-overlay {
//             transform: translateX(100%);
//           }

//           .register-view .overlay-left {
//             transform: translateX(0);
//           }

//           .register-view .overlay-right {
//             transform: translateX(100%);
//           }
//         }
//       `}</style>
//     </>
//   )
// }
































// "use client"

// import { useState, useEffect, lazy } from "react"
// import Head from "next/head"
// import { loginUser, registerUser, sendPasswordResetEmail } from "../utils/api"
// import Link from "next/link"
// import { useRouter } from "next/router"
// import toast from "react-hot-toast"
// import CryptoJS from "crypto-js"

// // Lazy load the ForgotPassword component
// const ForgotPassword = lazy(() => import("./forgot-password"))

// const SECRET_KEY = "asdasdasd"

// const encryptData = (data) => {
//   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
// }

// // Decrypt data
// const decryptData = (encryptedData) => {
//   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
//   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
// }

// export default function Page() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [name, setName] = useState("")
//   const [message, setMessage] = useState("")
//   const [token, setToken] = useState("")
//   const router = useRouter()

//   useEffect(() => {
//     const link = document.createElement("link")
//     link.href = "https://cdn.lineicons.com/4.0/lineicons.css"
//     link.rel = "stylesheet"
//     document.head.appendChild(link)
//     return () => {
//       document.head.removeChild(link)
//     }
//   }, [])

//   useEffect(() => {
//     const container = document.getElementById("container")
//     const registerBtn = document.getElementById("register")
//     const loginBtn = document.getElementById("login")

//     if (registerBtn && loginBtn && container) {
//       registerBtn.addEventListener("click", () => {
//         container.classList.add("right-panel-active")
//       })

//       loginBtn.addEventListener("click", () => {
//         container.classList.remove("right-panel-active")
//       })
//     }

//     return () => {
//       if (registerBtn && loginBtn && container) {
//         registerBtn.removeEventListener("click", () => {
//           container.classList.add("right-panel-active")
//         })
//         loginBtn.removeEventListener("click", () => {
//           container.classList.remove("right-panel-active")
//         })
//       }
//     }
//   }, [])

//   const handleLogin = async (e) => {
//     e.preventDefault()
//     try {
//       const response = await loginUser({ email, password })
//       console.log("Login Response:", response)

//       if (response.access_token) {
//         setToken(response.access_token)
//         sessionStorage.setItem("auth_token", response.access_token)

//         if (response.user) {
//           sessionStorage.setItem("user", JSON.stringify(response.user))
//         }

//         if (response.roles) {
//           const encryptedRoles = encryptData(response.roles)
//           sessionStorage.setItem("roles", encryptedRoles)
//         }

//         if (response.user_id) {
//           sessionStorage.setItem("user_id", response.user_id)
//           console.log("User ID stored in sessionStorage:", response.user_id)
//         }

//         toast.success("Login successful! Redirecting...")
//         const encryptedRoles = sessionStorage.getItem("roles")
//         const roles = decryptData(encryptedRoles)

//         if (roles === "admin") {
//           setTimeout(() => {
//             setIsAuthenticated(true)
//             router.push("/admin_dashboard")
//           }, 2000)
//         } else if (roles === "user") {
//           setTimeout(() => {
//             setIsAuthenticated(true)
//             router.push("/pet_dashboard")
//           }, 2000)
//         } else {
//           toast.error("Unknown role. Redirecting to login...")
//           setTimeout(() => {
//             setIsAuthenticated(false)
//             router.push("/login")
//           }, 2000)
//         }
//       } else {
//         toast.error(response.detail || "Login failed")
//       }
//     } catch (error) {
//       toast.error(error.message || "An error occurred during login")
//     }
//   }

//   const handleRegister = async (e) => {
//     e.preventDefault()
//     try {
//       const response = await registerUser({ email, name, password })
//       if (response.detail) {
//         toast.error(response.detail)
//       } else {
//         toast.success("Registration successful! Check your email for verification.")
//       }
//     } catch (error) {
//       toast.error(error.message || "An error occurred during registration")
//     }
//   }

//   const handleForgotPassword = async () => {
//     if (!email) {
//       toast.error("Please enter your email address.")
//       return
//     }

//     try {
//       const response = await sendPasswordResetEmail(email)
//       toast.success("Password reset email sent. Please check your inbox.")
//     } catch (error) {
//       toast.error(error.message || "Failed to send password reset email.")
//     }
//   }

//   return (
//     <>
//       <Head>
//         <title>Double Slider Login / Registration Form</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       </Head>

//       <style jsx global>{`
//         @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

//         * {
//           box-sizing: border-box;
//         }

//         body {
//           display: flex;
//           background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
//           background-size: 400% 400%;
//           animation: gradientShift 15s ease infinite;
//           justify-content: center;
//           align-items: center;
//           flex-direction: column;
//           font-family: "Poppins", sans-serif;
//           overflow: hidden;
//           height: 100vh;
//           margin: 0;
//           position: relative;
//         }

//         body::before {
//           content: '';
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           background: 
//             radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
//             radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
//             radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
//           animation: floatCircles 20s ease-in-out infinite;
//           z-index: -1;
//         }

//         @keyframes gradientShift {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }

//         @keyframes floatCircles {
//           0%, 100% { transform: translate(0, 0) rotate(0deg); }
//           33% { transform: translate(30px, -30px) rotate(120deg); }
//           66% { transform: translate(-20px, 20px) rotate(240deg); }
//         }

//         h1 {
//           font-weight: 700;
//           letter-spacing: -1.5px;
//           margin: 0;
//           margin-bottom: 15px;
//         }

//         h1.title {
//           font-size: 45px;
//           line-height: 45px;
//           margin: 0;
//           text-shadow: 0 0 10px rgba(16, 64, 74, 0.5);
//         }

//         p {
//           font-size: 14px;
//           font-weight: 100;
//           line-height: 20px;
//           letter-spacing: 0.5px;
//           margin: 20px 0 30px;
//           text-shadow: 0 0 10px rgba(16, 64, 74, 0.5);
//         }

//         span {
//           font-size: 14px;
//           margin-top: 25px;
//         }

//         a {
//           color: #333;
//           font-size: 14px;
//           text-decoration: none;
//           margin: 15px 0;
//           transition: 0.3s ease-in-out;
//         }

//         a:hover {
//           color: #4bb6b7;
//         }

//         .content {
//           display: flex;
//           width: 100%;
//           height: 50px;
//           align-items: center;
//           justify-content: space-around;
//         }

//         .content .checkbox {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .content input {
//           accent-color: #333;
//           width: 12px;
//           height: 12px;
//         }

//         .content label {
//           font-size: 14px;
//           user-select: none;
//           padding-left: 5px;
//         }

//         button {
//           position: relative;
//           border-radius: 20px;
//           border: 1px solid #4bb6b7;
//           background-color: #4bb6b7;
//           color: #fff;
//           font-size: 15px;
//           font-weight: 700;
//           margin: 10px;
//           padding: 12px 80px;
//           letter-spacing: 1px;
//           text-transform: capitalize;
//           transition: 0.3s ease-in-out;
//           cursor: pointer;
//         }

//         button:hover {
//           letter-spacing: 3px;
//         }

//         button:active {
//           transform: scale(0.95);
//         }

//         button:focus {
//           outline: none;
//         }

//         button.ghost {
//           background-color: rgba(225, 225, 225, 0.2);
//           border: 2px solid #fff;
//           color: #fff;
//         }

//         button.ghost i {
//           position: absolute;
//           opacity: 0;
//           transition: 0.3s ease-in-out;
//         }

//         button.ghost i.register {
//           right: 70px;
//         }

//         button.ghost i.login {
//           left: 70px;
//         }

//         button.ghost:hover i.register {
//           right: 40px;
//           opacity: 1;
//         }

//         button.ghost:hover i.login {
//           left: 40px;
//           opacity: 1;
//         }

//         form {
//           background-color: #fff;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-direction: column;
//           padding: 0 50px;
//           height: 100%;
//           text-align: center;
//         }

//         input {
//           background-color: #eee;
//           border-radius: 10px;
//           border: none;
//           padding: 12px 15px;
//           margin: 8px 0;
//           width: 100%;
//         }

//         .container {
//           background-color: #fff;
//           border-radius: 25px;
//           box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
//           position: relative;
//           overflow: hidden;
//           width: 768px;
//           max-width: 100%;
//           min-height: 500px;
//         }

//         @media (max-width: 768px) {
//           .container {
//             width: 95%;
//             min-height: 600px;
//             flex-direction: column;
//           }
          
//           .form-container {
//             position: relative !important;
//             width: 100% !important;
//             height: auto !important;
//             transform: none !important;
//             opacity: 1 !important;
//           }
          
//           .login-container {
//             display: block;
//             z-index: 2;
//           }
          
//           .registration-container {
//             display: none;
//           }
          
//           .container.right-panel-active .login-container {
//             display: none;
//           }
          
//           .container.right-panel-active .registration-container {
//             display: block;
//           }
          
//           .overlay-container {
//             position: relative !important;
//             left: 0 !important;
//             width: 100% !important;
//             height: 200px !important;
//             order: -1;
//           }
          
//           .overlay {
//             position: relative !important;
//             left: 0 !important;
//             width: 100% !important;
//             height: 100% !important;
//             transform: none !important;
//           }
          
//           .overlay-panel {
//             width: 100% !important;
//             height: 100% !important;
//             transform: none !important;
//             padding: 20px !important;
//           }
          
//           .overlay-left,
//           .overlay-right {
//             display: none;
//           }
          
//           .container.right-panel-active .overlay-left {
//             display: flex;
//           }
          
//           .container:not(.right-panel-active) .overlay-right {
//             display: flex;
//           }
          
//           form {
//             padding: 20px;
//           }
          
//           h1.title {
//             font-size: 28px;
//             line-height: 32px;
//           }
          
//           button {
//             padding: 12px 40px;
//           }
//         }

//         .form-container {
//           position: absolute;
//           top: 0;
//           height: 100%;
//           transition: all 0.6s ease-in-out;
//         }

//         .login-container {
//           left: 0;
//           width: 50%;
//           z-index: 2;
//         }

//         .registration-container {
//           left: 0;
//           width: 50%;
//           opacity: 0;
//           z-index: 1;
//         }

//         .container.right-panel-active .login-container {
//           transform: translateX(100%);
//         }

//         .container.right-panel-active .registration-container {
//           transform: translateX(100%);
//           opacity: 1;
//           z-index: 5;
//           animation: show 0.6s;
//         }

//         @keyframes show {
//           0%,
//           49.99% {
//             opacity: 0;
//             z-index: 1;
//           }

//           50%,
//           100% {
//             opacity: 1;
//             z-index: 5;
//           }
//         }

//         .overlay-container {
//           position: absolute;
//           top: 0;
//           left: 50%;
//           width: 50%;
//           height: 100%;
//           overflow: hidden;
//           transition: transform 0.6s ease-in-out;
//           z-index: 100;
//         }

//         .container.right-panel-active .overlay-container {
//           transform: translate(-100%);
//         }

//         .overlay {
//           background-image: url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-mikhail-nilov-6530653.jpg-NmIC1X70wcMEnYQQYkfLqNxuWsRYXs.jpeg");
//           background-repeat: no-repeat;
//           background-size: 120% auto;
//           background-position: 0 0;
//           color: #fff;
//           position: relative;
//           left: -100%;
//           height: 100%;
//           width: 200%;
//           transform: translateX(0);
//           transition: transform 0.6s ease-in-out;
//           animation: panBackground 15s linear infinite alternate;
//         }

//         .overlay-panel {
//           background-color: rgba(0, 0, 0, 0.6);
//         }

//         .overlay::before {
//           content: "";
//           position: absolute;
//           left: 0;
//           right: 0;
//           top: 0;
//           bottom: 0;
//           background: linear-gradient(to top, rgba(46, 94, 109, 0.4) 40%, rgba(46, 94, 109, 0));
//         }

//         .container.right-panel-active .overlay {
//           transform: translateX(50%);
//         }

//         .overlay-panel {
//           position: absolute;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-direction: column;
//           padding: 0 40px;
//           text-align: center;
//           top: 0;
//           height: 100%;
//           width: 50%;
//           transform: translateX(0);
//           transition: transform 0.6s ease-in-out;
//         }

//         .overlay-left {
//           transform: translateX(-20%);
//         }

//         .container.right-panel-active .overlay-left {
//           transform: translateX(0);
//         }

//         .overlay-right {
//           right: 0;
//           transform: translateX(0);
//         }

//         .container.right-panel-active .overlay-right {
//           transform: translateX(20%);
//         }

//         .social-container {
//           margin: 20px 0;
//         }

//         .social-container a {
//           border: 1px solid #dddddd;
//           border-radius: 50%;
//           display: inline-flex;
//           justify-content: center;
//           align-items: center;
//           margin: 0 5px;
//           height: 40px;
//           width: 40px;
//           transition: 0.3s ease-in-out;
//         }

//         .social-container a:hover {
//           border: 1px solid #4bb6b7;
//         }

//         @keyframes panBackground {
//           0% {
//             background-position: 0 0;
//           }
//           100% {
//             background-position: 100% 0;
//           }
//         }
//       `}</style>
//       <div className="container" id="container">
//         <div className="text-[#1A237E] form-container registration-container">
//           <form onSubmit={handleRegister}>
//             <h1>Register Here</h1>
//             <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
//             <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <button type="submit">Register</button>
//             <span>or use your account</span>
//             <div className="social-container text-[#1A237E]">
//               <a href="https://newback-production-a0cc.up.railway.app/auth/google" className="social">
//                 <i className="lni lni-google"></i>
//               </a>
//             </div>
//           </form>
//         </div>

//         <div className="form-container login-container text-[#1A237E]">
//           <form onSubmit={handleLogin}>
//             <h1>Login Here</h1>
//             <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <button type="submit">Login</button>
//             <span>or use your account</span>
//             <div className="social-container">
//               <a href="https://newback-production-a0cc.up.railway.app/auth/google" className="social">
//                 <i className="lni lni-google"></i>
//               </a>
//             </div>
//             <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-purple-700">
//               Forgot Password?
//             </Link>
//           </form>
//         </div>

//         <div className="overlay-container">
//           <div className="overlay">
//             <div className="overlay-panel overlay-left">
//               <h1 className="title">
//                 Hello <br /> FRIENDS
//               </h1>
//               <p>If you have an account, login here and have fun</p>
//               <button className="ghost" id="login">
//                 Login
//               </button>
//             </div>
//             <div className="overlay-panel overlay-right">
//               <h1 className="title">
//                 Start your <br /> journey now
//               </h1>
//               <p>If you don't have an account yet, join us and start your journey.</p>
//               <button className="ghost" id="register">
//                 Register
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//       <p>{message}</p>
//     </>
//   )
// }























"use client";



import { useState, useEffect, lazy, Suspense } from "react";
import Head from "next/head";
import { loginUser, registerUser } from "../utils/api";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import CryptoJS from "crypto-js";

// Lazy load the ForgotPassword component
const ForgotPassword = lazy(() => import("./forgot-password"));

const SECRET_KEY = "asdasdasd";


const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// Decrypt data
const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [token, setToken] = useState("");
    const router = useRouter();

    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://cdn.lineicons.com/4.0/lineicons.css";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    useEffect(() => {
        const container = document.getElementById("container");
        const registerBtn = document.getElementById("register");
        const loginBtn = document.getElementById("login");

        if (registerBtn && loginBtn && container) {
            registerBtn.addEventListener("click", () => {
                container.classList.add("right-panel-active");
            });

            loginBtn.addEventListener("click", () => {
                container.classList.remove("right-panel-active");
            });
        }

        return () => {
            if (registerBtn && loginBtn && container) {
                registerBtn.removeEventListener("click", () => {
                    container.classList.add("right-panel-active");
                });
                loginBtn.removeEventListener("click", () => {
                    container.classList.remove("right-panel-active");
                });
            }
        };
    }, []);
//this is working code
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
          const response = await loginUser({ email, password });
          console.log("Login Response:", response); // Debugging
  
          if (response.access_token) {
              setToken(response.access_token);
  
              // Store the token in sessionStorage
              sessionStorage.setItem("auth_token", response.access_token);
  
              // Store user data in sessionStorage (if available)
              if (response.user) {
                  sessionStorage.setItem("user", JSON.stringify(response.user));
              }
  
              // Store the user's role in sessionStorage
              if (response.roles) {
                const encryptedRoles = encryptData(response.roles); // Encrypt roles
                sessionStorage.setItem("roles", encryptedRoles);
              }
  
              // // Store the user's ID in sessionStorage
              // if (response.user_id) {
              //   const encryptedId = encryptData(response.user_id)
              //     sessionStorage.setItem("user_id", encryptedId);
              //     console.log("User ID stored in sessionStorage:", response.user_id); // Debugging
              // }

              // Store the user's ID in sessionStorage
if (response.user_id) {
  sessionStorage.setItem("user_id", response.user_id);
  console.log("User ID stored in sessionStorage:", response.user_id); // Debugging
}
  
              toast.success("Login successful! Redirecting...");
              const encryptedRoles = sessionStorage.getItem("roles");
              const roles = decryptData(encryptedRoles);

              // Role-based redirection
              if (roles === "admin") {
                  setTimeout(() => {
                    setIsAuthenticated(true);
                      router.push("/admin_dashboard"); // Redirect admin to /pet_status
                  }, 2000);
              } else if (roles === "user") {
                  setTimeout(() => {
                    setIsAuthenticated(true);
                      router.push("/pet_dashboard"); // Redirect user to /pet_dashboard
                  }, 2000);
              } else {
                  // Handle unknown roles
                  toast.error("Unknown role. Redirecting to login...");
                  setTimeout(() => {
                    setIsAuthenticated(false);
                      router.push("/login"); // Redirect to login for unknown roles
                  }, 2000);
              }
          } else {
              toast.error(response.detail || "Login failed");
          }
      } catch (error) {
          toast.error(error.message || "An error occurred during login");
      }
  };



    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await registerUser({ email, name, password });
            if (response.detail) {
                toast.error(response.detail);
            } else {
                toast.success("Registration successful! Check your email for verification.");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred during registration");
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        try {
            const response = await sendPasswordResetEmail(email);
            toast.success("Password reset email sent. Please check your inbox.");
        } catch (error) {
            toast.error(error.message || "Failed to send password reset email.");
        }
    };

    return (
        <>
            <Head>
                <title>Double Slider Login / Registration Form</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

        * {
          box-sizing: border-box;
        }

        body {
          display: flex;
          background-color: #f6f5f7;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          font-family: "Poppins", sans-serif;
          overflow: hidden;
          height: 100vh;
          margin: 0;
        }

        h1 {
          font-weight: 700;
          letter-spacing: -1.5px;
          margin: 0;
          margin-bottom: 15px;
        }

        h1.title {
          font-size: 45px;
          line-height: 45px;
          margin: 0;
          text-shadow: 0 0 10px rgba(16, 64, 74, 0.5);
        }

        p {
          font-size: 14px;
          font-weight: 100;
          line-height: 20px;
          letter-spacing: 0.5px;
          margin: 20px 0 30px;
          text-shadow: 0 0 10px rgba(16, 64, 74, 0.5);
        }

        span {
          font-size: 14px;
          margin-top: 25px;
        }

        a {
          color: #333;
          font-size: 14px;
          text-decoration: none;
          margin: 15px 0;
          transition: 0.3s ease-in-out;
        }

        a:hover {
          color: #4bb6b7;
        }

        .content {
          display: flex;
          width: 100%;
          height: 50px;
          align-items: center;
          justify-content: space-around;
        }

        .content .checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .content input {
          accent-color: #333;
          width: 12px;
          height: 12px;
        }

        .content label {
          font-size: 14px;
          user-select: none;
          padding-left: 5px;
        }

        button {
          position: relative;
          border-radius: 20px;
          border: 1px solid #4bb6b7;
          background-color: #4bb6b7;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          margin: 10px;
          padding: 12px 80px;
          letter-spacing: 1px;
          text-transform: capitalize;
          transition: 0.3s ease-in-out;
          cursor: pointer;
        }

        button:hover {
          letter-spacing: 3px;
        }

        button:active {
          transform: scale(0.95);
        }

        button:focus {
          outline: none;
        }

        button.ghost {
          background-color: rgba(225, 225, 225, 0.2);
          border: 2px solid #fff;
          color: #fff;
        }

        button.ghost i {
          position: absolute;
          opacity: 0;
          transition: 0.3s ease-in-out;
        }

        button.ghost i.register {
          right: 70px;
        }

        button.ghost i.login {
          left: 70px;
        }

        button.ghost:hover i.register {
          right: 40px;
          opacity: 1;
        }

        button.ghost:hover i.login {
          left: 40px;
          opacity: 1;
        }

        form {
          background-color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 50px;
          height: 100%;
          text-align: center;
        }

        input {
          background-color: #eee;
          border-radius: 10px;
          border: none;
          padding: 12px 15px;
          margin: 8px 0;
          width: 100%;
        }

        .container {
          background-color: #fff;
          border-radius: 25px;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
          position: relative;
          overflow: hidden;
          width: 768px;
          max-width: 100%;
          min-height: 500px;
        }

        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s ease-in-out;
        }

        .login-container {
          left: 0;
          width: 50%;
          z-index: 2;
        }

        .registration-container {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
        }

        .container.right-panel-active .login-container {
          transform: translateX(100%);
        }

        .container.right-panel-active .registration-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show 0.6s;
        }

        @keyframes show {
          0%,
          49.99% {
            opacity: 0;
            z-index: 1;
          }

          50%,
          100% {
            opacity: 1;
            z-index: 5;
          }
        }

        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.6s ease-in-out;
          z-index: 100;
        }

        .container.right-panel-active .overlay-container {
          transform: translate(-100%);
        }

        .overlay {
          background-image: url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-mikhail-nilov-6530653.jpg-NmIC1X70wcMEnYQQYkfLqNxuWsRYXs.jpeg");
          background-repeat: no-repeat;
          background-size: 120% auto;
          background-position: 0 0;
          color: #fff;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
          animation: panBackground 15s linear infinite alternate;
        }

        .overlay-panel {
          background-color: rgba(0, 0, 0, 0.6);
        }

        .overlay::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(46, 94, 109, 0.4) 40%, rgba(46, 94, 109, 0));
        }

        .container.right-panel-active .overlay {
          transform: translateX(50%);
        }

        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }

        .overlay-left {
          transform: translateX(-20%);
        }

        .container.right-panel-active .overlay-left {
          transform: translateX(0);
        }

        .overlay-right {
          right: 0;
          transform: translateX(0);
        }

        .container.right-panel-active .overlay-right {
          transform: translateX(20%);
        }

        .social-container {
          margin: 20px 0;
        }

        .social-container a {
          border: 1px solid #dddddd;
          border-radius: 50%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          margin: 0 5px;
          height: 40px;
          width: 40px;
          transition: 0.3s ease-in-out;
        }

        .social-container a:hover {
          border: 1px solid #4bb6b7;
        }

        @keyframes panBackground {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 100% 0;
          }
        }
      `}</style>
            <div className="container" id="container">
                <div className="text-[#1A237E] form-container registration-container ">
                    <form onSubmit={handleRegister}>
                        <h1>Register Here</h1>
                        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="submit">Register</button>
                        <span>or use your account</span>
                        <div className="social-container text-[#1A237E]">
                            <a href="https://newback-production-a0cc.up.railway.app/auth/google" className="social">
                                <i className="lni lni-google"></i>
                            </a>
                        </div>
                    </form>
                </div>

                <div className="form-container login-container text-[#1A237E]">
                    <form onSubmit={handleLogin}>
                        <h1>Login Here</h1>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="submit">Login</button>
                        <span>or use your account</span>
                        <div className="social-container">
                            <a href="https://newback-production-a0cc.up.railway.app/auth/google" className="social">
                                <i className="lni lni-google"></i>
                            </a>
                        </div>
                        <Suspense fallback={<div>Loading...</div>}>
                            <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-purple-700">
                                Forgot Password?
                            </Link>
                        </Suspense>
                    </form>
                </div>

                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1 className="title">Hello <br /> FRIENDS</h1>
                            <p>If you have an account, login here and have fun</p>
                            <button className="ghost" id="login">Login</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1 className="title">Start your <br /> journey now</h1>
                            <p>If you don't have an account yet, join us and start your journey.</p>
                            <button className="ghost" id="register">Register</button>
                        </div>
                    </div>
                </div>
            </div>
            <p>{message}</p>
        </>
    );
}






// // "use client";

// // import { useState, useEffect, lazy, Suspense } from "react";
// // import Head from "next/head";
// // import { loginUser, registerUser } from "../utils/api";
// // import Link from "next/link";
// // import { useRouter } from "next/router";
// // import toast from "react-hot-toast";
// // import CryptoJS from "crypto-js";

// // // Lazy load the ForgotPassword component
// // const ForgotPassword = lazy(() => import("./forgot-password"));

// // const SECRET_KEY = "asdasdasd";

// // const encryptData = (data) => {
// //   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
// // };

// // // Decrypt data
// // const decryptData = (encryptedData) => {
// //   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
// //   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// // };

// // export default function Page() {
// //   const [isAuthenticated, setIsAuthenticated] = useState(false);
  
// //   // Separate state for login and registration
// //   const [loginData, setLoginData] = useState({
// //     email: "",
// //     password: ""
// //   });
  
// //   const [registerData, setRegisterData] = useState({
// //     email: "",
// //     password: "",
// //     name: ""
// //   });
  
// //   const [message, setMessage] = useState("");
// //   const [token, setToken] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);
// //   const router = useRouter();

// //   useEffect(() => {
// //     const link = document.createElement("link");
// //     link.href = "https://cdn.lineicons.com/4.0/lineicons.css";
// //     link.rel = "stylesheet";
// //     document.head.appendChild(link);
// //     return () => {
// //       document.head.removeChild(link);
// //     };
// //   }, []);

// //   useEffect(() => {
// //     const container = document.getElementById("container");
// //     const registerBtn = document.getElementById("register");
// //     const loginBtn = document.getElementById("login");

// //     if (registerBtn && loginBtn && container) {
// //       registerBtn.addEventListener("click", () => {
// //         container.classList.add("right-panel-active");
// //       });

// //       loginBtn.addEventListener("click", () => {
// //         container.classList.remove("right-panel-active");
// //       });
// //     }

// //     return () => {
// //       if (registerBtn && loginBtn && container) {
// //         registerBtn.removeEventListener("click", () => {
// //           container.classList.add("right-panel-active");
// //         });
// //         loginBtn.removeEventListener("click", () => {
// //           container.classList.remove("right-panel-active");
// //         });
// //       }
// //     };
// //   }, []);

// //   const handleLogin = async (e) => {
// //     e.preventDefault();
// //     setIsLoading(true);
    
// //     try {
// //       const response = await loginUser(loginData);
// //       console.log("Login Response:", response);

// //       if (response.access_token) {
// //         setToken(response.access_token);

// //         // Store the token in sessionStorage
// //         sessionStorage.setItem("auth_token", response.access_token);

// //         // Store user data in sessionStorage (if available)
// //         if (response.user) {
// //           sessionStorage.setItem("user", JSON.stringify(response.user));
// //         }

// //         // Store the user's role in sessionStorage
// //         if (response.roles) {
// //           const encryptedRoles = encryptData(response.roles);
// //           sessionStorage.setItem("roles", encryptedRoles);
// //         }

// //         // Store the user's ID in sessionStorage
// //         if (response.user_id) {
// //           const encryptedId = encryptData(response.user_id);
// //           sessionStorage.setItem("user_id", encryptedId);
// //           console.log("User ID stored in sessionStorage:", response.user_id);
// //         }

// //         toast.success("Login successful! Redirecting...");
// //         const encryptedRoles = sessionStorage.getItem("roles");
// //         const roles = decryptData(encryptedRoles);

// //         // Role-based redirection
// //         if (roles === "admin") {
// //           setTimeout(() => {
// //             setIsAuthenticated(true);
// //             router.push("/pet_status");
// //           }, 2000);
// //         } else if (roles === "user") {
// //           setTimeout(() => {
// //             setIsAuthenticated(true);
// //             router.push("/pet_dashboard");
// //           }, 2000);
// //         } else {
// //           toast.error("Unknown role. Redirecting to login...");
// //           setTimeout(() => {
// //             setIsAuthenticated(false);
// //             router.push("/login");
// //           }, 2000);
// //         }
// //       } else {
// //         toast.error(response.detail || "Login failed");
// //       }
// //     } catch (error) {
// //       console.error("Login error:", error);
// //       toast.error(error.message || "An error occurred during login");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// // const handleRegister = async (e) => {
// //   e.preventDefault();
// //   setIsLoading(true);
  
// //   try {
// //     // Validate all fields are filled
// //     if (!registerData.name?.trim() || !registerData.email?.trim() || !registerData.password) {
// //       throw new Error("Please fill in all fields");
// //     }

// //     // Validate password length
// //     if (registerData.password.length < 6) {
// //       throw new Error("Password must be at least 6 characters long");
// //     }

// //     // Validate email format
// //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //     if (!emailRegex.test(registerData.email)) {
// //       throw new Error("Please enter a valid email address");
// //     }

// //     // Validate name length
// //     if (registerData.name.trim().length < 2) {
// //       throw new Error("Name must be at least 2 characters long");
// //     }

// //     console.log("Attempting registration for:", registerData.email);
// //     const response = await registerUser({
// //       name: registerData.name.trim(),
// //       email: registerData.email.trim(),
// //       password: registerData.password
// //     });

// //     if (!response?.email) {
// //       throw new Error(response?.detail || "Registration failed - no email in response");
// //     }

// //     // Successful registration
// //     toast.success("Registration successful! Please check your email for verification.");
    
// //     // Reset form
// //     setRegisterData({
// //       email: "",
// //       password: "",
// //       name: ""
// //     });

// //     // Switch to login view
// //     document.getElementById("container")?.classList?.remove("right-panel-active");

// //     // Log for debugging
// //     console.log("Registration successful for:", response.email);

// //   } catch (error) {
// //     console.error("Registration error:", error);
    
// //     // More specific error messages
// //     const errorMessage = error.message.includes("already registered") 
// //       ? "This email is already registered" 
// //       : error.message || "Registration failed. Please try again.";
    
// //     toast.error(errorMessage);

// //     // Highlight problematic fields
// //     if (error.message.includes("email")) {
// //       document.querySelector(".registration-container input[type='email']")?.focus();
// //     } else if (error.message.includes("password")) {
// //       document.querySelector(".registration-container input[type='password']")?.focus();
// //     } else if (error.message.includes("name")) {
// //       document.querySelector(".registration-container input[type='text']")?.focus();
// //     }

// //   } finally {
// //     setIsLoading(false);
// //   }
// // };

// //   const handleForgotPassword = async () => {
// //     if (!loginData.email) {
// //       toast.error("Please enter your email address in the login form.");
// //       return;
// //     }

// //     try {
// //       const response = await sendPasswordResetEmail(loginData.email);
// //       toast.success("Password reset email sent. Please check your inbox.");
// //     } catch (error) {
// //       toast.error(error.message || "Failed to send password reset email.");
// //     }
// //   };

// //   return (
// //     <>
// //       <Head>
// //         <title>Login / Registration Form</title>
// //         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
// //       </Head>

// //       <div className="container" id="container">
// //         <div className="form-container registration-container">
// //           <form onSubmit={handleRegister}>
// //             <h1>Register Here</h1>
// //             <input 
// //               type="text" 
// //               placeholder="Name" 
// //               value={registerData.name} 
// //               onChange={(e) => setRegisterData({...registerData, name: e.target.value})} 
// //               required 
// //             />
// //             <input 
// //               type="email" 
// //               placeholder="Email" 
// //               value={registerData.email} 
// //               onChange={(e) => setRegisterData({...registerData, email: e.target.value})} 
// //               required 
// //             />
// //             <input 
// //               type="password" 
// //               placeholder="Password" 
// //               value={registerData.password} 
// //               onChange={(e) => setRegisterData({...registerData, password: e.target.value})} 
// //               required 
// //             />
// //             <button type="submit" disabled={isLoading}>
// //               {isLoading ? "Registering..." : "Register"}
// //             </button>
// //             <span>or use your account</span>
// //             <div className="social-container">
// //               <a href="https://smart-back-fkf8.onrender.com/auth/google" className="social">
// //                 <i className="lni lni-google"></i>
// //               </a>
// //             </div>
// //           </form>
// //         </div>

// //         <div className="form-container login-container">
// //           <form onSubmit={handleLogin}>
// //             <h1>Login Here</h1>
// //             <input 
// //               type="email" 
// //               placeholder="Email" 
// //               value={loginData.email} 
// //               onChange={(e) => setLoginData({...loginData, email: e.target.value})} 
// //               required 
// //             />
// //             <input 
// //               type="password" 
// //               placeholder="Password" 
// //               value={loginData.password} 
// //               onChange={(e) => setLoginData({...loginData, password: e.target.value})} 
// //               required 
// //             />
// //             <button type="submit" disabled={isLoading}>
// //               {isLoading ? "Logging in..." : "Login"}
// //             </button>
// //             <span>or use your account</span>
// //             <div className="social-container">
// //               <a href="https://smart-back-fkf8.onrender.com/api/auth/google" className="social">
// //                 <i className="lni lni-google"></i>
// //               </a>
// //             </div>
// //             <Suspense fallback={<div>Loading...</div>}>
// //               <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-purple-700">
// //                 Forgot Password?
// //               </Link>
// //             </Suspense>
// //           </form>
// //         </div>

// //         <div className="overlay-container">
// //           <div className="overlay">
// //             <div className="overlay-panel overlay-left">
// //               <h1 className="title">Hello <br /> FRIENDS</h1>
// //               <p>If you have an account, login here and have fun</p>
// //               <button className="ghost" id="login" type="button">Login</button>
// //             </div>
// //             <div className="overlay-panel overlay-right">
// //               <h1 className="title">Start your <br /> journey now</h1>
// //               <p>If you don't have an account yet, join us and start your journey.</p>
// //               <button className="ghost" id="register" type="button">Register</button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //       <p>{message}</p>
// //     </>
// //   );
// // }
