import asyncHandler from "express-async-handler"
import findDirector from "../utils/findDirector.js"

// @desc TMDB search query
// route GET api/tmdb/search
// @access Public
const search = asyncHandler(async (req, res) => {
    const { query, type, page } = req.query

    //attach path param
    let base_url = 'https://api.themoviedb.org/3/search/'
    if(type === ''){
        base_url += 'multi'
    } else if(type === 'films') {
        base_url += 'movie'
    } else if(type === 'person'){
        base_url += 'person'
    }

    const response = await fetch(`${base_url}?query=${query}&page=${Number(page)}&include_adult=true`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
        }
    })
    if(response.ok){
        const data = await response.json()
        const filteredResults = data.results.filter(item => item.media_type !== 'tv');
        data['results'] = filteredResults
        //filter out tv shows

        //update data

        res.json(data)
        return
    } else {
        res.json('Failed to fetch data')
    }

})

// @desc Get movies based off of type filter and page number
// route GET api/tmdb/films
// @access Public
const getFilms = asyncHandler(async (req, res) => {
    const { type, page } = req.query
    
    const response = await fetch(`https://api.themoviedb.org/3/movie/${type}?page=${page}`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
        }
    })
    if(response.ok){
        const data = await response.json()
        res.json(data)
        return
    }
    res.status(401)
    res.json('Error fetching movie page data')
})

// @desc Get individual movie page details
// route GET api/users/movie_details
// @access Public
const getMovieDetails = asyncHandler(async (req, res) => {
    const { id } = req.query
    const resObject = {}
    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
    }

    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
        headers
    })
    if(response.ok){
        const data = await response.json()
        resObject['movie_data'] = data
    }
    const castResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits`, {
        headers
    })
    if(castResponse.ok){
        const data = await castResponse.json()
        resObject['credits'] = data
        resObject['director'] = findDirector(data.crew)

        // Group crew members by job
        const crewByJob = data.crew.reduce((acc, member) => {
            if (!acc[member.job]) {
                acc[member.job] = [];
            }
            acc[member.job].push(member);
            return acc;
        }, {});

        const jobPriority = ["Director", "Producer", "Writer", "Casting", "Editor", "Director of Photography"];
        
        resObject["grouped_crew"] = Object.entries(crewByJob)
            .map(([job, members]) => ({ job, members }))
            .sort((a, b) => {
                const indexA = jobPriority.indexOf(a.job);
                const indexB = jobPriority.indexOf(b.job);
                
                if (indexA === -1 && indexB === -1) return 0; 
                if (indexA === -1) return 1; 
                if (indexB === -1) return -1; 
                return indexA - indexB; 
            });
        }

    const altTitlesResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/alternative_titles`, {
        headers
    })
    if(altTitlesResponse.ok){
        const data = await altTitlesResponse.json()
        resObject['alternative_titles'] = data
    }

    const releasesResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/release_dates`, {
        headers
    })
    if(releasesResponse.ok){
        const data = await releasesResponse.json()

        const releaseTypes = {
            1: 'Premiere',
            2: 'Theatrical Limited',
            3: 'Theatrical',
            4: 'Digital',
            5: 'Physical',
            6: 'TV' 
        }

        const groupedReleases = {};
        // Step 1: Group releases by type and then by release date
        data.results.forEach(result => {
            result.release_dates.forEach(release => {
                const typeName = releaseTypes[release.type]; // Get type name from releaseTypes

                if (!typeName) return; // Skip unknown types

                if (!groupedReleases[typeName]) {
                    groupedReleases[typeName] = {};
                }

                // Group by release date
                if (!groupedReleases[typeName][release.release_date]) {
                    groupedReleases[typeName][release.release_date] = [];
                }

                groupedReleases[typeName][release.release_date].push({
                    country: result.iso_3166_1,
                    date: release.release_date
                });
            });
        });

        // Step 2: Convert grouped object into an ordered array, and sort by date
        const orderedReleases = Object.entries(releaseTypes)
            .map(([type, name]) => ({
                type: name,
                releases: Object.entries(groupedReleases[name] || {})
                    .map(([releaseDate, releases]) => ({
                        date: releaseDate,
                        releases: releases
                    }))
                    .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date
            }))
            .filter(group => group.releases.length > 0); // Remove empty groups

        resObject['releases'] = orderedReleases;
    }

    const keywordsResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/keywords`, {
        headers
    })
    if(keywordsResponse.ok){
        const data = await keywordsResponse.json()
        resObject['keywords'] = data
    }

    res.json(resObject)
})

// @desc Get individual person page details
// route GET api/users/person_details
// @access Public
const getPersonDetails = asyncHandler(async (req, res) => {
    const { id } = req.query
    const resObject = {}

    const response = await fetch(`https://api.themoviedb.org/3/person/${id}`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
        }
    })
    if(response.ok){
        const data = await response.json()
        resObject['person_data'] = data
    }
    const creditsResponse = await fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
        }
    })
    if(creditsResponse.ok){
        const data = await creditsResponse.json()
        resObject['credits_data'] = data
    }

    res.json(resObject)
})

// @desc Get home page tmdb data (trending and popular movies, no filtering)
// route GET api/tmdb/home_page
// @access Public
const getHomePageData = asyncHandler(async (req, res) => {
    const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
    }
    const resObject = {}

    const trendingResponse = await fetch(`https://api.themoviedb.org/3/trending/movie/day`, {headers})
    if(trendingResponse.ok){
        const data = await trendingResponse.json()
        resObject['trending_data'] = data.results
    }

    const popularResponse = await fetch(`https://api.themoviedb.org/3/movie/popular`, {headers})
    if(popularResponse.ok){
        const data = await popularResponse.json()
        resObject['popular_data'] = data.results
    }

    res.json(resObject)
})

export {
    search,
    getFilms,
    getMovieDetails,
    getPersonDetails,
    getHomePageData
}