import React from 'react'
import { useState } from 'react';
import { Form, Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { Oval } from 'react-loader-spinner'

const LoginPage = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
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
                navigate('/')
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
    
    return loading ? (
        <div className='flex justify-center pt-5'>
            <Oval
            visible={true}
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="oval-loading"
            wrapperStyle={{}}
            wrapperClass=""
            />
        </div>
    ) : (
        <div className='flex w-full h-full pt-4 md:pt-0 md:items-center justify-center'>
            <div className='flex flex-col text-grayText md:mb-[50px] space-y-4 w-2/3 lg:w-1/2 xl:w-1/3'>
                <div className='text-center text-4xl font-bold'>Log In</div>
                {errorMessage && <div className='border-2 border-red-800 bg-red-300 p-1 px-2 w-fit text-red-600'>{errorMessage}</div>}
                <Form onSubmit={ submitHandler }>
                <div className='flex flex-col space-y-2 mb-2'>
                    <label htmlFor="username">Username:</label>
                    <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username" 
                    required
                    className='border border-gray-400 rounded-md p-2 w-full'
                    />
                </div>
                <div className='flex flex-col space-y-2 mb-4'>
                    <label htmlFor="password">Password:</label>
                    <div className='relative'>
                    <input
                        type='password'
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className='border border-gray-400 rounded-md p-2 w-full'
                    />
                    </div>
                </div>
                <div className='flex justify-center'>
                    <button type="submit" className='border w-fit text-lg py-2 px-3 rounded-lg mb-4 font-semibold'>Log In</button>
                </div>

                <div className='text-center'>Don't have an account? <Link to='/signup' className='text-blue-500 underline' >Sign up</Link> </div>
                </Form>
            </div>
        </div>
    )
}

export default LoginPage