# ember-test-waiters

This addon provides APIs to allow [@ember/test-helpers](https://github.com/emberjs/ember-test-helpers/) to play nicely with other asynchronous
events, such as an application that is waiting for a CSS3
transition or an IndexDB transaction. Waiters runs periodically
after each async helper (i.e. `click`, `andThen`, `visit`, etc) has executed,
until a predetermined condition is met. After the waiters finish, the next async helper
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

### TestWaiter class

The `TestWaiter` class is, in most cases, all you will need to wait for async operations to complete before continuing tests.

```
import Component from '@ember/component';
import { TestWaiter } from 'ember-test-waiters';

let waiter = DEBUG && new TestWaiter('friend-waiter');
  let waiter = new TestWaiter('friend-waiter');
}

export default class Friendz extends Component {
  didInsertElement() {
    waiter.beginAsync(this);

    someAsyncWork().then(() => {
      waiter.endAsync(this);
    });
  }
}
```

### Waiting on all waiters

The `ember-test-waiters` addon provides a `waiter-manager` to register, unregister, iterate and invoke waiters to determine if we should wait for conditions to be met or continue test execution. This functionality is encapsulated in the `hasPendingWaiters` function, which evaluates each registered waiter to determine its current state.

```
import { hasPendingWaiters } from 'ember-test-waiters';

//...

if (hasPendingWaiters()) {
  // keep going in our tests
};
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
