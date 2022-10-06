import React, {useEffect, useState} from 'react';
import {EPISODE, MOST_UNPOPULAR_TABLE, ORIGIN_DIMENSION_VALUE, ORIGIN_NAME_VALUE} from '../../constants/Constants';
import {getAllEpisodes, getMultipleCharacters} from '../../services/ServerWork';
import './MostUnpopularCharacterTable.scss';

const MostUnpopularCharacterTable = () => {

    const [page, setPage] = useState(1);
    const [numberOfEpisodesAccordingToChar, setNumberOfEpisodesAccordingToChar] = useState({});
    const [mostUnpopularChar, setMostUnpopularChar] = useState(undefined);

    const composeResultsHandler = (results) => {
        let newCharObj = {...numberOfEpisodesAccordingToChar};
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

    const getAllEpisodesHandler = () => {
        getAllEpisodes(page)
            .then((res) => {
                composeResultsHandler(res.results);
                const prevPage = page;
                setPage(res.info.next ? prevPage + 1 : 0);
            });
    };

    const getMultipleFilteredCharactersHandler = () => {
        const multipleCharUrl = Object.keys(numberOfEpisodesAccordingToChar).reduce((str, currKey) => {
            return numberOfEpisodesAccordingToChar[currKey] > 1 ? str : str ? str + ',' + currKey : str + currKey;
        }, '');
        getMultipleCharacters(multipleCharUrl)
            .then((res) => {
                const filteredRes = res.filter((r) => r.origin.name === 'Earth (C-137)');
                const randomIdxOfUnpopularChar = Math.floor(Math.random() * filteredRes.length);
                setMostUnpopularChar(filteredRes[randomIdxOfUnpopularChar]);
            });
    };

    useEffect(() => {
        if (page > 0) {
            getAllEpisodesHandler();
        } else {
            getMultipleFilteredCharactersHandler();
        }
    }, [page]);

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
          <h1>The Most unpopular character from Earth C-137</h1>
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
      </div>
    );
};

export default MostUnpopularCharacterTable;
