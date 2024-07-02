import axios from 'axios';

export const userInfo = async (req, res) => {
    try {
        const userName = req.query.visitor_name;
        if (!userName) {
            return res.status(400).json({ message: 'Visitor name is required' });
        }

  
        // let clientsIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '197.210.203.2'; 
        const forwardedIps = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',') : [];
        const clientIp = forwardedIps[0] || req.socket.remoteAddress || '197.210.203.2' ;
        
        const geoResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`);
        if (geoResponse.data.error) throw new Error('Unable to locate IP address provided.');

        const { latitude, longitude, city, region, country_name } = geoResponse.data;

        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                lat: latitude,
                lon: longitude,
                appid: process.env.WEATHER_APP_API_KEY, 
                units: 'metric'
            }
        });

        const weatherData = weatherResponse.data;

        // Handle IPv6-mapped IPv4 addresses
        if (clientIp.includes('::ffff:')) {
            clientIp = clientIp.split(':').pop();
        }

 
        return res.status(200).json({
            clientIp,
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
        res.status(500).json({ message: error.message });
    }
};
