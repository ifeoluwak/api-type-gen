import * as fs from 'fs';
import { getConfig } from './getConfig.js';
import { Emitter, NopWriter, StreamWriter } from 'generate-ts-types';

export const generateType = (
  newTypeFile: string,
  data: unknown,
  typeName: string
) => {
  let interfaceWriter = new NopWriter();
  let proxyWriter = interfaceWriter;

  // get package.json
  const config = getConfig();
  const path = config.typePath;


  if (newTypeFile) {
    const filePath = `./${path}/${newTypeFile}`;
    interfaceWriter = new StreamWriter(fs.createWriteStream(filePath));
  } else {
    return;
  }

  const e = new Emitter(interfaceWriter, proxyWriter, config?.objectType);
  e.emit(data, typeName);
};
