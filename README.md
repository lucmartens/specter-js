# specter-js

Javascript implementation of clojure's [specter](https://github.com/nathanmarz/specter) library

## Operations

- select
- selectOne
- transform
- setval

## Navigators

### ALL

The `ALL` navigator navigates to every element in an array or key/value pair in an object. `ALL` can transform to `NONE` to remove elements.

```javascript
s.select(s.ALL, [1, 2, 3]);
[1, 2, 3];

s.select(s.ALL, { a: 1, b: 2 });
[["a", 1], ["b", 2]];

s.transform(s.ALL, increment, [1, 2, 3]);
[2, 3, 4];
```

## MAP_VALS

The `MAP_VALS` navigator navigates to every value in an object. `MAP_VALS` can transform to `NONE` to remove entries.

```javascript
s.select(s.MAP_VALS, { a: 1, b: 2 });
[1, 2];

s.transform(s.MAP_VALS, increment, { a: 1, b: 2 });
{ a: 2, b: 3 };
```

## MAP_KEYS

The `MAP_KEYS` navigator navigates to every key in an object. `MAP_KEYS` can transform to `NONE` to remove entries.

```javascript
s.select(s.MAP_KEYS, { a: 1, b: 2 });
["a", "b"];

s.transform(s.MAP_KEYS, v => v + "x", { a: 1, b: 2 });
{ ax: 1, bx: 2 };
```

# Examples

Increment all values in object of objects:

```javascript
const data = { a: { aa: 1 }, b: { ba: 1, bb: 2 } };
s.transform([s.MAP_VALS, s.MAP_VALS], v => v + 1, data);
// { a: { aa: 2 }, b: { ba: 2, bb: 3 } };
```

Increment all even values for "a" keys in a array of objects:

```javascript
const data = [{ a: 1 }, { a: 2 }, { a: 4 }, { a: 3 }];
s.transform([s.ALL, "a", v => v % 2 === 0], v => v + 1, data);
// [{ a: 1 }, { a: 3 }, { a: 5 }, { a: 3 }];
```

Select all numbers divisible by 3 from a array of arrays:

```javascript
const data = [[1, 2, 3, 4], [], [5, 3, 2, 18], [2, 4, 6], [12]];
s.select([s.ALL, s.ALL, v => v % 3 === 0]);
// [3, 3, 18, 6, 12]
```

Increment the last odd number in a array:

```javascript
const data = [2, 1, 3, 6, 9, 4, 8];
s.transform([s.filterer(v => v % 2 !== 0), s.LAST], v => v + 1, data);
// [2, 1, 3, 6, 10, 4, 8]
```

Remove undefined from a nested array:

```javascript
const data = { a: [1, undefined, 2], b: [undefined, 1] };
s.setval([s.MAP_VALS, s.ALL, v => v === undefined], s.NONE, data);
// { a: [1, 2], b: [1] }
```

Remove key value pair from a nested object:

```javascript
const data = { a: { b: { c: 1 } } };
s.setval(["a", "b", "c"], s.NONE, data);
// {a: {b: {}}}
```

Concatenate array to every nested array of arrays:

```javascript
const data = [[1], [1, 2], ["c"]];
s.setval([s.ALL, s.END], ["a", "b"], data);
// [[1, "a", "b"], [1, 2, "a", "b"], ["c", "a", "b"]];
```
