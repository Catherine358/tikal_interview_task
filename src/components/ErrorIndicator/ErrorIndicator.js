import React from 'react';
import rickAndMorty from '../../assets/rick-and-morty.svg';
import './ErrorIndicator.scss';

const ErrorIndicator = (props) => {
    return (
        <div className="error-indicator">
            <img src={rickAndMorty} alt="Rick and Morty" />
            <span>{ props.error }</span>
        </div>
    );
};

export default ErrorIndicator;
