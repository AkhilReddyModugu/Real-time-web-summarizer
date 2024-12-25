import React from 'react';
import Markdown from 'react-markdown';
import './styles.css';

export const SearchResult = (props) => {
    return (
        <div>
            <div id='searchResult'>
                <Markdown>{props.content}</Markdown>
            </div>
        </div>
    );
}