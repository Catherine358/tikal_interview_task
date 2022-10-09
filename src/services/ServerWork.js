import { BASE_URL } from '../constants/Constants';

export const getAllEpisodes = (page) => {
    return fetch(`${BASE_URL}/episode?page=${page}`)
        .then((response) => {
            if (response.status !== 200) {
                throw new Error('Could not fetch');
            }
            return response.json();
        })
};

export const getMultipleCharacters = (charIdsStr) => {
    return fetch(`${BASE_URL}/character/${charIdsStr}`)
        .then((response) => {
            if (response.status !== 200) {
                throw new Error('Could not fetch');
            }
            return response.json();
        });
};

export const getCharacterByName = (charName) => {
    return fetch(`${BASE_URL}/character/?name=${encodeURI(charName)}`)
        .then((response) => {
            if (response.status !== 200) {
                throw new Error('Could not fetch');
            }
            return response.json();
        });
};
