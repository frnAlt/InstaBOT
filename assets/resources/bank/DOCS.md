# BankHandler Class

A class to handle banking operations for users.
**Author**: Liane Cagara

## Constructor

### Parameters

- `filepath` (String): The file path to store the banking data.

### Example

```javascript
import BankHandler from './path/to/BankHandler';

const bankHandler = new BankHandler({ filepath: "/path/to/banking/data.json" });
```

## Methods

### `loadFile()`

Loads banking data from the specified file path.

### Example

```javascript
const bankingData = bankHandler.loadFile();
console.log(bankingData);
```

### `saveFile(data)`

Saves banking data to the specified file path.

- `data` (Object): The banking data to save.

### Example

```javascript
const newData = { user1: { balance: 100 }, user2: { balance: 200 } };
bankHandler.saveFile(newData);
```

### `register(userKey, initialBalance = 0)`

Registers a new user with an optional initial balance.

- `userKey` (String): The unique key for the user.
- `initialBalance` (Number): The initial balance for the user (default is 0).

### Example

```javascript
bankHandler.register('user1', 100);
```

### `getBalance(userKey)`

Gets the balance for a user.

- `userKey` (String): The unique key for the user.

### Example

```javascript
const userBalance = bankHandler.getBalance('user1');
console.log(userBalance); // Output: 100
```

### `deposit(userKey, amount)`

Deposits funds into a user's account.

- `userKey` (String): The unique key for the user.
- `amount` (Number): The amount to deposit.

### Example

```javascript
bankHandler.deposit('user1', 50);
```

### `withdraw(userKey, amount)`

Withdraws funds from a user's account.

- `userKey` (String): The unique key for the user.
- `amount` (Number): The amount to withdraw.

### Example

```javascript
bankHandler.withdraw('user1', 30);
```

### `transfer(senderKey, receiverKey, amount)`

Transfers funds from one user to another.

- `senderKey` (String): The unique key for the sender.
- `receiverKey` (String): The unique key for the receiver.
- `amount` (Number): The amount to transfer.

### Example

```javascript
bankHandler.transfer('user1', 'user2', 20);
```

### `setInfo(userKey, newInfo)`

Sets additional information for a user.

- `userKey` (String): The unique key for the user.
- `newInfo` (Object): The new information to set for the user.

### Example

```javascript
const newInfo = { level: 10, premium: true };
bankHandler.setInfo('user1', newInfo);
```

### `getInfo(userKey)`

Gets additional information for a user.

- `userKey` (String): The unique key for the user.

### Example

```javascript
const userInfo = bankHandler.getInfo('user1');
console.log(userInfo);
```

---
