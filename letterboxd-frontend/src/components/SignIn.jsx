import { Form, Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx'
import { FaUserLock } from "react-icons/fa";

const SignIn = ({ isMobile, popup, setPopup, signinDropdown, setSigninDropdown, setSearchDropdown }) => {
    const [errorMessage, setErrorMessage] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const { loginUser } = useContext(AuthContext)
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
            const response = await fetch(`${apiBaseUrl}/users/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            if (response.ok){
                const data = await response.json()
                
                loginUser(data);
                window.location.href = window.location.href
                setSigninDropdown(false)
            } else {
                const error = await response.json()
                throw new Error(error.message)
            }
    
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(error.message)
        }
        setLoading(false)
    }

    const closeSignIn = (e) => {
        e.preventDefault()
        setPopup(false)
        setErrorMessage('')
    }

    return isMobile ? (
        <>
            <button id='sign-in-btn' onClick={() => {setSigninDropdown(prev => !prev) , setSearchDropdown(false)}}>
                {signinDropdown ? <IoClose size={30}/> : <FaUserLock size={30}/>}
            </button>

            {signinDropdown &&
                <Form onSubmit={submitHandler} className='absolute left-0 top-full w-full bg-primary p-4'>
                    <div className='relative w-full flex flex-col space-y-3'>
                        {errorMessage && <div className='w-full bg-accent text-center text-white p-1 rounded-md font-semibold'>{errorMessage}.</div>}

                        <div className='flex flex-col space-y-1'>
                            <label htmlFor="username" className='text-xs'>Username:</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className='rounded-md p-1 w-full bg-light focus:outline-none text-white focus:text-black focus:bg-white font-normal'
                            />
                        </div>
                        <div className='flex flex-col space-y-1'>
                            <label htmlFor="password" className='text-xs'>Password:</label>
                            <input
                                type='password'
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className='rounded-md p-1 w-full bg-light focus:outline-none text-white focus:text-black focus:bg-white font-normal'
                            />
                        </div>

                        <button type="submit" className='w-fit py-1 px-2 rounded-md font-bold bg-hover hover:bg-green-500 text-white self-center'>SIGN IN</button>
                    </div>
                </Form>
            }
        </>
    ) : (
        <Form onSubmit={submitHandler} className={`absolute top-0 left-0 w-full h-full transform ${popup ? '-translate-y-0' : "-translate-y-full"} transition-transform duration-300 z-10`}>
            <div className='flex items-center space-x-2 bg-secondary p-1' >
                <button type='button' onClick={(e) => closeSignIn(e)} className='hover:text-white'>
                    <IoClose size={23}/>
                </button>

                <div className='flex flex-col space-y-1'>
                    <label htmlFor="username" className='text-xs'>Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className='rounded-md p-1 w-full bg-light focus:outline-none text-white focus:text-black focus:bg-white font-normal'
                    />
                </div>
                <div className='flex flex-col space-y-1'>
                    <label htmlFor="password" className='text-xs'>Password:</label>
                    <input
                        type='password'
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='rounded-md p-1 w-full bg-light focus:outline-none text-white focus:text-black focus:bg-white font-normal'
                    />
                </div>
                
                <button type="submit" className='w-fit py-1 px-2 rounded-md font-bold bg-hover hover:bg-green-500 text-white self-end'>SIGN IN</button>
            </div>
            {errorMessage && <div className='absolute left-0 top-full w-full font-normal bg-accent text-center text-white p-1 '>{errorMessage}.</div>}
        </Form>
    )
}

export default SignIn