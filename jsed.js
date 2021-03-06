#!/usr/bin/env node
"use strict";
const fs = require('fs');
const commander = require('commander');

const package_ = require('./package.json');

commander.version(package_.version);
commander.usage('<search> <replacer>');
commander.option('-f --file [file]', 'a file which to process; otherwise processes stdin');
commander.option('-a --text', 'interpret the search arg as a string rather than a regex')
commander.option('-s --string', 'interpret the replacer as a string even if it looks like a function');
commander.option('-o --output [file]', 'optional file to write to; otherwise writes to stdout');

const isExplicitHelpRequest = process.argv.some((opt) => opt === '-h' || opt === '--help');

commander.on('--help', () => {
  if (!isExplicitHelpRequest) {
    return; // Just show usage information
  }
  console.log(`
Examples:

echo "use basic strings" | jsed "basic" "literal"
echo "use regexes or funcs" | jsed '/\w+/g' "word=>'aaa'"
echo "use regexes without /s" | jsed '(regexes)' 'cool $1'
jsed -of test.txt 'modify a file' 'in-place'
`);
});

commander.parse(process.argv);
if (commander.args.length < 2) {
  commander.help(); // exits
}

const searchArg = commander.args[0];
const replacerArg = commander.args[1];

let search = searchArg;
if (!commander.text) {
  try {
    let searchRegex = eval(searchArg);
    if (searchRegex instanceof RegExp) {
      search = searchRegex;
    }
  } catch (e) {
    // ignore eval error
  }
  if (search === searchArg) {
    search = new RegExp(searchArg, 'gm');
  }
}

let replacer = () => replacerArg;
if (!commander.string) {
  replacer = replacerArg; // Use js's built in $&, $1-$n etc.
  try {
    let replacerFunc = eval('(' + replacerArg + ')');
    if (typeof replacerFunc === 'function') {
      replacer = replacerFunc;
    }
  } catch (e) {
    // Ignore eval error; leave replacer alone
  }
}

// Allow `jsed -of file.txt 'hi' 'bye'` to modify the file in-place
const infile = (typeof commander.file === 'string')
    ? commander.file
    : commander.file && (typeof commander.output === 'string')
    ? commander.output
    : 0; // 0 is stdin
const outfile = (typeof commander.output === 'string')
    ? commander.output
    : commander.output && (typeof commander.file === 'string')
    ? commander.file
    : 1; // 1 is stdout

const source = fs.readFileSync(infile, 'utf8');

let modified = source;
if (typeof search === 'string') {
  do {
    let prev = modified;
    modified = modified.replace(search, replacer);
  } while (modified !== prev);
} else {
  modified = source.replace(search, replacer);
}

if (outfile === 1) {
  console.log(modified.replace(/\n$/, '')); // remove trailing newline; console.log re-inserts it
} else {
  fs.writeFileSync(outfile, modified, 'utf8');
}
