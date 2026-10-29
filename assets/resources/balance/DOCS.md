# CurrencyHandler Class
**Author**: Liane Cagara

A class to handle currency management for users.

## Constructor

### Parameters

- `filepath` (String): The file path to store the currency data.

### Example

```javascript
const CurrencyHandler = require('./path/to/CurrencyHandler');

const currencyHandler = new CurrencyHandler({ filepath: "/path/to/currency/data.json" });
```

## Methods

### `loadFile()`

Loads currency data from the specified file path.

### Example

```javascript
const currencyData = currencyHandler.loadFile();
console.log(currencyData);
```

### `saveFile(data)`

Saves currency data to the specified file path.

- `data` (Object): The currency data to save.

### Example

```javascript
const newData = { user1: { currency: 100 }, user2: { currency: 200 } };
currencyHandler.saveFile(newData);
```

### `getCurrency(userKey)`

Gets the currency balance for a user.

- `userKey` (String): The unique key for the user.

### Example

```javascript
const userCurrency = currencyHandler.getCurrency('user1');
console.log(userCurrency); // Output: 100
```

### `earn(userKey, amount)`

Adds currency to a user's balance.

- `userKey` (String): The unique key for the user.
- `amount` (Number): The amount of currency to add.

### Example

```javascript
currencyHandler.earn('user1', 50);
```

### `spend(userKey, amount)`

Spends currency from a user's balance.

- `userKey` (String): The unique key for the user.
- `amount` (Number): The amount of currency to spend.

### Example

```javascript
const success = currencyHandler.spend('user1', 30);
if (success) {
  console.log('Purchase successful');
} else {
  console.log('Insufficient funds');
}
```

### `transfer(senderKey, receiverKey, amount)`

Transfers currency from one user to another.

- `senderKey` (String): The unique key for the sender.
- `receiverKey` (String): The unique key for the receiver.
- `amount` (Number): The amount of currency to transfer.

### Example

```javascript
const success = currencyHandler.transfer('user1', 'user2', 20);
if (success) {
  console.log('Transfer successful');
} else {
  console.log('Insufficient funds or invalid user');
}
```

### `setInfo(userKey, newInfo)`

Sets additional information for a user.

- `userKey` (String): The unique key for the user.
- `newInfo` (Object): The new information to set for the user.

### Example

```javascript
const newInfo = { level: 10, premium: true };
currencyHandler.setInfo('user1', newInfo);
```

### `getInfo(userKey)`

Gets additional information for a user.

- `userKey` (String): The unique key for the user.

### Example

```javascript
const userInfo = currencyHandler.getInfo('user1');
console.log(userInfo);
```

---
