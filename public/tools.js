async function getDateAndTime() {
    const date_and_time = new Date();
    return { date_and_time: date_and_time };
}

async function getWeather(location) {
    const apiKey = '9f341ed3065ff2549bede5ef5da25902';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return { weather: data };
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}

async function generateImage(query) {
    query = btoa(query);
    const url = `https://api.totob12.com/generate-image?prompt=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return { image: data.result };
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}

async function queryWolframAlpha(query) {
    query = btoa(query);
    const url = `https://api.totob12.com/wolframalpha?query=${encodeURIComponent(query)}`;
    console.log(url);
    try {
        const response = await fetch(url);
        const data = await response.text();
        return { response: data };
    } catch (error) {
        console.error('Error querying Wolfram Alpha:', error);
        return { error: error };
    }
}

async function searchInternet(query) {
    query = btoa(query);
    const url = `https://api.totob12.com/search/search?q=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}

async function searchImages(query) {
    query = btoa(query);
    const url = `https://api.totob12.com/search/images?q=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        let data = await response.json();
        data.images = data.images.slice(0, 10);
        return data;
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}

async function lookWebpage(link) {
    link = btoa(link);
    const url = `https://api.totob12.com/search/webpage?url=${encodeURIComponent(link)}`;
    try {
        const response = await fetch(url);
        let data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}

export const functions = {
    getDateAndTime: () => {
        return getDateAndTime()
    },
    getWeather: ({ location }) => {
        return getWeather(location);
    },
    generateImage: ({ query }) => {
        return generateImage(query);
    },
    queryWolframAlpha: ({ query }) => {
        return queryWolframAlpha(query);
    },
    searchInternet: ({ query }) => {
        return searchInternet(query);
    },
    searchImages: ({ query }) => {
        return searchImages(query);
    },
    lookWebpage: ({ link }) => {
        return lookWebpage(link);
    },
};

export const tools = [
    {
        name: "getDateAndTime",
        description: "Get the current date and time",
    },
    {
        name: "getWeather",
        parameters: {
            type: "OBJECT",
            description: "Get the current weather for a precise location, in metric units",
            properties: {
                location: {
                    type: "STRING",
                    description: "The precise location/city to get the weather for, in the simplest format possible (e.g., 'washington dc', 'paris'). Do not use commas or other special characters.",
                },
            },
            required: ["location"],
        },
    },
    {
        name: "generateImage",
        parameters: {
            type: "OBJECT",
            description: "Generate an image with the given text using AI",
            properties: {
                query: {
                    type: "STRING",
                    description: "The text to generate the image with",
                },
            },
            required: ["query"],
        },
    },
    {
        name: "queryWolframAlpha",
        parameters: {
            type: "OBJECT",
            description: "Query Wolfram Alpha for information, math, statistics. To be used over the internet",
            properties: {
                query: {
                    type: "STRING",
                    description: "The query to send to Wolfram Alpha",
                },
            },
            required: ["query"],
        },
    },
    {
        name: "searchInternet",
        parameters: {
            type: "OBJECT",
            description: "Search the internet for information",
            properties: {
                query: {
                    type: "STRING",
                    description: "The query to search the internet for",
                },
            },
            required: ["query"],
        },
    },
    {
        name: "searchImages",
        parameters: {
            type: "OBJECT",
            description: "Search the internet for images",
            properties: {
                query: {
                    type: "STRING",
                    description: "The query to search the internet for images",
                },
            },
            required: ["query"],
        },
    },
    {
        name: "lookWebpage",
        parameters: {
            type: "OBJECT",
            description: "Look up a webpage; gets you the text content of the webpage",
            properties: {
                link: {
                    type: "STRING",
                    description: "The URL of the webpage to look up",
                },
            },
            required: ["link"],
        },
    },
];