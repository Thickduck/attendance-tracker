import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@app/course_list"

export interface course_list {
    id: number,
    name: string,
    missed: number,
    cap: number,
};


export async function addData(data: course_list) {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    var jsonData;
    if (existingData != null) jsonData = JSON.parse(existingData);
    else jsonData = [];

    const newData = [...jsonData, data];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
}

export async function readData() {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData != null) return JSON.parse(existingData);
    else return [];
}

export async function addCounter(id: number, n: number) {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const jsonData: course_list[] = data ? JSON.parse(data) : [];
    
    const newData = jsonData.map((course) => {
        if (course.id === id) {
            return { ...course, missed: Math.max(0, course.missed + n) };
        }
        return course;
    });

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
}

export async function deleteData(id: number) {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const jsonData = data ? JSON.parse(data) : [];
    const newData = jsonData.filter((course: course_list) => {return course.id !== id})

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
}

export async function clearData() {
    await AsyncStorage.clear();
}