"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, parseISO, fromUnixTime } from "date-fns";
import Container from "@/components/Container";
import { convertKelvintoCelcius } from "@/utils/convertKelvintoCelcius";
import WeatherIcon from "@/components/WeatherIcon";
import WeatherDetails from "@/components/WeatherDetails";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "./atoms";
import { useEffect } from "react";

// Root response type for Forecast API
export interface WeatherApiResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastData[];
  city: City;
}

export interface ForecastData {
  dt: number;
  main: MainWeather;
  weather: Weather[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  sys: ForecastSys;
  dt_txt: string;
}

// Coordinates
export interface Coord {
  lon: number;
  lat: number;
}

// Weather array item
export interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

// Main weather details
export interface MainWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

// Wind info
export interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

// Cloud info
export interface Clouds {
  all: number;
}

// Forecast specific sys
export interface ForecastSys {
  pod: string;
}

// City info
export interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity, _] = useAtom(loadingCityAtom);

  const { isLoading, error, data, refetch } = useQuery<WeatherApiResponse>({
    queryKey: ["repoData"],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=36f2bce23b7d5ca33c0e7f933364118a`
      );
      return data;
    }
  });

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const firstData = data?.list[0];

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry: ForecastData) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  // Filtering data to get the first entry of each day
  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry: ForecastData) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });


  if (isLoading || loadingCity)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
      </div>
    );

  if (error) return "An error has occurred";

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen ">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* today data */}
        <section className="space-y-4">
          <div className="space-y-2 ">
            <h2 className="flex gap-1 text-2xl items-center">
              <p> {format(parseISO(firstData?.dt_txt ?? ""), "EEEE")} </p>
              <p className="text-lg"> ({format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")}) </p>
            </h2>
            <Container className=" gap-10 px-6 items-center" >
              {/* temerature */}
              <div className=" flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvintoCelcius(firstData?.main.temp ?? 296.37)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feels Like</span>
                  <span>
                    {convertKelvintoCelcius(firstData?.main.feels_like ?? 0)}°
                  </span>
                </p>
                <p className="text-xs space-x-1">
                  <span>
                    {convertKelvintoCelcius(firstData?.main.temp_min ?? 0)}
                    °↓{" "}
                  </span>
                  <span>
                    {" "}
                    {convertKelvintoCelcius(firstData?.main.temp_max ?? 0)}°↑
                  </span>
                </p>
              </div>
              {/* time  and weather  icon */}
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list.map((d: ForecastData, i: number) => (
                  <div key={i} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                    <p className="whitespace-nowrap">
                      {format(parseISO(d.dt_txt), "h:mm a")}
                    </p>
                    <WeatherIcon iconName={d.weather[0].icon} />
                    <p>{convertKelvintoCelcius(d?.main.temp ?? 0)}°</p>
                  </div>
                ))}
              </div>
            </Container>
          </div>
          <div className=" flex gap-4">
            {/* left */}
            <Container className="w-fit  justify-center flex-col px-4 items-center ">
              <p className=" capitalize text-center">{firstData?.weather[0].description} </p>
              <WeatherIcon iconName={firstData?.weather[0].icon ?? ""} />
            </Container>
            <Container className="bg-yellow-300/80  px-6 gap-4 justify-between overflow-x-auto">
              <WeatherDetails
                visibility={`${(firstData?.visibility ?? 10000) / 1000} km`}
                airPressure={`${firstData?.main.pressure} hPa`}
                humidity={`${firstData?.main.humidity}%`}
                sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702951560), "H:mm")}
                sunset={format(fromUnixTime(data?.city.sunset ?? 1702951560), "H:mm")}
                windSpeed={`${firstData?.wind.speed} km/h`}
              />
            </Container>
            {/* right */}
          </div>
        </section>

        {/* 7 day forecast data */}
        <section className="flex w-full flex-col gap-4  ">
          <p className="text-2xl">7 Day Forecast</p>
          {firstDataForEachDate.map((d: ForecastData | undefined, i: number) => (
            <ForecastWeatherDetail
              key={i}
              description={d?.weather[0].description ?? ""}
              weatherIcon={d?.weather[0].icon ?? "01d"}
              date={format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
              day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
              feels_like={d?.main.feels_like ?? 0}
              temp={d?.main.temp ?? 0}
              temp_max={d?.main.temp_max ?? 0}
              temp_min={d?.main.temp_min ?? 0}
              airPressure={`${d?.main.pressure} hPa`}
              humidity={`${d?.main.humidity}%`}
              sunrise={format(
                fromUnixTime(data?.city.sunrise ?? 1702517657),
                "H:mm"
              )}
              sunset={format(
                fromUnixTime(data?.city.sunset ?? 1702556762),
                "H:mm"
              )}
              visibility={`${(d?.visibility ?? 10000) / 1000} km`}
              windSpeed={`${d?.wind.speed ?? 0} km/h`}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
