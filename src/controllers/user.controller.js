import axios from 'axios';

export const userInfo = async (req, res) => {
    try {
        // Retrieve the visitor's name from the query parameters
        const userName = req.query.visitor_name;
        if (!userName) {
            return res.status(400).json({ message: 'Visitor name is required' });
        }

        // Get the client's IP address from headers or socket, defaulting to localhost
        let clientsIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

        // Handle multiple IPs in the 'x-forwarded-for' header
        if (clientsIp.includes(',')) {
            clientsIp = clientsIp.split(',')[0].trim();
        }

        // Handle IPv6-mapped IPv4 addresses
        if (clientsIp.includes('::ffff:')) {
            clientsIp = clientsIp.split(':').pop();
        }

        // Make a request to the IP geolocation service to get location data
        const geoResponse = await axios.get(`https://ipapi.co/${clientsIp}/json/`);
        if (geoResponse.data.error) throw new Error('Unable to geolocate IP address.');

        const { latitude, longitude, city, region, country_name } = geoResponse.data;

        // Retrieve the Weather API key from environment variables
        const weatherApiKey = process.env.WEATHER_APP_API_KEY;
        if (!weatherApiKey) throw new Error('Weather API key is not set.');

        // Make a request to the weather service to get weather data
        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                lat: latitude,
                lon: longitude,
                appid: weatherApiKey,
                units: 'metric'
            }
        });

        const weatherData = weatherResponse.data;

        // Send back the gathered information as a JSON response
        return res.status(200).json({
            clientsIp,
            visitorName: userName,
            location: {
                city,
                region,
                country: country_name,
                latitude,
                longitude
            },
            weather: {
                temperature: weatherData.main.temp,
                description: weatherData.weather[0].description
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};
