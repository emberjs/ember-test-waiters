# ember-test-waiters

This addon provides APIs to allow [@ember/test-helpers](https://github.com/emberjs/ember-test-helpers/) to play nicely
with other asynchronous events, such as an application that is waiting for a CSS transition or an IndexDB transaction.
The async helpers inside `@ember/test-helpers` return promises (i.e. `click`, `andThen`, `visit`, etc). Waiters run periodically
after each helper has executed until a predetermined condition is met. After the waiters finish, the next async helper
is executed and the process repeats.

This allows the test suite to pause at deterministic intervals, and helps thread together
the async nature of tests.

## Compatibility

- Ember.js v2.18 or above
- Ember CLI v2.13 or above

## Installation

```
ember install ember-test-waiters
```

## Usage

`ember-test-waiters` uses a minimal API to provide waiting functionality. This minimal API can be composed to accommodate various complex scenarios.

### buildWaiter function

The `buildWaiter` function is, in most cases, all you will need to wait for async operations to complete before continuing tests.

```js
import Component from '@ember/component';
import { buildWaiter } from 'ember-test-waiters';

let waiter = buildWaiter('friend-waiter');

export default class Friendz extends Component {
  didInsertElement() {
    waiter.beginAsync(this);

    someAsyncWork().then(() => {
      waiter.endAsync(this);
    });
  }
}
```

### waitForPromise function

This addon also provides a `waitForPromise` function, which can be used to wrap a promise to register it with the test waiter system.

```js
import Component from '@ember/component';
import { waitForPromise } from 'ember-test-waiters';

export default class MoreFriendz extends Component {
  didInsertElement() {
    waitForPromise(someAsyncWork).then(() => {
      doOtherThings();
    });
  }
}
```

### Waiting on all waiters

The `ember-test-waiters` addon provides a `waiter-manager` to register, unregister, iterate and invoke waiters to determine if we should wait for conditions to be met or continue test execution. This functionality is encapsulated in the `hasPendingWaiters` function, which evaluates each registered waiter to determine its current state.

```
import { hasPendingWaiters } from 'ember-test-waiters';

// ...

let hasPendingWaiters = hasPendingWaiters();

// ...
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
