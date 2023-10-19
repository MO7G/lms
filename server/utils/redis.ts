import {Redis} from 'ioredis';
require('dotenv').config();

// todo will test it when we start the caching 
const redisClient = ()=>{
    if(process.env.REDIS_URL){
        console.log(`Redis connected`);
        return process.env.REDIS_URL
    }

    throw new Error('Redis connection failed');
}

export default redisClient;