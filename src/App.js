import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useKey } from "./useKey";
import { useLocalStorageState } from "./useLocalStorageState";
import { useMovies } from "./useMovies";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f84fc31d";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4">
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched} />
            </>
          )}
        </Box>
      </Main>
    </div>
  );
}

function NavBar({ children }) {
  return (
    <nav className="flex items-center justify-between p-4 bg-purple-600 rounded-lg">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 text-white">
      <span className="text-3xl">🍿</span>
      <h1 className="text-2xl font-semibold">usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", () => {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="w-full md:w-3/5 p-2 text-lg rounded-md shadow-md focus:outline-none"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="text-gray-400">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="flex flex-col lg:flex-row gap-4 mt-6">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full lg:w-1/2 bg-gray-800 p-4 rounded-lg shadow-lg overflow-auto relative">
      <button className="absolute top-2 right-2 text-xl" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Loader() {
  return <p className="text-center text-lg font-semibold">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="text-center text-lg text-red-500">
      <span>⛔️</span> {message}
    </p>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="grid gap-4">
      {movies.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li
      className="flex gap-4 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition"
      onClick={() => onSelectMovie(movie.imdbID)}
    >
      <img className="w-20 h-28 rounded-lg" src={movie.Poster} alt={`${movie.Title} poster`} />
      <div>
        <h3 className="text-xl font-semibold">{movie.Title}</h3>
        <p className="text-gray-400">{movie.Year}</p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const countRef = useRef(0);

  useEffect(() => {
    if (userRating) countRef.current++;
  }, [userRating]);

  const isWatched = watched.some((movie) => movie.imdbID === selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    if (!movie.Title) return;
    document.title = `Movie | ${movie.Title}`;
    return () => (document.title = "usePopcorn");
  }, [movie.Title]);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      imdbRating: Number(movie.imdbRating),
      runtime: Number(movie.Runtime.split(" ")[0]),
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  return (
    <div className="details p-4">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header className="flex items-center gap-4">
            <button className="text-2xl text-white" onClick={onCloseMovie}>
              &larr;
            </button>
            <img className="w-32 rounded-lg" src={movie.Poster} alt={`Poster of ${movie.Title}`} />
            <div>
              <h2 className="text-3xl font-bold">{movie.Title}</h2>
              <p>{movie.Released} &bull; {movie.Runtime}</p>
              <p>{movie.Genre}</p>
              <p>⭐️ {movie.imdbRating} IMDb rating</p>
            </div>
          </header>
          <section className="mt-4">
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating maxRating={10} size={24} onSetRating={setUserRating} />
                  {userRating > 0 && (
                    <button className="bg-purple-600 text-white p-2 rounded-full" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>You rated with movie {watchedUserRating} ⭐️</p>
              )}
            </div>
            <p><em>{movie.Plot}</em></p>
            <p>Starring {movie.Actors}</p>
            <p>Directed by {movie.Director}</p>
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
    <div className="p-4 bg-gray-700 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold">Movies you watched</h2>
      <div className="flex gap-4">
        <p>#️⃣ {watched.length} movies</p>
        <p>⭐️ {avgImdbRating.toFixed(2)}</p>
        <p>🌟 {avgUserRating.toFixed(2)}</p>
        <p>⏳ {avgRuntime} min</p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="space-y-4">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
      <img className="w-20 h-28 rounded-lg" src={movie.poster} alt={`${movie.title} poster`} />
      <div>
        <h3 className="text-xl font-semibold">{movie.title}</h3>
        <p className="text-gray-400">{movie.runtime} min</p>
      </div>
      <button
        className="ml-auto bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
        onClick={() => onDeleteWatched(movie.imdbID)}
      >
        X
      </button>
    </li>
  );
}
