import React, {useEffect, useState} from 'react';
import {
    EARTH_NAME,
    EPISODE,
    MOST_UNPOPULAR_TABLE,
    ORIGIN_DIMENSION_VALUE,
    ORIGIN_NAME_VALUE
} from '../../constants/Constants';
import {getAllEpisodes, getMultipleCharacters} from '../../services/ServerWork';
import Spinner from '../Spinner';
import ErrorIndicator from '../ErrorIndicator';
import './MostUnpopularCharacterTable.scss';

const MostUnpopularCharacterTable = () => {
    const [numberOfEpisodesAccordingToChar, setNumberOfEpisodesAccordingToChar] = useState(undefined);
    const [mostUnpopularChar, setMostUnpopularChar] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const composeResultsHandler = (results) => {
        // function for counting how many episodes character has according to his id
        let newCharObj = {};
        results.forEach((result) => {
            newCharObj = result.characters.reduce((objChar, currChar) => {
                const currCharSplit = currChar.split('/');
                const charId = currCharSplit[currCharSplit.length - 1];
                const charIdExists = Object.keys(objChar).includes(charId);
                return !charIdExists ? {
                    ...objChar,
                    [charId]: 1,
                } : {
                    ...objChar,
                    [charId]: objChar[charId] + 1,
                };
            }, {...newCharObj});
        });
        setNumberOfEpisodesAccordingToChar(newCharObj);
    };

    const getAllEpisodesHandler = async () => {
        // function for receiving and saving all episodes from API
        let page = 1;
        const episodes = [];
        do {
           try {
              const res = await getAllEpisodes(page);
              episodes.push(...res.results);
              page = res.info.next ? page + 1 : -1;
           } catch (e) {
               setIsLoading(false);
               setError(e.message);
           }
        } while (page !== -1);
        composeResultsHandler(episodes);
    };

    const getMinNumberOfEpisodesHandler = (currMin) => {
        // function for finding the minimum number of episodes among all characters
      const sortedValues = Object.values(numberOfEpisodesAccordingToChar).reduce((arr, curr) => {
          return arr.includes(curr) ? arr : [
              ...arr,
              curr,
          ].sort((a, b) => a > b ? 1 : -1);
      }, []);
        const idxOfMinNumberOfEpisodes = currMin > 0 ? sortedValues.findIndex((val) => val === currMin) + 1 : 0;
        return sortedValues[idxOfMinNumberOfEpisodes];
    };

    const getMultipleFilteredCharactersHandler = async () => {
        // function for fetching multiple characters from API with the minimum number of episodes
        let minNumberOfEpisodes = 0;
        minNumberOfEpisodes = getMinNumberOfEpisodesHandler(minNumberOfEpisodes);
        do {
            try {
                const multipleCharUrl = Object.keys(numberOfEpisodesAccordingToChar).reduce((str, currKey) => {
                    return numberOfEpisodesAccordingToChar[currKey] > minNumberOfEpisodes ? str : str ? str + ',' + currKey : str + currKey;
                }, '');
                const res = await getMultipleCharacters(multipleCharUrl);
                const filteredRes = res.filter((r) => r.origin.name === EARTH_NAME);
                if (filteredRes.length > 0) {
                    const randomIdxOfUnpopularChar = Math.floor(Math.random() * filteredRes.length);
                    setMostUnpopularChar(filteredRes[randomIdxOfUnpopularChar]);
                    setIsLoading(false);
                    minNumberOfEpisodes = -1;
                }
            } catch (e) {
                setIsLoading(false);
                setError(e.message);
            }
        } while (minNumberOfEpisodes !== -1);
    };

    useEffect(() => {
        setIsLoading(true);
        getAllEpisodesHandler();
    }, []);

    useEffect(() => {
        if (numberOfEpisodesAccordingToChar) {
            getMultipleFilteredCharactersHandler();
        }
    }, [numberOfEpisodesAccordingToChar]);

    const TableValue = ({ tableValue }) => {
        if (!mostUnpopularChar) {
            return <td>{''}</td>
        }
        switch (tableValue) {
            case ORIGIN_NAME_VALUE:
                return <td>{mostUnpopularChar[ORIGIN_NAME_VALUE].name}</td>;
            case ORIGIN_DIMENSION_VALUE:
                return <td>{mostUnpopularChar[ORIGIN_DIMENSION_VALUE].name}</td>;
            case EPISODE:
                return <td>{mostUnpopularChar[EPISODE].length.toString()}</td>;
            default:
                return <td>{mostUnpopularChar[tableValue]}</td>
        }
    };

    return (
      <div className="unpopular-char">
          {isLoading ? (
             <Spinner />
          ) : (
              <>
                  <div className="unpopular-char__title-container">
                      <h1>The Most unpopular character from Earth C-137</h1>
                      {!!mostUnpopularChar && !!mostUnpopularChar.image && <img src={mostUnpopularChar.image} alt="Avatar of the most unpopular character" className="unpopular-char__title-container__img" />}
                  </div>
                  {error ? (
                      <ErrorIndicator error={error} />
                  ) : (
                      <table>
                          <tbody>
                          {MOST_UNPOPULAR_TABLE.map(({ tableKey, tableValue}) => (
                              <tr key={tableKey}>
                                  <td>
                                      {tableKey}
                                  </td>
                                  <TableValue tableValue={tableValue} />
                              </tr>
                          ))}
                          </tbody>
                      </table>
                  )}
              </>
          )}
      </div>
    );
};

export default MostUnpopularCharacterTable;
