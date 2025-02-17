import React from 'react'
import { useState } from 'react';
import { Form, useNavigate } from 'react-router-dom'
import Loading from '../components/Loading';

const CreateListPage = () => {
    const [errorMessage, setErrorMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        ranked: false,
        is_public: true
    })

    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : ''

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)

        try {
            const response = await fetch(`${apiBaseUrl}/profile/create_list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })
            if(response.ok){
                const data = await response.json()
                setLoading(false)
                navigate(`/list/${data.list._id}`)
            } else {
                const error = await response.json()
                throw new Error(error.message)
            }
        } catch (error) {
            console.error(error)
            setErrorMessage(error.message)
        }

    }

    return loading ? (
        <div className='flex justify-center items-center min-h-[calc(90vh-65px)]'>
            <Loading />
        </div>
    ) 
    : (
        <div className='flex flex-col mx-3 md:mx-0'>
            <div className='text-left text-2xl font-semibold text-gray-400 border-b border-gray-400 pb-1 mt-3'>Create List</div>
            {errorMessage && <div className='border-2 border-red-800 bg-red-300 p-1 px-2 w-fit text-red-600 mt-3'>{errorMessage}</div>}
            <Form onSubmit={ handleSubmit }>
                <div className='md:grid md:grid-cols-2 md:gap-4 mt-3'>
                    <div className='space-y-6'>
                        <div className='flex flex-col space-y-2 mb-2'>
                            <label htmlFor="username" className='text-white'>List name:</label>
                            <input
                                type="text"
                                id="name"
                                name='name'
                                value={formData.name}
                                onChange={handleChange} 
                                required
                                className=' bg-primary rounded-md p-2 w-full text-gray-300 focus:outline-none focus:bg-white focus:text-black'
                            />
                            <div className='text-xs text-gray-300'>50 character limit</div>
                        </div>

                        <div className="flex flex-col space-y-2 mb-2">
                            <label htmlFor="is_public" className='text-white'>Who can view:</label>
                            <select name="is_public" value={formData.is_public} onChange={handleChange} className='bg-primary p-2 text-gray-300'>
                                <option value={true}>Public</option>
                                <option value={false}>Private</option>
                            </select>
                        </div>

                        <div className='flex items-center'>
                            <input
                                type="checkbox"
                                name="ranked"
                                checked={formData.ranked} 
                                onChange={handleChange} 
                                className=''
                            />
                            <div className='ml-2 text-white'>Ranked</div>
                        </div>
                    </div>
                    

                    <div className='flex flex-col space-y-2 mb-4 mt-4 md:mt-0'>
                        <label htmlFor="description" className='text-white'>Description:</label>
                        <textarea
                            id="description"
                            name='description'
                            value={formData.description}
                            onChange={handleChange}
                            className=' bg-primary rounded-md p-2 w-full h-32 resize-vertical text-gray-300 focus:outline-none focus:bg-white focus:text-black'
                        ></textarea>
                        <div className='text-xs text-white'>(Optional)</div>
                    </div>
                </div>

                <div className='flex items-center justify-end gap-3'>
                    <button onClick={() => navigate(-1)} className='w-fit text-lg py-1 px-2 rounded-md font-semibold bg-light hover:bg-gray-500 text-white'>Cancel</button>
                    <button type="submit" className='w-fit text-lg py-1 px-2 rounded-md font-semibold bg-hover hover:bg-green-500 text-white'>Create</button>
                </div>
            </Form>
        </div>
    )
}

export default CreateListPage