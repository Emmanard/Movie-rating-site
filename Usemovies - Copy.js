import React from 'react'
import { useState, useEffect } from 'react';
function Usemovies(Query
) {
    const [isLoading, setisLoading] = useState(false);
    const [Error, setError] = useState("");
    const [movies, setmovies] = useState([]);



    useEffect(() => {
      
        const key = "ef968807";

        const controller = new AbortController();
        async function fetchMovies() {
         
          try {
            setisLoading(true);
            setError("");
    
            const res = await fetch(
              `http://www.omdbapi.com/?s=${Query}&apikey=${key}`,
              { signal: controller.signal }
            );
    
            if (!res.ok)
              throw new Error("Something went wrong with fetching movies");
    
            const data = await res.json();
    
            if (data.Response === "False") throw new Error("Movie not found");
    
            setmovies(data.Search);
            setError("");
          } catch (err) {
            if(err.name!== "AbortError"){
            setError(err.message);}
          } finally {
            setisLoading(false);
          }
        }
    
        if (Query < 3) {
          setmovies([]);
          setError("");
          return;
        }
    
        // handlecloseselectmovie()
        fetchMovies();
    
        return  function  () {
          controller.abort();
        }
      }, [Query, Error]);

      return {movies,isLoading,Error}
    
}

export default Usemovies
