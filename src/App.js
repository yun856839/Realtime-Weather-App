import React, { useState, useEffect, useMemo } from 'react'
import styled from '@emotion/styled'
import { ThemeProvider } from '@emotion/react'
import { getMoment, findLocations } from './utils/helpers'
import WeatherCard from './views/WeatherCard'
import useWeatherAPI from './hooks/useWeatherAPI'
import WeatherSetting from './views/WeatherSetting'

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const AUTHORIZATION_KEY = 'CWB-9C2E7558-9E72-48F6-9F55-9A8F54C01CEA'

function App() {  
  const storageCity = localStorage.getItem('cityName') || '臺北市'

  const [currentCity, setCurrentCity] = useState(storageCity)
  const currentLocation = useMemo(() => findLocations(currentCity), [currentCity]) 
  const { cityName, locationName, sunriseCityName } = currentLocation
  const handleCurrentCityChange = (currentCity) => {
    setCurrentCity(currentCity)
  }

  const [currentPage, setCurrentPage] = useState('WeatherCard')
  const handleCurrentPageChange = (currentPage) => {
    setCurrentPage(currentPage)
  }

  const [currentTheme, setCurrentTheme] = useState('light')

  const [weatherElement, fetchData] = useWeatherAPI({
    locationName,
    cityName,
    authorizationKey: AUTHORIZATION_KEY,
  })
  
  const moment = useMemo(() => getMoment(sunriseCityName), [sunriseCityName])

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark')
  }, [moment])
 
  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>  \
        {currentPage === 'WeatherCard' && (               
          <WeatherCard
            cityName={cityName}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            handleCurrentPageChange={handleCurrentPageChange}
          />
        )}
        {currentPage === 'WeatherSetting' && (
          <WeatherSetting 
            cityName={cityName}
            handleCurrentCityChange={handleCurrentCityChange}
            handleCurrentPageChange={handleCurrentPageChange}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
