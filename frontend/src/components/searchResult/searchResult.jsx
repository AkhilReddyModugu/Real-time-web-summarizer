import React from 'react';
import Markdown from 'react-markdown';
import './styles.css';

export const SearchResult = (props) => {
    return (
        <div>
            <div id='searchResult' className='mt-4'>
                <Markdown>{props.content}</Markdown>
            </div>
        </div>
    );
}