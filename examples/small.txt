## Hash function

## File format

- 0..31 - tail length
    - tl
    - array of hashes (each 28 bytes or 224 bits)
- 32 - data

## Base32

[Crockford's_Base32](https://en.wikipedia.org/wiki/Base32#Crockford's_Base32)

- string 225 bits or 45 charcters
- last bit is used as a parity bit (format LE)
- from hash to string

## Get

- input parameters:
    - `root` string Base 32 hash
    - `file` output file

1. read file `cdt0/${root}`
2. if the first byte is 32, than copy all other bytes to `file` and return
3. otherwise, read and remember tail
4. read all hashes and apply the same algorithm for each hash by converting the hash to base32 and add underscore at the begining