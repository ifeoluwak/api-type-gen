#!/usr/bin/env node

import yargs from 'yargs'
import { initialise } from "./initializer.js";

const argv = yargs(process.argv.slice(2)).parse()

if (argv.init) {
  initialise();
}