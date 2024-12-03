type FunctionType<T> = (...args: any[]) => Promise<T>;

type ObjectType<T> = {
  [key in keyof T]: FunctionType<T[key]>;
};

const typedApiWrapper = <T>(obj: ObjectType<T>) => {
  let newObj: ObjectType<T> = {} as ObjectType<T>;
  for (const key in obj) {
    if (typeof obj[key] === 'function') {
      newObj[key] = typedApi(obj[key]);
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

const typedApi = <T>(fn: FunctionType<T>) => {
  return async (...args: any[]) => {
    const typeName = fn.name;

    let data;
    let isFetch = false;

    const response = await fn(...args);
    if (response) {
        // means this is a fetch request
        if (response instanceof Response) {
            isFetch = true;
            // fetch request does not throw error on 404, so we need to handle it
            // @ts-ignore
            if (!response.ok) {
              // @ts-ignore
              throw new Error(`Response status: ${response.status}`);
            }
            // @ts-ignore
            data = await response.json();
        }
        else {
            // @ts-ignore
            data = response?.data;
        }
        if (data) {
          setTimeout(() => {
            fetch(`http://localhost:4141/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: typeName,
                    data: data,
                }),
            });
        }, 1000);
        }
    }
    return isFetch ? data : response;
  };
};

export { typedApiWrapper };