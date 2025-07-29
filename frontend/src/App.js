import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// A simple spinner component
const Spinner = () => <div className="spinner"></div>;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [actors, setActors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorSchema, setActorSchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [inputData, setInputData] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const handleFetchActors = async () => {
    setLoading(true);
    setError('');
    setActors(null);
    setSelectedActor(null);
    setActorSchema(null);
    setInputData({});
    setRunResult(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/actors`, { token: apiKey });
      setActors(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectActor = async (actor) => {
    setSelectedActor(actor);
    setLoadingSchema(true);
    setError('');
    setActorSchema(null);
    setInputData({});
    setRunResult(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/get-schema`, {
        token: apiKey,
        actorId: actor.id,
      });
      setActorSchema(response.data);

      const defaultInput = {};
      if (response.data && response.data.properties) {
        for (const [key, prop] of Object.entries(response.data.properties)) {
          if (prop.default !== undefined) {
            defaultInput[key] = prop.default;
          }
        }
      }
      setInputData(defaultInput);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setInputData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRunActor = async () => {
    setIsRunning(true);
    setError('');
    setRunResult(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/run-actor`, {
        token: apiKey,
        actorId: selectedActor.id,
        inputData: inputData,
      });
      setRunResult(response.data);
    } catch(err) {
      const errorMessage = err.response?.data?.error || 'Failed to run actor.';
      setError(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const renderField = (key, prop) => {
    const commonProps = {
      id: key,
      name: key,
      value: inputData[key] || '',
      onChange: handleInputChange,
    };

    if (prop.type === 'boolean') {
      return (
        <label className="checkbox-label">
          <input type="checkbox" {...commonProps} checked={!!inputData[key]} />
          {prop.title}
        </label>
      );
    }
    if (prop.editor === 'javascript') {
      return (
        <>
          <label htmlFor={key}>{prop.title}</label>
          <p dangerouslySetInnerHTML={{ __html: prop.description }} />
          <textarea {...commonProps} rows="10" placeholder={`Enter ${prop.title}`} />
        </>
      );
    }
    return (
      <>
        <label htmlFor={key}>{prop.title}</label>
        <p dangerouslySetInnerHTML={{ __html: prop.description }} />
        <input type="text" {...commonProps} placeholder={`Enter ${prop.title}`} />
      </>
    );
  };

  const renderForm = () => {
    if (!actorSchema || !actorSchema.properties) return <p>This actor has no configurable input.</p>;

    return (
      <div className="schema-form">
        <h3>Input for {selectedActor.name}</h3>
        {Object.entries(actorSchema.properties).map(([key, prop]) => (
          <div key={key} className="form-field">
            {renderField(key, prop)}
          </div>
        ))}
        <button className="run-button" onClick={handleRunActor} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run Actor'}
        </button>
      </div>
    );
  };

  return (
    <div className="App">
      <aside className="sidebar">
        <h1>Actor Runner</h1>
        <div className="input-container">
          <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Your Apify API Token" />
          <button onClick={handleFetchActors} disabled={loading || !apiKey}>
            {loading ? 'Fetching...' : 'Fetch Actors'}
          </button>
        </div>
        {loading && <Spinner />}
        {error && !actors && <p className="error">{error}</p>}
        {actors && (
          <div>
            <h2>Your Actors</h2>
            <ul className="actor-list">
              {actors.map((actor) => (
                <li
                  key={actor.id}
                  className={`actor-list-item ${selectedActor?.id === actor.id ? 'selected' : ''}`}
                  onClick={() => handleSelectActor(actor)}
                >
                  {actor.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <main className="main-content">
        {!selectedActor && <div className="placeholder">Select an actor from the list to begin.</div>}
        {loadingSchema && <Spinner />}
        {error && selectedActor && <p className="error">{error}</p>}
        {selectedActor && !loadingSchema && actorSchema && (
          <>
            {renderForm()}
            {isRunning && <Spinner />}
            {runResult && (
              <div className="run-result">
                <h2>Run Result</h2>
                <pre>{JSON.stringify(runResult, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
