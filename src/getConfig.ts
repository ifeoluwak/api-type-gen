import * as fs from 'fs';

export type Config = {
  objectType: 'interface' | 'type';
  fetchType: 'fetch' | 'axios';
  typePath: string;
  apiPath: string;
};

export const getConfig = (): Config => {
  // Read the content of package.json
  const packageJsonContent = fs.readFileSync('./package.json', 'utf8');

  // Parse the JSON data
  const pjson = JSON.parse(packageJsonContent);

  let axlib = pjson?.axlib || {};
  axlib.objectType = axlib.objectType || 'interface';
  axlib.typePath = axlib.typePath;
  axlib.apiPath = axlib.apiPath;
  axlib.fetchType = axlib.fetchType;
  return axlib;
};
