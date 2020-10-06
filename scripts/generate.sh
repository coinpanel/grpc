#!/bin/sh

npx pbjs -t static-module -w commonjs -o types.js ../../proto/$ROOT_PROTO_FILENAME && pbts -o types.d.ts types.js;
