import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from "./App"
//IMPORTANT: There will be undefined behaviour when the backend is accessed from multiple clients simultaneously.
//Because the job_monitor object is shared between api calls.
//This will be fixed later with session control. However, it is not necessary for demo purpose.
//Please only open one tab
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/*<VideoPlayer props={[1,'http://localhost:5000/results/IMG_1752.mp4']}>*/}
    {/*</VideoPlayer>*/}
      <App></App>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
