# realtime-api-types

The aim of this project is to take the pain away from trying to add types from your api responses.

> **With this library, as you get responses from an api, it generates the type for you and saves it to your project, in real time.**
>
> **It also imports the new type and sets it as the return type of your api call. How awesome is that!**

Just import the helper function and start the server. Thats all. You can then go on with your normal development flow.

***This setup is meant only for development and not for production! You should not deploy this into your production pipeline.***

This library was inspired by an old project I stumbled upon, called [MakeTypes](https://github.com/jvilk/MakeTypes).

## Installation

To get started, simply run:

```bash
npm install realtime-api-types
```

## Configuration

There are some configs you need to set.  Go to your `package.json` and add the following:

```json
"realtime-api-types": {
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

To start the type generator service, run: `npx realtime-api-types --init`.

## Code Sample & Usage

Wrap your apis in an object and wrap the object with `typedApiWrapper`.

You should make your api methods pure, simply return the api call.

You can use property assignments or methods or both.

> Please note that when you're done developing, remove `typedApiWrapper` from this file completely.

```js
// Example 

// src/apis/exercise.ts api file

import {typedApiWrapper} from "realtime-api-types"
import axios from 'axios'

export const ExerciseApi = typedApiWrapper({
  // with fetch, property assignment style
  getExercises: () => fetch("https://example-api.com").then((res) => res.json()),
    // with axios, method style
   getExerciseById(id: string) {
    return axios.get(`https://example-api.com/${id}`);
  },
  // api post method
  postExercise(data: any) {
    return axios.post(`https://example-api.com`, data)
  }
});


// src/App.tsx file

useEffect(() => {
   ExerciseApi.getExercises()
}, [])

```
With this setup, whenever an api is called at any point in time, the service will intercept and try to generate type from the response.

When type generation is successful, the example file above would be automatically updated to something like this:

```js
// updated exercise.ts api file

import {typedApiWrapper} from "realtime-api-types"
import axios from 'axios'
import { GetExercises } from "../types/getExercises";
import { GetExerciseById } from "../types/getExerciseById";
import { PostExercise } from "../types/postExercise";

export const ExerciseApi = typedApiWrapper({
  // with fetch, property assignment style
  getExercises: (): Promise<GetExercises> => fetch("https://example-api.com").then((res) => res.json()),
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

Note the naming convention in the example above.

- The name of the type file is the same as the name of the **api method called**.

- The name of the type itself is the same as the name of the api method but in **pascal case**.

## Run Example

- Clone the repo
- Navigate to example folder from terminal
- install dependencies
- start the app: `yarn start`


## React Native or Expo
For this to work with React native or Expo, make sure you follow their guide on how to enable api calls to localhost

## Limitations

- Cannot generate enums from response.

- Cannot extend type from different type files. If the response from a call contains object that is similar to another type in another file, it cannot extend it. A new type will be generated in the new file.

- Cannot give custom file names or type names. File name and type name is solely based on the name of the api method.

- Once a type has been generated for an api call, the type will not update with new api calls. You need to delete the previous generated type file to generate a new one.

*This library only serves to help you get started quickly and reduce time spent adding types to api calls. You might need to make some updates to the generated types sometimes. It does not solve all your type problems.*

## Common Errors

``Error: Could not find a directory at the specified path:``

If you have a ***`rootDir`*** in your tsconfig, then make sure your ***`typePath`*** and ***`apiPath`*** reside there.

## Contributions

Please feel free to contribute and improve this library
