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
        const charMap = {};
        results.forEach((result) => {
            result.characters.forEach((char) => {
                const currCharSplit = char.split('/');
                const charId = currCharSplit[currCharSplit.length - 1];
               if (charMap[charId]) {
                   charMap[charId] = charMap[charId] + 1;
               } else {
                   charMap[charId] = 1;
               }
            });
        });
        const charMapArr = Object.keys(charMap)
            .map((charObjKey) => ({ charId: charObjKey, numOfEpisodes: charMap[charObjKey] }))
            .sort((a, b) => a.numOfEpisodes > b.numOfEpisodes ? 1 : -1);
        let currNumOfEpisodes = -1;
        const charMapArrByNumOfEpisodes = charMapArr.reduce((arr, currChar) => {
            if (currChar.numOfEpisodes !== currNumOfEpisodes) {
                currNumOfEpisodes = currChar.numOfEpisodes;
                return [...arr, {
                    numOfEpisodes: currChar.numOfEpisodes,
                    charIds: currChar.charId,
                }];
            } else {
                const updatedCharIds = `${arr[arr.length - 1].charIds},${currChar.charId}`;
                return [...arr.filter((val) => val.numOfEpisodes !== currChar.numOfEpisodes), {
                    numOfEpisodes: currChar.numOfEpisodes,
                    charIds: updatedCharIds,
                }];
            }
        }, []);
        setNumberOfEpisodesAccordingToChar(charMapArrByNumOfEpisodes);
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

    const getMultipleFilteredCharactersHandler = async () => {
        // function for fetching multiple characters from API with the minimum number of episodes
        let loadNext = true;
        let count = 0;
        do {
            try {
                // assuming that there is at least one character
                const res = await getMultipleCharacters(numberOfEpisodesAccordingToChar[count].charIds);
                const filteredRes = res.filter((r) => r.origin.name === EARTH_NAME);
                if (filteredRes.length > 0) {
                    const randomIdxOfUnpopularChar = Math.floor(Math.random() * filteredRes.length);
                    setMostUnpopularChar(filteredRes[randomIdxOfUnpopularChar]);
                    setIsLoading(false);
                    loadNext = false;
                }
                count++;
            } catch (e) {
                setIsLoading(false);
                setError(e.message);
            }
        } while (loadNext || numberOfEpisodesAccordingToChar.length < count);
        if (count >= numberOfEpisodesAccordingToChar.length) {
            setIsLoading(false);
            setError('No characters from Earth-137 found.');
        }
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
