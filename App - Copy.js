import { useEffect, useRef, useState,} from "react";
import Starrating from "./Starrating";
import Usemovies from "./Usemovies";
import Uselocalstoragestate from "./Uselocalstoragestate";
import Usekey from "./Usekey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const key = "ef968807";

function App() {
 const [watched, setwatched] = Uselocalstoragestate([],"watched")
  
  const [Query, setQuery] = useState("");

  const [selectedId, setselectedId] = useState(null);

 

    const {movies,isLoading,Error} = Usemovies(Query,)


  function handleselectmovie(id) {
    setselectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handlecloseselectmovie() {
    setselectedId(null);
  }
  function handleaddwatched(movie) {
    setwatched((watched) => [...watched, movie]);
    // localStorage.setItem("watched", JSON.stringify( [...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setwatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }


  
 



 
  return (
    <>
      <NavBar>
        <Search Query={Query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !Error && (
            <MovieList movies={movies} handleselectmovie={handleselectmovie} />
          )}
          {Error && <Errormessage message={Error} />}
        </Box>

        <Box>
          {selectedId ? (
            <Moviedetails
              selectedId={selectedId}
              handlecloseselectmovie={handlecloseselectmovie}
              key={key}
              handleaddwatched={handleaddwatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} handleDeleteWatched={handleDeleteWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

export default App;

function Loader() {
  return <p className="loader">Loading...</p>;
}

function Errormessage({ message }) {
  return (
    <p className="error">
      <span>⚠</span>
      {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ Query, setQuery }) {

const inputEl = useRef(null)
 Usekey('Enter', function (){
  if(document.activeElement===inputEl.current)
    return;
  inputEl.current.focus();
  setQuery("");
 })

  
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={Query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong> {movies.length} </strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleselectmovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleselectmovie={handleselectmovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleselectmovie }) {
  return (
    <li onClick={() => handleselectmovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Moviedetails({
  selectedId,
  handlecloseselectmovie,
  handleaddwatched,
  watched,
}) {
  const [movie, setmovie] = useState([]);
  const key = "ef968807";
  const [isLoading, setisLoading] = useState(false);
  const [userRating, setuserRating] = useState("");
const countRef = useRef(0);
useEffect(() => {
if (userRating) countRef.current=countRef.current+1

}, [userRating])



  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
const watcheduserRating = watched.find((movie)=>movie.imdbID===selectedId)?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split("").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    handleaddwatched(newWatchedMovie);
    handlecloseselectmovie();
  }

  Usekey('Escape', handlecloseselectmovie)


  useEffect(() => {
   
    async function getMoviedetails() {
      setisLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?i=${selectedId}&apikey=${key}`
      );
      const data = await res.json();
      setmovie(data);
      setisLoading(false);
    }
    getMoviedetails();
  }, [selectedId]);

 useEffect (function (){
  if(!title)return;
  document.title= `movie| ${title}`;
  return function(){
    document.title=`usepopcorn`
  }
 }, [title])
 
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handlecloseselectmovie}>
            &larr;
            </button>

            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <Starrating
                    maxRating={10}
                    size={24}
                    onSetRating={setuserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>You have rated this movie {watcheduserRating}<span>stars⭐</span></p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring :{actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, handleDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID}  handleDeleteWatched={handleDeleteWatched} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, handleDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={()=>handleDeleteWatched(movie.imdbID)}>
          X</button>
      </div>
    </li>
  );
}
