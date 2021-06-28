import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import dayjs from 'dayjs'
import { ReactComponent as DayCloudyIcon } from './images/day-cloudy.svg' 
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg'
import { ReactComponent as RainIcon } from './images/rain.svg'
import { ReactComponent as RefreshIcon } from './images/refresh.svg'
import { ReactComponent as LoadingIcon } from './images/loading.svg'
import { ThemeProvider } from '@emotion/react'

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
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  background-color: ${({ theme }) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
`

const Location = styled.div` 
  font-size: 28px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px
`

const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: ${({ theme }) => theme.temperatureColor};
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const DayCloudy = styled(DayCloudyIcon)`
  flex-basis: 30%;
`;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};
  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    animation: rotate infinite 1.5s linear;
    animation-duration: ${({ isLoading }) => (isLoading ? '1.5s' : '0s')}
  }
`;

const AUTHORIZATION_KEY = 'CWB-9C2E7558-9E72-48F6-9F55-9A8F54C01CEA'
const LOCATION_NAME = '臺北'

function App() {  
  const [currentTheme, setCurrentTheme] = useState('light')

  const [currentWeather, setCurrentWeather] = useState({
    locationName: '臺北市',
    description: '多雲時晴',
    windSpeed: 3.6,
    temperature: 32.1,
    rainPossibility: 60,
    observationTime: '2020-12-12 22:10:00',
    isLoading: true,
  })

  const fetchCurrentWeather = async() => {
    setCurrentWeather((prevState) => ({
      ...prevState,
      isLoading: true,
    }))

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
    
    setCurrentWeather({
      ...currentWeather,
      locationName: locationData.locationName,      
      windSpeed: weatherElements.WDSD,
      temperature: weatherElements.TEMP,      
      observationTime: locationData.time.obsTime,
      isLoading: false,
    })
  }

  useEffect(() => {    
    fetchCurrentWeather()
  }, [])

  const {
    observationTime,
    locationName,
    description,
    windSpeed,
    temperature,
    rainPossibility,
    isLoading,
  } = currentWeather;

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>      
         {console.log('render, isLoading: ', isLoading)}  
        <WeatherCard>
          <Location>{ locationName }</Location>

          <Description>{ description }</Description>

          <CurrentWeather>
            <Temperature>
              { Math.round(temperature) } <Celsius>°C</Celsius>
            </Temperature>

            <DayCloudy />
          </CurrentWeather>
          
          <AirFlow>
            <AirFlowIcon /> { windSpeed } m/h         
          </AirFlow>

          <Rain> 
            <RainIcon /> { rainPossibility }% 
          </Rain>

          <Refresh 
            onClick={ fetchCurrentWeather }
            isLoading={ isLoading }
          > 
            最後觀測時間：
            { new Intl.DateTimeFormat('zh-TW', {
              hour: 'numeric',
              minute: 'numeric'
            }).format(dayjs(observationTime)) }{' '}            
            { isLoading ? <LoadingIcon /> : <RefreshIcon /> }
          </Refresh>

        </WeatherCard>
      </Container>
    </ThemeProvider>
  );
}

export default App;
