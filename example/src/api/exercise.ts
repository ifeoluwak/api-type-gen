import {typedApiWrapper} from "realtime-api-types"
import apiHandler from "./apiHandler";

export const ExerciseApi = typedApiWrapper({
  getExercises: () =>
    fetch("https://wger.de/api/v2/exercise").then((res) => res.json()),
   getExerciseById(id: string) {
    return apiHandler.get(`https://wger.de/api/v2/exercise/${id}`);
  },
});
