# GenericInfo Class Documentation

The `GenericInfo` class provides a set of methods for working with JSON data stored in files.

## Installation

To use the `GenericInfo` class in your project, you can install it via npm:

```bash
npm install fs
```

## Usage

First, import the `GenericInfo` class into your project:

```javascript
import GenericInfo from "./path/to/GenericInfo.js";
```

Then, create an instance of the `GenericInfo` class:

```javascript
const info = new GenericInfo({ filepath: "data.json" });
```

## Constructor

The `GenericInfo` constructor accepts an options object with the following properties:

- `filepath`: The path to the JSON file. If not provided, the class will use a default path.
- `basename` (optional): The base name for the JSON file. If provided, it will be appended with a `.json` extension.

## Methods

### Getter and Setter

Provides getter and setter methods for accessing and modifying data in the JSON file.

#### `set(key, newValue)`

Sets a value for a key in the JSON data.

- `key`: The key to set.
- `newValue`: An object containing new properties to be set.

```javascript
info.set("name", { value: "John Doe" });
console.log(info.get("name")); // Output: { value: "John Doe" }
```

#### `get(key)`

Gets the value associated with a key in the JSON data.

- `key`: The key to retrieve.

```javascript
const name = info.get("name");
console.log(name); // Output: { value: "John Doe" }
```

### Other Methods

The following methods are also available:

#### `toString()`

Returns a formatted string representation of the JSON data.

```javascript
const dataString = info.toString();
console.log(dataString);
```

#### `delete(key)`

Deletes a specific key from the JSON data.

- `key`: The key to be deleted.

```javascript
info.delete("name");
```

#### `map(callback)`

Maps over the JSON data and applies a callback function to each element.

- `callback`: A function to be applied to each element.

```javascript
info.map((value, key) => console.log(`${key}: ${value}`));
```
#### `iterate(callback)`

Iterates over the JSON data and applies a callback function to each element.

- `callback`: A function to be applied to each element.

```javascript
info.iterate((value, key) => console.log(`${key}: ${value}`));
```

#### `async iterateAsync(callback)`

Iterates over the JSON data and applies a callback function to each element.

- `callback`: A function to be applied to each element.

```javascript
info.iterateAsync(async(value, key) => {
  someAsyncOperation(value);
});
```

#### `filter(callback)`

Filters the JSON data based on a callback function.

- `callback`: A function used to test each element.

```javascript
const filteredData = info.filter((value, key) => key === "name");
console.log(filteredData); // Output: { "name": { value: "John Doe" } }
```

#### `findKey(callback)`

Finds the key of an element in the JSON data based on a callback function.

- `callback`: A function used to test each element.

```javascript
const key = info.findKey((value, key) => value.value === "John Doe");
console.log(key); // Output: name
```

#### `find(callback)`

Finds an element in the JSON data based on a callback function.

- `callback`: A function used to test each element.

```javascript
const element = info.find((value, key) => key === "name");
console.log(element); // Output: { value: "John Doe" }
```

#### `some(callback)`

Checks if any element in the JSON data meets a condition.

- `callback`: A function used to test each element.

```javascript
const hasName = info.some((value, key) => key === "name");
console.log(hasName); // Output: true
```

#### `every(callback)`

Checks if all elements in the JSON data meet a condition.

- `callback`: A function used to test each element.

```javascript
const allHaveName = info.every((value, key) => key === "name");
console.log(allHaveName); // Output: false
```

#### `reduce(callback, initialValue)`

Reduces the JSON data to a single value using a callback function.

- `callback`: A function used to accumulate values.
- `initialValue`: The initial value of the accumulator.

```javascript
const totalAge = info.reduce((acc, value) => acc + value.age, 0);
console.log(totalAge); // Output: 0
```

#### `async waitPromise(returnValue)`

Waits for promises to resolve and returns their values.

- `returnValue`: An array containing promises.

This method is internally used by other methods like `map` or `filter` to wait for promises to resolve before continuing the operation.

```javascript
let filteredUsers = info.map(async(val, key) => {
  return someAsyncOperation(val);
});

filteredUsers = await info.waitPromise(filteredUsers);
```

#### `has(key)`

Checks if a key exists in the JSON data.

- `key`: The key to check.

```javascript
const hasAge = info.has("age");
console.log(hasAge); // Output: false
```

#### `getAll()`

Gets all the JSON data.

```javascript
const allData = info.getAll();
console.log(allData);
```

## Save and Load File

It's recommended to use the `saveFile` and `loadFile` methods at the end of your operations to ensure data integrity.

```javascript
info.saveFile();
info.loadFile();
```

## Example

```javascript
const info = new GenericInfo({ filepath: "data.json" });
info.set("name", { value: "John Doe" });
console.log(info.get("name")); // Output: { value: "John Doe" }
```

## License

This project is licensed under the MIT License - this project belongs to Liane Cagara 