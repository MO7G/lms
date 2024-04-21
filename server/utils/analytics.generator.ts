import {Document, Model} from "mongoose"


interface MonthData{
    month: string;
    count: number;
}

export const generateLast12MonthData = async <T extends Document>(model: Model<T>): Promise<{ last12Month: MonthData[] }> => {
    //Initializes an empty array last12Month to store the data for the last 12 months.
    const last12Month : MonthData[] = [];
    // brings the current date
    const currentDate = new Date();
    //Increments the day of the month by 1 to ensure that we're considering dates in the future (since new Date() creates a date representing the current moment).
    currentDate.setDate(currentDate.getDate() + 1 );


    for (let i = 11 ;i  >=0 ; i--){
        // Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()-i-28);
        const endDate = new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()-i-28);

        // Calculates the end date of the current month by subtracting i days from the current date.
        const startDate = new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()-28);  

        console.log("this is the start date " , startDate)
        console.log("this is the end of the date" , endDate)

        const monthYear = endDate.toLocaleString("default",{day:"numeric",month:"short",year:"numeric"})
        const count = await model.countDocuments({
            createdAt:{
                $gte: startDate,
                $lt: endDate,
            },
        })
        last12Month.push({month: monthYear , count})
    }
    return {last12Month}
};