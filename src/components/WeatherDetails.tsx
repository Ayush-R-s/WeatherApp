/** @format */

import React from "react";
import { LuEye, LuDroplets, LuWind, LuGauge, LuSunrise, LuSunset } from "react-icons/lu";

export interface WeatherDetailProps {
    visibility: string;
    humidity: string;
    windSpeed: string;
    airPressure: string;
    sunrise: string;
    sunset: string;
}

export default function WeatherDetails(props: WeatherDetailProps) {
    const {
        visibility = "25km",
        humidity = "61%",
        windSpeed = "7 km/h",
        airPressure = "1012 hPa",
        sunrise = "6:48",
        sunset = "18:03"
    } = props;

    return (
        <>
            <SingleWeatherDetail
                icon={<LuEye />}
                label="Visibility"
                value={visibility}
            />
            <SingleWeatherDetail
                icon={<LuDroplets />}
                label="Humidity"
                value={humidity}
            />
            <SingleWeatherDetail
                icon={<LuWind />}
                label="Wind speed"
                value={windSpeed}
            />
            <SingleWeatherDetail
                icon={<LuGauge />}
                label="Air Pressure"
                value={airPressure}
            />
            <SingleWeatherDetail
                icon={<LuSunrise />}
                label="Sunrise"
                value={sunrise}
            />
            <SingleWeatherDetail
                icon={<LuSunset />}
                label="Sunset"
                value={sunset}
            />
        </>
    );
}

export interface SingleWeatherDetailProps {
    label: string;
    icon: React.ReactNode;
    value: string;
}

function SingleWeatherDetail(props: SingleWeatherDetailProps) {
    return (
        <div className="flex flex-col justify-between gap-2 items-center text-xs font-semibold text-black/80">
            <p className="whitespace-nowrap">{props.label}</p>
            <div className="text-3xl">{props.icon}</div>
            <p>{props.value}</p>
        </div>
    );
}
