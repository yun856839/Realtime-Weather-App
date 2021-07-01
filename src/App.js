import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from '@emotion/styled'
import { ThemeProvider } from '@emotion/react'
import { getMoment } from './utils/helpers'
import WeatherCard from './views/WeatherCard'

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
const LOCATION_NAME = '臺北'
const LOCATION_NAME_FORECAST = '臺北市'

function App() {  
  const [currentTheme, setCurrentTheme] = useState('light')

  const [weatherElement, setWeatherElement] = useState({
    locationName: '',
    description: '',
    windSpeed: 0,
    temperature: 0,
    rainPossibility: 0,
    observationTime: new Date(),
    weatherCode: 0,
    comfortability: '',
    isLoading: true,
  })
  // TODO
  const moment = useMemo(() => getMoment(LOCATION_NAME_FORECAST), [])

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark')
  }, [moment])

  const fetchCurrentWeather = async() => {    
    const response = await fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME}`
    )
    const data = await response.json()    
    const locationData = data.records.location[0]

    const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
      if (['WDSD', 'TEMP'].includes(item.elementName)) {
        neededElements[item.elementName] = item.elementValue
      }  
      return neededElements
    }, {})
    
    return {      
      locationName: locationData.locationName,      
      windSpeed: weatherElements.WDSD,
      temperature: weatherElements.TEMP,      
      observationTime: locationData.time.obsTime      
    }
  }

  const fetchWeatherForecast = async() => {
    const response = await fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME_FORECAST}
      `)
    const data = await response.json()  
    const locationData = data.records.location[0]
    const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
      if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
        neededElements[item.elementName] = item.time[0].parameter
      }
      return neededElements
    }, {})

    return {      
      description: weatherElements.Wx.parameterName,
      weatherCode: weatherElements.Wx.parameterValue,
      rainPossibility: weatherElements.PoP.parameterName,
      comfortability: weatherElements.CI.parameterName
    }
  }

  const fetchData = useCallback(async() => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }))

    const [currentWeather, weatherForecast] = await Promise.all([fetchCurrentWeather(), fetchWeatherForecast()])
    
    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false
    })
  }, [])

  useEffect(() => {        
    fetchData()
  }, [fetchData])

  

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>                
        <WeatherCard
          weatherElement={weatherElement}
          moment={moment}
          fetchData={fetchData}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
