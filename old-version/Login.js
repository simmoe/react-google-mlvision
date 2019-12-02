import React, {useEffect} from 'react'

//login with google is a small function that uses our credentials in config to set up an authorized callback authentication process
// return firebaseAuth().signInWithRedirect(googleProvider) 
import {loginWithGoogle} from '../helpers/auth'
import {firebaseAuth} from '../config/constants'

//login page is shown if 
import LoginPage from './LoginPage'
import Splashscreen from './Splashscreen'


const firebaseAuthKey = 'firebaseAuthInProgress'
const appTokenKey = 'appToken'

const Login = (props) => {

    const handleGoogleLogin = () => {
        loginWithGoogle().catch(err => {
            localStorage.removeItem(firebaseAuthKey)
        })

        // this will set the splashscreen until its overridden by the real
        // firebaseAuthKey
        localStorage.setItem(firebaseAuthKey, '1')
    }

    //happens before everything else is mounted
    useEffect(() => {
        // checks if we are logged in, if we are go to the home route
        if (localStorage.getItem(appTokenKey)) {
            props.history.push('/app/home')
            return
        }
        //listener for the firebase authentication object
        firebaseAuth().onAuthStateChanged(user => {
            if (user) {
                // this is the actual callback event, where we get the token
                console.log('logged into google and got token back (or rather user.id?)', user) 
                console.log('seems to me theres not really use for a token here... are we in fact ever using this token?') 
                localStorage.removeItem(firebaseAuthKey)
                localStorage.setItem(appTokenKey, user.uid)
                localStorage.setItem('userImage', user.userImage)
                localStorage.setItem('userName', user.displayName)

                props.history.push('/app/home')
            }
        })
    })

    if (localStorage.getItem(firebaseAuthKey) === '1') 
        return <Splashscreen/>
    return <LoginPage handleGoogleLogin={handleGoogleLogin}/>;

}

export default Login