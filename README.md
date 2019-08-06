# jsed
better sed, with js regexes &amp; functions

Installation: `npm install -g @ariabuckles/jsed`

Usage:

```
jsed <search> <replacer>

Options:
  -V, --version     output the version number
  -f --file <file>  a file which to process; otherwise processes stdin
  -a --text         interpret the search arg as a string rather than a regex
  -s --string       interpret the replacer as a string even if it looks like a function
  -o --output       optional file to write to; otherwise writes to stdout
  -h, --help        output usage information
```

Examples:

```
> echo "use basic strings" | jsed "basic" "literal"
use literal strings
```

```
> echo "use regexes or funcs" | jsed '/\w+/g' "word=>'aaa'"
aaa aaa aaa aaa
```
