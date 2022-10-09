import React, {useEffect, useMemo, useState} from 'react';
import {getCharacterByName} from '../../services/ServerWork';
import {CHARACTERS, EARTH_NAME} from '../../constants/Constants';
import Spinner from '../Spinner';
import ErrorIndicator from '../ErrorIndicator';
import './PopularityBarChart.scss';

const Legend = ({ data }) => {
    return (
        <div className="bar-chart__legend">
            {data.map((char) => (
                <div key={char.name + 'legend'} className="bar-chart__legend__row">
                    <div className="bar-chart__legend__row__color" style={{ backgroundColor: char.color }} />
                    <span>{char.name}</span>
                </div>
            ))}
        </div>
    );
};

const Bar = ({ data, allBarsHeight }) => {
    const barHeight = allBarsHeight.find((b) => b.episodes === data.episode.length).height;
    return (
        <div className="bar-chart__container__bar">
            <span className="bar-chart__container__bar__title">{data.episode.length}</span>
            <div style={{ backgroundColor: data.color, height: barHeight + '%' }} />
        </div>
    );
};

const PopularityBarChart = () => {
    const [charactersData, setCharactersData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getAllGivenCharactersHandler = () => {
        // function for fetching all 5 given characters from API
        const charPromises = CHARACTERS.map((char) => {
            return getCharacterByName(char.name);
        });
        Promise.all(charPromises)
            .then((results) => {
                const newResults = results.reduce((arr, curr) => {
                    const filteredRes = curr.results.filter((r) => r.origin.name === EARTH_NAME || r.origin.name === 'unknown');
                    return [...arr, { ...filteredRes[0], color: CHARACTERS.find((char) => char.name === filteredRes[0].name).color }];
                }, []);
                setCharactersData(newResults);
                setIsLoading(false);
            })
            .catch((e) => {
                setIsLoading(false);
                setError(e.message);
            });
    };

    useEffect(() => {
        getAllGivenCharactersHandler();
    }, []);

    const barsHeight = useMemo(() => {
        // function for counting flexible height of each bar in bar chart according to number of episodes
        const numbersOfEpisodes = charactersData.reduce((arr, currChar) => {
            return arr.includes(currChar.episode.length) ? arr : [...arr, currChar.episode.length];
        }, []).sort((a, b) => a > b ? -1 : 1);
        return numbersOfEpisodes.reduce((arr, currEpisode, index) => {
            return index === 0 ? [{
                episodes: currEpisode,
                height: 100,
            }] : [...arr, {
                episodes: currEpisode,
                height: Math.floor((arr[index - 1].height * currEpisode) / arr[index - 1].episodes)
            }];}, []);
    }, [charactersData]);

    return (
      <div className="bar-chart">
          {isLoading ? (
              <Spinner />
          ) : (
              <>
                  <h1>Bar Chart of Popularity</h1>
                  {error ? (
                      <ErrorIndicator error={error} />
                  ) : (
                      <>
                          <Legend data={charactersData} />
                          <div className="bar-chart__container">
                              {charactersData.map((char) => (
                                  <Bar key={char.name} data={char} allBarsHeight={barsHeight} />
                              ))}
                          </div>
                      </>
                  )}
              </>
          )}
      </div>
    );
};

export default PopularityBarChart;
