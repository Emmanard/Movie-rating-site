import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import App from './App';
// import Starrating from './Starrating';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App/>
    {/* <Starrating maxRating={5} defaultRating={3} message={["okay", "Better","Best", "Great","Perfect"]}/>
    <Starrating size={24} />
     */}
  </React.StrictMode>
);


