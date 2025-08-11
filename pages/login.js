"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import Head from "next/head"
import { loginUser, registerUser } from "../utils/api"
import Link from "next/link"
import { useRouter } from "next/router"
import toast from "react-hot-toast"
import CryptoJS from "crypto-js"

// Lazy load the ForgotPassword component
const ForgotPassword = lazy(() => import("./forgot-password"))

const SECRET_KEY = "asdasdasd"

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
}

// Decrypt data
const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [token, setToken] = useState("")
  const router = useRouter()

  useEffect(() => {
    const link = document.createElement("link")
    link.href = "https://cdn.lineicons.com/4.0/lineicons.css"
    link.rel = "stylesheet"
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  useEffect(() => {
    const container = document.getElementById("container")
    const registerBtn = document.getElementById("register")
    const loginBtn = document.getElementById("login")

    if (registerBtn && loginBtn && container) {
      registerBtn.addEventListener("click", () => {
        container.classList.add("right-panel-active")
      })

      loginBtn.addEventListener("click", () => {
        container.classList.remove("right-panel-active")
      })
    }

    return () => {
      if (registerBtn && loginBtn) {
        registerBtn.removeEventListener("click", () => {})
        loginBtn.removeEventListener("click", () => {})
      }
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await loginUser({ email, password })
      if (response.access_token) {
        const encryptedToken = encryptData(response.access_token)
        localStorage.setItem("token", encryptedToken)
        setToken(response.access_token)
        setIsAuthenticated(true)
        toast.success("Login successful!")
        router.push("/pet_dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.message || "Login failed")
      setMessage(error.message || "Login failed")
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await registerUser({ email, name, password })
      if (response.access_token) {
        const encryptedToken = encryptData(response.access_token)
        localStorage.setItem("token", encryptedToken)
        setToken(response.access_token)
        setIsAuthenticated(true)
        toast.success("Registration successful!")
        router.push("/pet_dashboard")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error.message || "Registration failed")
      setMessage(error.message || "Registration failed")
    }
  }

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
          background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
          justify-content: center;
          align-items: center;
          flex-direction: column;
          font-family: "Poppins", sans-serif;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
          position: relative;
          overflow-x: hidden;
        }

        /* Added animated background circles */
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
          animation: moveCircles 20s ease-in-out infinite;
          z-index: -1;
        }

        @keyframes moveCircles {
          0%, 100% {
            background: 
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
          }
          25% {
            background: 
              radial-gradient(circle at 60% 30%, rgba(120, 119, 198, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 30% 70%, rgba(255, 119, 198, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(120, 219, 255, 0.4) 0%, transparent 50%);
          }
          50% {
            background: 
              radial-gradient(circle at 80% 60%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 20% 40%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 60% 20%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
          }
          75% {
            background: 
              radial-gradient(circle at 40% 90%, rgba(120, 119, 198, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 90% 50%, rgba(255, 119, 198, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 10% 60%, rgba(120, 219, 255, 0.4) 0%, transparent 50%);
          }
        }

        h1 {
          font-weight: 700;
          letter-spacing: -1.5px;
          margin: 0;
          margin-bottom: 15px;
        }

        h1.title {
          font-size: clamp(28px, 5vw, 45px);
          line-height: 1.1;
          margin: 0;
          text-shadow: 0 0 10px rgba(16, 64, 74, 0.5);
        }

        p {
          font-size: clamp(12px, 2.5vw, 14px);
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
          padding: 12px 60px;
          letter-spacing: 1px;
          text-transform: capitalize;
          transition: 0.3s ease-in-out;
          cursor: pointer;
        }

        button:hover {
          letter-spacing: 3px;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(75, 182, 183, 0.4);
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
          padding: 12px 45px;
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
          padding: 0 40px;
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
          font-size: 14px;
        }

        /* Made container fully responsive for mobile */
        .container {
          background-color: #fff;
          border-radius: 25px;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 768px;
          min-height: 500px;
          height: auto;
        }

        /* Mobile-first responsive design */
        @media (max-width: 768px) {
          body {
            padding: 10px;
          }
          
          .container {
            min-height: 600px;
            border-radius: 15px;
          }
          
          .form-container {
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            transform: none !important;
            opacity: 1 !important;
            z-index: 1 !important;
          }
          
          .login-container {
            display: block;
          }
          
          .registration-container {
            display: none;
          }
          
          .container.right-panel-active .login-container {
            display: none;
          }
          
          .container.right-panel-active .registration-container {
            display: block;
          }
          
          .overlay-container {
            position: relative !important;
            left: 0 !important;
            width: 100% !important;
            height: 200px !important;
            transform: none !important;
          }
          
          .overlay {
            position: relative !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            transform: none !important;
            background-size: cover !important;
            background-position: center !important;
          }
          
          .overlay-panel {
            position: relative !important;
            width: 100% !important;
            height: 100% !important;
            transform: none !important;
            padding: 20px !important;
          }
          
          .overlay-left {
            display: none;
          }
          
          .overlay-right {
            display: block;
          }
          
          .container.right-panel-active .overlay-left {
            display: block;
          }
          
          .container.right-panel-active .overlay-right {
            display: none;
          }
          
          form {
            padding: 20px;
            min-height: 400px;
          }
          
          button {
            padding: 12px 40px;
            font-size: 14px;
          }
          
          button.ghost {
            padding: 12px 30px;
          }
        }

        @media (min-width: 769px) {
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
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(75, 182, 183, 0.3);
        }

        @keyframes panBackground {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 100% 0;
          }
        }

        /* Added floating animation for forms */
        .form-container {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @media (max-width: 768px) {
          .form-container {
            animation: none;
          }
        }
      `}</style>
      <div className="container" id="container">
        <div className="text-[#1A237E] form-container registration-container">
          <form onSubmit={handleRegister}>
            <h1>Register Here</h1>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
              <h1 className="title">
                Hello <br /> FRIENDS
              </h1>
              <p>If you have an account, login here and have fun</p>
              <button className="ghost" id="login">
                Login
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="title">
                Start your <br /> journey now
              </h1>
              <p>If you don't have an account yet, join us and start your journey.</p>
              <button className="ghost" id="register">
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
      <p>{message}</p>
    </>
  )
}
























// "use client";



// import { useState, useEffect, lazy, Suspense } from "react";
// import Head from "next/head";
// import { loginUser, registerUser } from "../utils/api";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import toast from "react-hot-toast";
// import CryptoJS from "crypto-js";

// // Lazy load the ForgotPassword component
// const ForgotPassword = lazy(() => import("./forgot-password"));

// const SECRET_KEY = "asdasdasd";


// const encryptData = (data) => {
//   return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
// };

// // Decrypt data
// const decryptData = (encryptedData) => {
//   const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
//   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// };

// export default function Page() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [name, setName] = useState("");
//     const [message, setMessage] = useState("");
//     const [token, setToken] = useState("");
//     const router = useRouter();

//     useEffect(() => {
//         const link = document.createElement("link");
//         link.href = "https://cdn.lineicons.com/4.0/lineicons.css";
//         link.rel = "stylesheet";
//         document.head.appendChild(link);
//         return () => {
//             document.head.removeChild(link);
//         };
//     }, []);

//     useEffect(() => {
//         const container = document.getElementById("container");
//         const registerBtn = document.getElementById("register");
//         const loginBtn = document.getElementById("login");

//         if (registerBtn && loginBtn && container) {
//             registerBtn.addEventListener("click", () => {
//                 container.classList.add("right-panel-active");
//             });

//             loginBtn.addEventListener("click", () => {
//                 container.classList.remove("right-panel-active");
//             });
//         }

//         return () => {
//             if (registerBtn && loginBtn && container) {
//                 registerBtn.removeEventListener("click", () => {
//                     container.classList.add("right-panel-active");
//                 });
//                 loginBtn.removeEventListener("click", () => {
//                     container.classList.remove("right-panel-active");
//                 });
//             }
//         };
//     }, []);
// //this is working code
//     const handleLogin = async (e) => {
//       e.preventDefault();
//       try {
//           const response = await loginUser({ email, password });
//           console.log("Login Response:", response); // Debugging
  
//           if (response.access_token) {
//               setToken(response.access_token);
  
//               // Store the token in sessionStorage
//               sessionStorage.setItem("auth_token", response.access_token);
  
//               // Store user data in sessionStorage (if available)
//               if (response.user) {
//                   sessionStorage.setItem("user", JSON.stringify(response.user));
//               }
  
//               // Store the user's role in sessionStorage
//               if (response.roles) {
//                 const encryptedRoles = encryptData(response.roles); // Encrypt roles
//                 sessionStorage.setItem("roles", encryptedRoles);
//               }
  
//               // // Store the user's ID in sessionStorage
//               // if (response.user_id) {
//               //   const encryptedId = encryptData(response.user_id)
//               //     sessionStorage.setItem("user_id", encryptedId);
//               //     console.log("User ID stored in sessionStorage:", response.user_id); // Debugging
//               // }

//               // Store the user's ID in sessionStorage
// if (response.user_id) {
//   sessionStorage.setItem("user_id", response.user_id);
//   console.log("User ID stored in sessionStorage:", response.user_id); // Debugging
// }
  
//               toast.success("Login successful! Redirecting...");
//               const encryptedRoles = sessionStorage.getItem("roles");
//               const roles = decryptData(encryptedRoles);

//               // Role-based redirection
//               if (roles === "admin") {
//                   setTimeout(() => {
//                     setIsAuthenticated(true);
//                       router.push("/admin_dashboard"); // Redirect admin to /pet_status
//                   }, 2000);
//               } else if (roles === "user") {
//                   setTimeout(() => {
//                     setIsAuthenticated(true);
//                       router.push("/pet_dashboard"); // Redirect user to /pet_dashboard
//                   }, 2000);
//               } else {
//                   // Handle unknown roles
//                   toast.error("Unknown role. Redirecting to login...");
//                   setTimeout(() => {
//                     setIsAuthenticated(false);
//                       router.push("/login"); // Redirect to login for unknown roles
//                   }, 2000);
//               }
//           } else {
//               toast.error(response.detail || "Login failed");
//           }
//       } catch (error) {
//           toast.error(error.message || "An error occurred during login");
//       }
//   };



//     const handleRegister = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await registerUser({ email, name, password });
//             if (response.detail) {
//                 toast.error(response.detail);
//             } else {
//                 toast.success("Registration successful! Check your email for verification.");
//             }
//         } catch (error) {
//             toast.error(error.message || "An error occurred during registration");
//         }
//     };

//     const handleForgotPassword = async () => {
//         if (!email) {
//             toast.error("Please enter your email address.");
//             return;
//         }

//         try {
//             const response = await sendPasswordResetEmail(email);
//             toast.success("Password reset email sent. Please check your inbox.");
//         } catch (error) {
//             toast.error(error.message || "Failed to send password reset email.");
//         }
//     };

//     return (
//         <>
//             <Head>
//                 <title>Double Slider Login / Registration Form</title>
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//             </Head>

//             <style jsx global>{`
//         @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

//         * {
//           box-sizing: border-box;
//         }

//         body {
//           display: flex;
//           background-color: #f6f5f7;
//           justify-content: center;
//           align-items: center;
//           flex-direction: column;
//           font-family: "Poppins", sans-serif;
//           overflow: hidden;
//           height: 100vh;
//           margin: 0;
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
//             <div className="container" id="container">
//                 <div className="text-[#1A237E] form-container registration-container ">
//                     <form onSubmit={handleRegister}>
//                         <h1>Register Here</h1>
//                         <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
//                         <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//                         <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//                         <button type="submit">Register</button>
//                         <span>or use your account</span>
//                         <div className="social-container text-[#1A237E]">
//                             <a href="https://newback-production-a0cc.up.railway.app/auth/google" className="social">
//                                 <i className="lni lni-google"></i>
//                             </a>
//                         </div>
//                     </form>
//                 </div>

//                 <div className="form-container login-container text-[#1A237E]">
//                     <form onSubmit={handleLogin}>
//                         <h1>Login Here</h1>
//                         <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//                         <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//                         <button type="submit">Login</button>
//                         <span>or use your account</span>
//                         <div className="social-container">
//                             <a href="https://newback-production-a0cc.up.railway.app/auth/google" className="social">
//                                 <i className="lni lni-google"></i>
//                             </a>
//                         </div>
//                         <Suspense fallback={<div>Loading...</div>}>
//                             <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-purple-700">
//                                 Forgot Password?
//                             </Link>
//                         </Suspense>
//                     </form>
//                 </div>

//                 <div className="overlay-container">
//                     <div className="overlay">
//                         <div className="overlay-panel overlay-left">
//                             <h1 className="title">Hello <br /> FRIENDS</h1>
//                             <p>If you have an account, login here and have fun</p>
//                             <button className="ghost" id="login">Login</button>
//                         </div>
//                         <div className="overlay-panel overlay-right">
//                             <h1 className="title">Start your <br /> journey now</h1>
//                             <p>If you don't have an account yet, join us and start your journey.</p>
//                             <button className="ghost" id="register">Register</button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <p>{message}</p>
//         </>
//     );
// }






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
