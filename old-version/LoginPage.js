import React from 'react'

// this is the URL we copied from firebase storage
const loginButtonUrl = 'https://firebasestorage.googleapis.com/v0/b/react-dobbeltganger.appspot.com/o/g-' +
        'logo.png?alt=media&token=61a5a0fb-4646-4b08-90f1-298731a1700b';

const styles = {
    backgroundImage: `url(${loginButtonUrl})`
} 

const LoginPage = ({handleGoogleLogin}) => (

    <div className="login-container">
        <div onClick={handleGoogleLogin} className="login-button">
            <div style={styles} className="google-logo">
                <span className="button-text">Sign In With Google</span>
            </div>
        </div>
    </div>
)

export default LoginPage