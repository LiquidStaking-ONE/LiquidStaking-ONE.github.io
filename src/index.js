import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  HashRouter,
  Routes,
  Route
} from "react-router-dom";
import Landing from "./Landing.js";
import App from "./App.js";

ReactDOM.render(
    <HashRouter>
    <Routes>
      <Route exact path={""} element={<Landing />} />
      <Route exact path={"/app"} element={<App />} />
    </Routes>
    </HashRouter>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
