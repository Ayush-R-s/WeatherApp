/**@format */

export function convertKelvintoCelcius(kelvin: number): number {
    const celcius = kelvin - 273.15;
    return Math.floor(celcius);
}