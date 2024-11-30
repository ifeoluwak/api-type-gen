# Api-Type-Gen

The aim of this project is to take the pain away from trying to add types from your api responses.

> **With this library, as you get responses from an api, it generates the type for you and saves it to your project**
>
> **It also imports the new type and sets it as the return type of your api call. How awesome is that!**

Just import the helper function and start the server. Thats all. You can then go on with your normal development flow.

*This setup is meant only for development and not for production! You should not deploy this into your production pipeline.*

This library was inspired by an old project I stumbled upon, called [MakeTypes](https://github.com/jvilk/MakeTypes)

## Installation

To get started, simply run:

```bash
npm install api-type-gen
```

## Configuration

There are some configs you need to set.  Go to your `package.json` and add the following:

```json
"api-type-gen": {
    "objectType": "type",
    "typePath": "src/types",
    "apiPath": "src/apis",
    "fetchType": "axios"
  }
```
The shape of the config is:

```ts
export type Config = {
  objectType: 'interface' | 'type'; // whether you want to generate interfaces or types 
  fetchType: 'fetch' | 'axios'; // how you fetch data, fetch or axios
  typePath: string; // the path to where you want to save generated types
  apiPath: string; // the path to where your api methods exist
};
```

### Start Service

To start the type generator service, run: `npx api-type-gen --init`.

## Code Sample & Usage

Wrap your apis in an object and wrap the object with `typedApiWrapper`.

You should make your api methods pure, simply return the api call.

You can use property assignments or methods or both

> Please note that when you're done developing, remove `typedApiWrapper` from this file completely.

```js
// exercise.ts api file

import {typedApiWrapper} from "api-type-gen"
import axios from 'axios'

export const ExerciseApi = typedApiWrapper({
  // with fetch, property assignment style
  getExercises: () => fetch("https://example.com"),
    // with axios, method style
   getExerciseById(id: string) {
    return axios.get(`https://example.com/${id}`);
  },
  // api post method
  postExercise(data: any) {
    return axios.post(`https://example.com`, data)
  }
});
```

When type generation is successful, the file would be automatically updated to something like this:

```js
// updated exercise.ts api file

import {typedApiWrapper} from "api-type-gen"
import axios from 'axios'
import { GetExercises } from "../types/getExercises";
import { GetExerciseById } from "../types/getExerciseById";
import { PostExercise } from "../types/postExercise";

export const ExerciseApi = typedApiWrapper({
  // with fetch, property assignment style
  getExercises: (): Promise<GetExercises> => fetch("https://example-api.com"),
    // with axios, method style
   getExerciseById(id: string): Promise<{ data: GetExerciseById }> {
    return axios.get(`https://example-api.com/${id}`);
  },
  // api post method
  postExercise(data: any): Promise<{ data: PostExercise }> {
    return axios.post(`https://example-api.com`, data)
  }
});
```

> Note the difference in structure of return type from fetch and axios.
`axios` returns a `data: Type`.

## Naming Convention

Note the naming convention.

The name of the type file is the same as the name of the **api method called**.

The name of the type itself is the same as the name of the api method but in **pascal case**.

## Limitations

Cannot generate enums. This would require comparisons of each of the response fields from the same api call.

Cannot extend type from different type files. If the response from a call contains object that is similar to another type in another file, it cannot extend it. A new type will be generated in the new file.

Cannot give custom file names or type names. File name and type name is solely based on the name of the api method.

This library only serves to help you get started quickly and reduce time spent adding types to api calls. It does not solve all your type problems.

## Contributions

Please feel free to contribute and improve this library
