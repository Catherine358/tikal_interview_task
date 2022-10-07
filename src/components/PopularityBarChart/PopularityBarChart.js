import React, {useEffect, useMemo, useState} from 'react';
import {getCharacterByName} from '../../services/ServerWork';
import {CHARACTERS, EARTH_NAME} from '../../constants/Constants';
import Spinner from '../Spinner';
import './PopularityBarChart.scss';

const PopularityBarChart = () => {
    const [charactersData, setCharactersData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const charPromises = CHARACTERS.map((char) => {
            const [name, surname] = char.name.split(' ');
            return getCharacterByName(name, surname);
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
                throw new Error(e);
            });
    }, []);

    const Legend = () => {
      return (
        <div className="bar-chart__legend">
            {charactersData.map((char) => (
                <div key={char.name + 'legend'} className="bar-chart__legend__row">
                    <div className="bar-chart__legend__row__color" style={{ backgroundColor: char.color }} />
                    <span>{char.name}</span>
                </div>
            ))}
        </div>
      );
    };

    const barsHeight = useMemo(() => {
            const numbersOfEpisodes = charactersData.reduce((arr, currChar) => {
                return arr.includes(currChar.episode.length) ? arr : [...arr, currChar.episode.length].sort((a, b) => a > b ? -1 : 1)
            }, []);
            return numbersOfEpisodes.reduce((arr, currEpisode, index) => {
                return index === 0 ? [{
                    episodes: currEpisode,
                    height: 100,
                }] : [...arr, {
                    episodes: currEpisode,
                    height: Math.floor((arr[index - 1].height * currEpisode) / arr[index - 1].episodes)
                }];
            }, []);
    }, [charactersData]);

    const Bar = ({ data }) => {
        const barHeight = barsHeight.find((b) => b.episodes === data.episode.length).height;
      return (
          <div className="bar-chart__container__bar">
              <span className="bar-chart__container__bar__title">{data.episode.length}</span>
              <div style={{ backgroundColor: data.color, height: barHeight + '%' }} />
          </div>
      );
    };

    return (
      <div className="bar-chart">
          {isLoading ? (
              <Spinner />
          ) : (
              <>
                  <h1>Bar Chart of Popularity</h1>
                  <Legend />
                  <div className="bar-chart__container">
                      {charactersData.map((char) => (
                          <Bar key={char.name} data={char} />
                      ))}
                  </div>
              </>
          )}
      </div>
    );
};

export default PopularityBarChart;
