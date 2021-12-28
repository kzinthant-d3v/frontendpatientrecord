import React, { ReactElement } from 'react';

function Login():ReactElement {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
    >
      <h3>Login to Shwe La Won Dental Clinic</h3>
      <button
        style={{
          backgroundColor: '#00a17b',
          border: 'none',
        }}
        type="button"
      >
        Login with Authentication

      </button>
    </div>
  );
}

export default Login;