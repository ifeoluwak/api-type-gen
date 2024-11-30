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

  let lib = pjson["realtime-api-types"] || {};
  lib.objectType = lib.objectType || 'interface';
  lib.typePath = lib.typePath;
  lib.apiPath = lib.apiPath;
  lib.fetchType = lib.fetchType;
  return lib;
};
