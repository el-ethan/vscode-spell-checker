#!/usr/bin/env node
/**
 * This file was copied from vscode-languageserver `installServerIntoExtension.js`
 */

 /* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const cp = require('child_process');

const usage = 'Usage: ./installServer.js targetDir package.json tsconfig.json [package-lock.json | npm-shrinkwrap.json]';

let targetDirectory = process.argv[2];
if (!targetDirectory) {
	console.error('No extension directory provided.');
    console.error(usage);
	process.exit(1)
}
targetDirectory = path.resolve(targetDirectory)
if (!fs.existsSync(path.dirname(targetDirectory))) {
    console.error('Target directory ' + path.dirname(targetDirectory) + ' doesn\'t exist on disk.');
    console.error(usage);
	process.exit(1);
}

let packageFile = process.argv[3];
if (!packageFile) {
	console.error('No package.json file provided.');
    console.error(usage);
	process.exit(1);
}
packageFile = path.resolve(packageFile);
if (!fs.existsSync(packageFile)) {
	console.error('Package file ' + packageFile + ' doesn\'t exist on disk.');
    console.error(usage);
	process.exit(1);
}
let tsconfigFile = process.argv[4];
if (!tsconfigFile) {
	console.error('No tsconfig.json file provided');
    console.error(usage);
	process.exit(1);
}
tsconfigFile = path.resolve(tsconfigFile);
if (!fs.existsSync(tsconfigFile)) {
	console.error('tsconfig file ' + tsconfigFile + ' doesn\'t exist on disk.')
    console.error(usage);
	process.exit(1);
}

const serverDirectory = targetDirectory

const json = require(tsconfigFile);
const compilerOptions = json.compilerOptions;
if (compilerOptions) {
	const outDir = compilerOptions.outDir;
	if (!outDir || path.join(path.dirname(tsconfigFile), outDir) !== serverDirectory) {
		console.error('outDir in ' + process.argv[4] + ' must point to ' + serverDirectory + ' but it points to ' + path.join(path.dirname(tsconfigFile), outDir));
		console.error('Please change outDir in ' + process.argv[4] + ' to ' + path.relative(path.dirname(tsconfigFile), serverDirectory).replace(/\\/g, '/'));
        console.error(usage);
		process.exit(1);
	}
}

if (!fs.existsSync(serverDirectory)) {
	fs.mkdirSync(serverDirectory);
}

const dest = path.join(serverDirectory, 'package.json');
console.log('Copying package.json to server\'s location...');
fs.writeFileSync(dest, fs.readFileSync(packageFile));

let shrinkwrapFile = process.argv[5];
if (fs.existsSync(shrinkwrapFile)) {
	const shrinkWrapDest = path.join(serverDirectory, 'npm-shrinkwrap.json');
	shrinkwrapFile = path.resolve(shrinkwrapFile);
	console.log('Copying npm-shrinkwrap.json to server\'s location...');
	fs.writeFileSync(shrinkWrapDest, fs.readFileSync(shrinkwrapFile));

}

console.log('Updating server npm modules into server\'s location...');
cp.execSync('npm update --production --prefix ' + serverDirectory);
