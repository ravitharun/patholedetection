// import React, { useEffect, useState } from 'react'
// import axios from "axios"
// import Loader from './Loader'

// function Waether({ lat }) {

//     const [weatherLdin, setweatherldinghg] = useState(false)
//     const [Weather, setWeather] = useState(null)

//     useEffect(() => {
//         const getWaether = async () => {
//             const key = import.meta.env.VITE_WEATHER_API_KEY

//             try {
//                 setweatherldinghg(true)

//                 const res = await axios.get(
//                     `https://api.openweathermap.org/data/2.5/weather?lat=${lat.lat.toFixed(6)}&lon=${lat.lng.toFixed(6)}&appid=${key}&units=metric`
//                 )

//                 console.log(res.data, "data")
//                 setWeather(res.data)

//             } catch (error) {
//                 console.log("error from weather", error)
//             } finally {
//                 setweatherldinghg(false)
//             }
//         }

//         if (lat?.lat && lat?.lng) {
//             getWaether()
//         }
//     }, [lat])

//     const formatTime = (unix) => {
//         return new Date(unix * 1000).toLocaleTimeString()
//     }

//     const styles = {
//         page: {
//             minHeight: "100vh",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             padding: "20px",
//             fontFamily: "sans-serif",
//         },
//         card: {
//             width: "100%",
//             maxWidth: "500px",
//             borderRadius: "20px",
//             padding: "20px",
//             boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
//             border: "1px solid #eee",
//         },
//         header: {
//             textAlign: "center",
//             marginBottom: "20px",
//         },
//         city: {
//             fontSize: "22px",
//             fontWeight: "bold",
//         },
//         temp: {
//             fontSize: "42px",
//             fontWeight: "bold",
//             margin: "10px 0",
//         },
//         desc: {
//             textTransform: "capitalize",
//             color: "#555",
//         },
//         section: {
//             marginTop: "20px",
//         },
//         sectionTitle: {
//             fontSize: "14px",
//             fontWeight: "600",
//             marginBottom: "10px",
//             color: "#777",
//         },
//         grid: {
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "10px",
//         },
//         box: {
//             padding: "10px",
//             borderRadius: "10px",
//             border: "1px solid #eee",
//             fontSize: "14px",
//         },
//     }

//     return (
//         <>
//             {weatherLdin && <Loader loadername="Fetching real-time weather..." />}

//             <div style={styles.page}>

//                 {/* Loader */}
//                 {weatherLdin && <Loader loadername="Fetching weather..." />}

//                 {/* Data UI */}
//                 {!weatherLdin && Weather && (
//                     <div style={styles.card}>

//                         {/* Header */}
//                         <div style={styles.header}>
//                             <div style={styles.city}>
//                                 {Weather?.name}, {Weather?.sys?.country}
//                             </div>

//                             <div style={styles.temp}>
//                                 {Math.round(Weather?.main?.temp)}°C
//                             </div>

//                             <div style={styles.desc}>
//                                 {Weather?.weather?.[0]?.description}
//                             </div>
//                         </div>

//                         {/* Temperature */}
//                         <div style={styles.section}>
//                             <div style={styles.sectionTitle}>Temperature</div>
//                             <div style={styles.grid}>
//                                 <div style={styles.box}>Feels: {Weather?.main?.feels_like}°C</div>
//                                 <div style={styles.box}>Min: {Weather?.main?.temp_min}°C</div>
//                                 <div style={styles.box}>Max: {Weather?.main?.temp_max}°C</div>
//                                 <div style={styles.box}>Pressure: {Weather?.main?.pressure}</div>
//                             </div>
//                         </div>

//                         {/* Atmosphere */}
//                         <div style={styles.section}>
//                             <div style={styles.sectionTitle}>Atmosphere</div>
//                             <div style={styles.grid}>
//                                 <div style={styles.box}>Humidity: {Weather?.main?.humidity}%</div>
//                                 <div style={styles.box}>Visibility: {Weather?.visibility} m</div>
//                                 <div style={styles.box}>Sea Level: {Weather?.main?.sea_level}</div>
//                                 <div style={styles.box}>Ground: {Weather?.main?.grnd_level}</div>
//                             </div>
//                         </div>

//                         {/* Wind & Clouds */}
//                         <div style={styles.section}>
//                             <div style={styles.sectionTitle}>Wind & Clouds</div>
//                             <div style={styles.grid}>
//                                 <div style={styles.box}>Wind: {Weather?.wind?.speed} m/s</div>
//                                 <div style={styles.box}>Direction: {Weather?.wind?.deg}°</div>
//                                 <div style={styles.box}>Clouds: {Weather?.clouds?.all}%</div>
//                                 <div style={styles.box}>Condition: {Weather?.weather?.[0]?.main}</div>
//                             </div>
//                         </div>

//                         {/* Sun */}
//                         <div style={styles.section}>
//                             <div style={styles.sectionTitle}>Sun</div>
//                             <div style={styles.grid}>
//                                 <div style={styles.box}>
//                                     Sunrise: {formatTime(Weather?.sys?.sunrise)}
//                                 </div>
//                                 <div style={styles.box}>
//                                     Sunset: {formatTime(Weather?.sys?.sunset)}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Location */}
//                         <div style={styles.section}>
//                             <div style={styles.sectionTitle}>Location</div>
//                             <div style={styles.grid}>
//                                 <div style={styles.box}>Lat: {Weather?.coord?.lat}</div>
//                                 <div style={styles.box}>Lon: {Weather?.coord?.lon}</div>
//                                 <div style={styles.box}>Timezone: {Weather?.timezone}</div>
//                             </div>
//                         </div>

//                     </div>
//                 )}

//             </div>
//         </>
//     )
// }

// export default Waether
import React, { useEffect, useState } from 'react'
import axios from "axios"
import Loader from './Loader'

function Waether({ lat }) {
    console.log(lat, 'latlatlat')

    const [loading, setLoading] = useState(false)
    const [weather, setWeather] = useState(null)
    const latitude = Number(lat?.lat)
    const longitude = Number(lat?.lng)
    useEffect(() => {
        const getWeather = async () => {
            const key = import.meta.env.VITE_WEATHER_API_KEY

            try {
                setLoading(true)

                const res = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
                )
// console.log((res),"resx")
                setWeather(res.data)

            } catch (err) {
                console.log("error", err)
            } finally {
                setLoading(false)
            }
        }

        if (lat?.lat && lat?.lng) {
            getWeather()
        }
    }, [lat])

    const formatTime = (unix) =>
        new Date(unix * 1000).toLocaleTimeString()

    const styles = {
        wrapper: {
            display: "flex",
            justifyContent: "center",
            padding: "10px"
        },

        card: {
            width: "100%",
            maxWidth: "320px",
            border: "1px solid #eaeaea",
            borderRadius: "14px",
            padding: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)", // very light shadow
            background: "#fff", // clean white
            fontFamily: "sans-serif",
        },

        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
        },

        city: {
            fontSize: "14px",
            fontWeight: "600",
            color: "#222"
        },

        temp: {
            fontSize: "24px",
            fontWeight: "700",
            color: "#111"
        },

        desc: {
            fontSize: "12px",
            color: "#777",
            textTransform: "capitalize",
            marginBottom: "8px"
        },

        row: {
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            padding: "6px 0",
            borderBottom: "1px solid #f5f5f5"
        },

        label: {
            color: "#999"
        },

        value: {
            fontWeight: "500",
            color: "#333"
        }
    }

    return (
        <div style={styles.wrapper}>

            {loading && <Loader loadername="Fetching real-time weather..." />}
            {loading ? <>


                <div> data Loading....</div>
            </>:""}
            {/* {weatherLdin && <Loader loadername="Fetching real-time weather..." />} */}

            {!loading && weather && (
                <div style={styles.card}>

                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.city}>
                            {weather.name}
                        </div>
                        <div style={styles.temp}>
                            {Math.round(weather.main.temp)}°C
                        </div>
                    </div>

                    <div style={styles.desc}>
                        {weather.weather[0].description}
                    </div>

                    {/* FLEX ROW DATA */}
                    <div style={styles.row}>
                        <span style={styles.label}>Feels</span>
                        <span style={styles.value}>{weather.main.feels_like}°C</span>
                    </div>

                    <div style={styles.row}>
                        <span style={styles.label}>Humidity</span>
                        <span style={styles.value}>{weather.main.humidity}%</span>
                    </div>

                    <div style={styles.row}>
                        <span style={styles.label}>Wind</span>
                        <span style={styles.value}>{weather.wind.speed} m/s</span>
                    </div>

                    <div style={styles.row}>
                        <span style={styles.label}>Clouds</span>
                        <span style={styles.value}>{weather.clouds.all}%</span>
                    </div>

                    <div style={styles.row}>
                        <span style={styles.label}>Pressure</span>
                        <span style={styles.value}>{weather.main.pressure}</span>
                    </div>

                    <div style={styles.row}>
                        <span style={styles.label}>Visibility</span>
                        <span style={styles.value}>{weather.visibility}</span>
                    </div>

                    <div style={styles.row}>
                        <span style={styles.label}>Sunrise</span>
                        <span style={styles.value}>
                            {formatTime(weather.sys.sunrise)}
                        </span>
                    </div>

                    <div style={styles.row}>
                        <span style={styles.label}>Sunset</span>
                        <span style={styles.value}>
                            {formatTime(weather.sys.sunset)}
                        </span>
                    </div>

                </div>
            )}

        </div>
    )
}

export default Waether