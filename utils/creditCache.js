const cache = {};

exports.increment = (apiKey) => {

    if (!cache[apiKey]) {
        cache[apiKey] = 0;
    }

    cache[apiKey]++;

    return cache[apiKey];
};

exports.reset = (apiKey) => {
    cache[apiKey] = 0;
};