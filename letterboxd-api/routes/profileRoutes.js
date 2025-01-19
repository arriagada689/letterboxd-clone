import express from 'express';
import {
    addMovieToProfile,
    removeMovieFromProfile,
    getMovieStatus,
    createList,
    addMoviesToLists
} from '../controllers/profileController.js'
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/add_movie_to_profile/:field').post(protect, addMovieToProfile)
router.route('/remove_movie_from_profile/:field').delete(protect, removeMovieFromProfile)
router.route('/movie_status').get(protect, getMovieStatus)
router.route('/create_list').post(protect, createList)
router.route('/add_movies_to_lists').post(protect, addMoviesToLists)

export default router