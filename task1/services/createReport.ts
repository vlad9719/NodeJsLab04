import axios from "axios";

const NUMBER_OF_RECORDS = 10000;
const NUMBER_OF_REQUESTS = 1000;
const URL = `http://localhost:8080/api/contracts/${NUMBER_OF_RECORDS}`;

//function for creating average request time report
export default async function createReport () : Promise<object> {
    let requestTimeSum : number = 0;

    const promise = new Promise<object>(async resolve => {
        for (let i = 0; i < NUMBER_OF_REQUESTS; i++) {
            const beforeRequest = Date.now();
            const afterRequest = await makeRequest();
            console.log('Request ' + i + 'sent');
            const requestTime = afterRequest - beforeRequest;
            requestTimeSum += requestTime;
        }

        const avgTime = requestTimeSum / NUMBER_OF_REQUESTS;

        resolve({
            'averageRequestTime (ms)': avgTime
        });
    });

    return await promise;
};

async function makeRequest() : Promise<number> {
    return new Promise<number>(resolve => {
        axios.get(URL)
            .then(() => {
                const now = Date.now();
                resolve(now);
            });
    });
}