//function to get current date as string
export default function getCurrentDate() : string {
    const now : Date = new Date();
    const date : number = now.getDate();
    const month : number = now.getMonth();
    const year : number = now.getFullYear();

    return `${date}-${month}-${year}`;
}
