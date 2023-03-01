import React from 'react';
import './components.css';

const LoadingPage = () => {
  return (
    <div className="loading-bg">
      <div className="loading-grid">
        <img
          src="https://dwzg9hxy3ldn9.cloudfront.net/cmh_retention3/images/logo.png"
          alt="logo"
          style={{ margin: '60%', width: '80%' }}
        />
      </div>
    </div>
  );
};

export default LoadingPage;
