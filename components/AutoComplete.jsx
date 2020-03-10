import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import 'semantic-ui-css/semantic.min.css';
import { Search, Container } from 'semantic-ui-react';
import axios from "axios";
import '../style/app.css';

const API_KEY = 'e4279a65';
const API_URL = 'http://www.omdbapi.com/';
const SELECTION_ALLOWED = 5;

const AutoComplete = () => {
	const refElement = useRef(null);

	const [currentValue, setCurrentValue] = useState('');
	const [searchResult, setSearchResult] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedData, setSelectedData] = useState([]);
	const [errorMsg, setErrorMsg] = useState('');
	const [opened, setOpened] = useState(false);
	
	useEffect(() => {
		function handleWindowClick(event) {
			if (refElement.current && !refElement.current.contains(event.target)) {
				setOpened(false);
			}
		}

		window.addEventListener('click', handleWindowClick, true);
		return () => window.removeEventListener('click', handleWindowClick, true );
  }, []);
	
	const handleFocus = () => { currentValue.trim() !== '' ? setOpened(true) : setOpened(false)}
	
	const resultRenderer = ({ title }) => <div className="resultList">{title}</div>;
		
	const handleResultSelect = (e, data) => {
		if(selectedData.length < SELECTION_ALLOWED && !selectedData.includes(data.result.title)) { 
			setSelectedData(prevState => {
				return [...prevState, data.result.title];
			});
		}
	}
	
	const removeRecord = (val) => {
		const filterData = selectedData.filter(e => e!== val);
		setSelectedData(filterData);
	};
	
	const selectedPills = () => {
		const data = selectedData.map( (val, index) => {
			return (
				<span key={index} className="selected">
					{val}
					<span className="delete" onClick={()=> removeRecord(val)}>X</span>
				</span>
			)}
		);
		return data;
	}

	const handleSearchChange = (e, { value }) => {
		setCurrentValue(value);
		setErrorMsg('');
		
		if(value.trim() === '') {
			setOpened(false);
			setSearchResult([]);
		} else {
			setLoading(true);
			axios.get(`${API_URL}?apikey=${API_KEY}&s=${value}`).then((response) => {
				let list= [];
				if(response.data.Response === "True") {
					list = response.data.Search.map( (val, index) => ({'title': val.Title, id: index}) );
				} else if(response.data.Response === "False") {
					setErrorMsg(response.data.Error);
				}
				setSearchResult(list)
				setLoading(false);
				setOpened(true);
			});
		}
  };

	return (
		<div id="main" ref={refElement}>
			<Search 
				loading={loading}
				onResultSelect={handleResultSelect}
				results={searchResult}
				onSearchChange={handleSearchChange}
				resultRenderer={resultRenderer}
				value={currentValue}
				className="search"
				noResultsMessage={errorMsg !== '' ? errorMsg : 'No results found'}
				open={opened}
				onFocus={handleFocus}
			/>
			<Container style={{paddingTop: '20px'}}>
				 { selectedPills()}
			</Container>
		</div>
	)
};

export default AutoComplete;
