import React from 'react';
import './ErrorIndicator.scss';

const ErrorIndicator = (props) => {
    return <div className="error-indicator">{ props.error }</div>
};

export default ErrorIndicator;
